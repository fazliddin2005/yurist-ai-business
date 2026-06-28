// b2b/routes/templates.js
// Smart Contract Lifecycle Management (CLM) -- B2B mijozlar o'zlarining
// shartnoma shablonlarini yaratadi, tahrirlaydi, versiyalaydi. Har bir
// tahrirda yangi versiya saqlanadi (eski versiyalar yo'qolmaydi -- bu CLM
// uchun majburiy talab: "kim, qachon, nimani o'zgartirdi" tarixi).
const express = require('express');
const { Template, TemplateVersion } = require('../../models');
const { requireAuth } = require('../../routes/auth');
const ws = require('../workspace');
const { logActivity, ACTION_TYPES } = require('../../activityLog');

const router = express.Router();

router.use(requireAuth);
router.use('/:workspaceId', ws.requireWorkspaceAccess());

// GET /api/b2b/templates/:workspaceId -- workspace shablonlari ro'yxati
router.get('/:workspaceId', async (req, res) => {
  try {
    const all = await Template.find({ organizationId: req.workspace.id }).sort({ updatedAt: -1 });
    res.json({ templates: all });
  } catch (e) {
    console.error('[templates/list] xato:', e);
    res.status(500).json({ error: 'Shablonlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/b2b/templates/:workspaceId/:templateId -- shablon + barcha versiyalari
router.get('/:workspaceId/:templateId', async (req, res) => {
  try {
    const tpl = await Template.findOne({ _id: req.params.templateId, organizationId: req.workspace.id });
    if (!tpl) return res.status(404).json({ error: 'Shablon topilmadi' });
    const versions = await TemplateVersion.find({ templateId: tpl.id }).sort({ versionNumber: -1 });
    res.json({ template: tpl, versions });
  } catch (e) {
    console.error('[templates/get] xato:', e);
    res.status(500).json({ error: 'Shablonni yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/templates/:workspaceId -- yangi shablon yaratish (kamida 'member')
router.post('/:workspaceId', ws.requireWorkspaceAccess('member'), async (req, res) => {
  try {
    const { name, category, body, placeholders } = req.body;
    if (!name || !body) return res.status(400).json({ error: 'name va body talab qilinadi' });

    const tpl = await Template.create({
      organizationId: req.workspace.id,
      name,
      category: category || 'Umumiy',
      placeholders: placeholders || [],
      currentVersion: 1,
      status: 'active',
      createdBy: req.user.id,
    });
    await TemplateVersion.create({
      templateId: tpl.id, versionNumber: 1, body,
      editedBy: req.user.id, changeNote: 'Birinchi versiya',
    });
    logActivity({
      type: ACTION_TYPES.B2B_TEMPLATE_CREATED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceName: req.workspace.name, category: tpl.category },
    });
    res.status(201).json({ template: tpl });
  } catch (e) {
    console.error('[templates/create] xato:', e);
    res.status(500).json({ error: 'Shablon yaratishda xato yuz berdi' });
  }
});

// PUT /api/b2b/templates/:workspaceId/:templateId -- shablonni tahrirlash (YANGI VERSIYA yaratadi)
router.put('/:workspaceId/:templateId', ws.requireWorkspaceAccess('member'), async (req, res) => {
  try {
    const { body, changeNote } = req.body;
    if (!body) return res.status(400).json({ error: 'body talab qilinadi' });

    const tpl = await Template.findOne({ _id: req.params.templateId, organizationId: req.workspace.id });
    if (!tpl) return res.status(404).json({ error: 'Shablon topilmadi' });

    const nextVersion = tpl.currentVersion + 1;
    await TemplateVersion.create({
      templateId: tpl.id, versionNumber: nextVersion, body,
      editedBy: req.user.id, changeNote: changeNote || `Versiya ${nextVersion}`,
    });
    tpl.currentVersion = nextVersion;
    await tpl.save();
    res.json({ template: tpl, versionNumber: nextVersion });
  } catch (e) {
    console.error('[templates/update] xato:', e);
    res.status(500).json({ error: 'Shablonni yangilashda xato yuz berdi' });
  }
});

// POST /api/b2b/templates/:workspaceId/:templateId/fill -- AVTOMATIK TO'LDIRISH
router.post('/:workspaceId/:templateId/fill', ws.requireWorkspaceAccess('member'), async (req, res) => {
  try {
    const { values } = req.body;
    const tpl = await Template.findOne({ _id: req.params.templateId, organizationId: req.workspace.id });
    if (!tpl) return res.status(404).json({ error: 'Shablon topilmadi' });

    const latest = await TemplateVersion.findOne({ templateId: tpl.id, versionNumber: tpl.currentVersion });
    if (!latest) return res.status(404).json({ error: 'Shablon versiyasi topilmadi' });

    let filled = latest.body;
    Object.entries(values || {}).forEach(([key, val]) => {
      filled = filled.replaceAll(`{{${key}}}`, String(val ?? ''));
    });
    const missing = [...filled.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);

    res.json({ filledBody: filled, missingFields: [...new Set(missing)] });
  } catch (e) {
    console.error('[templates/fill] xato:', e);
    res.status(500).json({ error: 'Shablonni to\'ldirishda xato yuz berdi' });
  }
});

// POST /api/b2b/templates/:workspaceId/ai-draft -- AI YORDAMIDA SHABLON LOYIHASI
// Foydalanuvchi {{joy_nomi}} sintaksisini o'zi yozishi SHART EMAS -- oddiy,
// tabiiy tilda (haqiqiy ismlar bilan bo'lsa ham) shartnoma matnini yozadi,
// AI o'zi qaysi qismlar har safar o'zgarishi kerakligini (ism, sana, summa,
// manzil va h.k.) aniqlab, ularni {{snake_case}} formatida belgilab beradi.
// NATIJA TO'G'RIDAN-TO'G'RI SAQLANMAYDI -- frontend buni oddiy "Yangi shablon"
// formasiga (tahrirlash mumkin bo'lgan holatda) qaytaradi, foydalanuvchi
// "Yaratish"ni bossagina haqiqiy shablon paydo bo'ladi.
router.post('/:workspaceId/ai-draft', ws.requireWorkspaceAccess('member'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Matn kiritilmadi' });
    }
    // KREDIT: bu OpenAI chaqiruvi haqiqiy xarajat keltiradi -- B2C hujjat
    // yaratish bilan bir xil narx (1 kredit), umumiy shaxsiy balansdan.
    if (req.user.credits < 1) {
      return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "AI yordamchisi hozircha ulanmagan (.env faylida OPENAI_API_KEY yo'q). Shablonni qo'lda yaratishingiz mumkin.",
      });
    }

    const systemPrompt = `Sen shartnoma shabloni tuzish bo'yicha yordamchisan. Foydalanuvchi senga oddiy, tabiiy tilda yozilgan shartnoma matni yoki tasvirini beradi (ba'zan haqiqiy ismlar, raqamlar bilan birga).

VAZIFANG:
1. Bu matnni professional, band-bandli shartnoma shabloniga aylantir.
2. Qaysi qismlar HAR SAFAR boshqacha bo'lishi mumkin bo'lsa (tomonlarning ismi, sanalar, summalar, manzillar, muddatlar, lavozimlar va h.k.) -- ularni ANIQ matn o'rniga {{snake_case_nomi}} formatidagi o'zgaruvchiga almashtir (masalan {{xodim_ismi}}, {{ish_haqi}}, {{sana}}). O'zgaruvchi nomlari lotin harflarida, pastki chiziq bilan, qisqa va tushunarli bo'lsin.
3. Doimiy/standart qonuniy band-bandlarni (huquq-majburiyatlar, javobgarlik, bekor qilish tartibi va h.k.) ham qo'sh, agar matnda ular yo'q bo'lsa -- shartnoma to'liq va professional ko'rinishi uchun.
4. Shablonning qisqa nomi va kategoriyasini ham taklif qil.
5. Javobni FAQAT quyidagi JSON formatida qaytar, boshqa hech qanday matn (izoh, markdown belgilari) qo'shma:
{"name": "qisqa shablon nomi", "category": "kategoriya (masalan: Mehnat, Ko'chmas mulk, Moliyaviy)", "body": "to'liq shablon matni, {{...}} bilan"}`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      console.error('[templates/ai-draft] OpenAI xatosi:', resp.status, errBody.slice(0, 300));
      return res.status(502).json({ error: 'AI yordamchisidan javob olishda xato yuz berdi' });
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return res.status(502).json({ error: 'AI bo\'sh javob qaytardi' });

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('[templates/ai-draft] AI javobini JSON sifatida o\'qib bo\'lmadi:', raw.slice(0, 300));
      return res.status(502).json({ error: "AI javobini o'qib bo'lmadi -- qaytadan urinib ko'ring" });
    }

    if (!parsed.body) {
      return res.status(502).json({ error: "AI shablon matnini yarata olmadi -- qaytadan urinib ko'ring" });
    }

    logActivity({
      type: ACTION_TYPES.B2B_TEMPLATE_CREATED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceName: req.workspace.name, via: 'ai-draft' },
    });

    req.user.credits = Math.max(0, req.user.credits - 1);
    await req.user.save();

    res.json({
      name: parsed.name || '',
      category: parsed.category || '',
      body: parsed.body,
      creditsLeft: req.user.credits,
    });
  } catch (e) {
    console.error('[templates/ai-draft] xato:', e);
    res.status(500).json({ error: 'AI bilan shablon tayyorlashda kutilmagan xato yuz berdi' });
  }
});

// PATCH /api/b2b/templates/:workspaceId/:templateId/archive -- shablonni arxivlash
router.patch('/:workspaceId/:templateId/archive', ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const updated = await Template.findOneAndUpdate(
      { _id: req.params.templateId, organizationId: req.workspace.id },
      { status: 'archived' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Shablon topilmadi' });
    res.json({ template: updated });
  } catch (e) {
    console.error('[templates/archive] xato:', e);
    res.status(500).json({ error: 'Shablonni arxivlashda xato yuz berdi' });
  }
});

module.exports = router;
