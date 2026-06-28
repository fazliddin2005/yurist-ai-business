// admin/routes.js
// ============================================================================
// SUPER ADMIN PANEL backend -- platforma egasi uchun statistika va faollik
// jurnali. MAXFIYLIK QOIDASI: bu yo'llar HECH QACHON quyidagilarni qaytarmaydi:
//   - parol xeshlari
//   - AI chat savol/javob matni
//   - hujjat/shartnoma matni (faqat turi/kategoriyasi)
//   - shaxsiy hujjat tarkibi
// Faqat statistik METADATA (kim, qachon, qancha) ko'rsatiladi.
// ============================================================================
const express = require('express');
const rateLimit = require('express-rate-limit');
const { User, Document, Organization, Member } = require('../models');
const { checkPassword, signAdminToken, requireAdminAuth, isAdminConfigured } = require('./auth');
const { getRecentActivity, getActivityInRange, ACTION_TYPES } = require('../activityLog');
const { getAccuracyOverview } = require('../accuracyMetrics');
const { listAllVersions, getVersionByNumber, createNewVersion } = require('../termsManager');
const SecurityIncident = require('../models/SecurityIncident');

const router = express.Router();

// ---- ADMIN LOGIN UCHUN QATTIQROQ ZO'RLAB KIRISH HIMOYASI ----
// Admin panel eng nozik kirish nuqtasi -- shuning uchun oddiy login'dan
// (15 daqiqada 10 marta) qattiqroq: 15 daqiqada faqat 5 marta urinish.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Juda ko'p urinish. Iltimos, 15 daqiqadan keyin qaytadan urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admin/login -- { password }
router.post('/login', adminLoginLimiter, (req, res) => {
  if (!isAdminConfigured()) return res.status(404).json({ error: 'Topilmadi' });
  const { password } = req.body;
  if (!checkPassword(password)) {
    return res.status(401).json({ error: "Parol noto'g'ri" });
  }
  res.json({ token: signAdminToken() });
});

router.use(requireAdminAuth);

// GET /api/admin/overview -- umumiy statistika (kartochkalar uchun)
router.get('/overview', async (req, res) => {
  try {
    const [users, documents, b2bDocuments, workspaces, allActivity] = await Promise.all([
      User.find().select('createdAt'),
      Document.countDocuments({ scope: 'b2c' }),
      Document.countDocuments({ scope: 'b2b' }),
      Organization.find().select('plan createdAt'),
      getRecentActivity(100000),
    ]);

    const purchases = allActivity.filter((a) => a.type === ACTION_TYPES.CREDIT_PURCHASED);

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsersToday = users.filter((u) => new Date(u.createdAt) >= dayAgo).length;
    const newUsersWeek = users.filter((u) => new Date(u.createdAt) >= weekAgo).length;
    const newUsersMonth = users.filter((u) => new Date(u.createdAt) >= monthAgo).length;

    const recentActivity = await getActivityInRange(weekAgo);
    const activeUserIds = new Set(recentActivity.filter((a) => a.userId).map((a) => String(a.userId)));

    const totalCreditsRevenue = purchases.reduce((sum, p) => sum + (p.meta?.amount || 0), 0);

    res.json({
      users: {
        total: users.length,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
        activeThisWeek: activeUserIds.size,
      },
      documents: {
        b2cTotal: documents,
        b2bTotal: b2bDocuments,
      },
      workspaces: {
        total: workspaces.length,
        byPlan: workspaces.reduce((acc, w) => { acc[w.plan || 'trial'] = (acc[w.plan || 'trial'] || 0) + 1; return acc; }, {}),
      },
      revenue: {
        totalCreditsSold: totalCreditsRevenue,
        totalPurchaseEvents: purchases.length,
      },
    });
  } catch (e) {
    console.error('[admin/overview] xato:', e);
    res.status(500).json({ error: 'Statistikani yuklashda xato yuz berdi' });
  }
});

// GET /api/admin/users -- foydalanuvchilar ro'yxati (xavfsiz maydonlar bilan)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    // toJSON() orqali passwordHash avtomatik olib tashlanadi (User modeli transform orqali)
    res.json({ users: users.map((u) => u.toJSON()) });
  } catch (e) {
    console.error('[admin/users] xato:', e);
    res.status(500).json({ error: 'Foydalanuvchilarni yuklashda xato yuz berdi' });
  }
});

// GET /api/admin/users/by-ip?ip=1.2.3.4 -- HUQUQIY DALIL QIDIRUVI.
// Shu IP manzildan rozilik bergan barcha foydalanuvchilarni topadi.
// Foydalanish holati: nizo/da'vo yuzaga kelganda, "qaysi foydalanuvchilar
// shu manzildan kirgan/rozi bo'lgan" deb tekshirish kerak bo'lganda.
router.get('/users/by-ip', async (req, res) => {
  try {
    const ip = (req.query.ip || '').trim();
    if (!ip) return res.status(400).json({ error: 'ip parametri talab qilinadi' });
    const users = await User.find({ termsAcceptedIp: ip }).sort({ termsAcceptedAt: -1 });
    res.json({ users: users.map((u) => u.toJSON()), searchedIp: ip });
  } catch (e) {
    console.error('[admin/users-by-ip] xato:', e);
    res.status(500).json({ error: 'IP bo\'yicha qidirishda xato yuz berdi' });
  }
});

// GET /api/admin/activity -- so'nggi faollik jurnali (filtrlash bilan)
router.get('/activity', async (req, res) => {
  try {
    const { type, limit } = req.query;
    let activity = await getRecentActivity(Number(limit) || 200);
    if (type) activity = activity.filter((a) => a.type === type);
    res.json({ activity, actionTypes: ACTION_TYPES });
  } catch (e) {
    console.error('[admin/activity] xato:', e);
    res.status(500).json({ error: 'Faollik jurnalini yuklashda xato yuz berdi' });
  }
});

// GET /api/admin/workspaces -- B2B tashkilotlar ro'yxati
router.get('/workspaces', async (req, res) => {
  try {
    const workspaces = await Organization.find().sort({ createdAt: -1 });
    const list = await Promise.all(workspaces.map(async (w) => {
      const memberCount = await Member.countDocuments({ organizationId: w.id });
      const json = w.toJSON();
      json.memberCount = memberCount;
      return json;
    }));
    res.json({ workspaces: list });
  } catch (e) {
    console.error('[admin/workspaces] xato:', e);
    res.status(500).json({ error: 'Tashkilotlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/admin/accuracy -- RAGAS-uslubidagi aniqlik metrikasi
// Query: ?days=30 (standart -- so'nggi 30 kun)
router.get('/accuracy', async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const overview = await getAccuracyOverview(sinceDate);
    res.json({ ...overview, periodDays: days });
  } catch (e) {
    console.error('[admin/accuracy] xato:', e);
    res.status(500).json({ error: 'Aniqlik metrikasini yuklashda xato yuz berdi' });
  }
});

// GET /api/admin/terms-versions -- BARCHA shartlar versiyalari ro'yxati
// (huquqiy dalil arxivi). Har bir versiya HECH QACHON o'chirilmagan yoki
// tahrirlanmagan -- bu yerda "1.0 versiyasida nima yozilgan edi" degan
// savolga aniq javob beriladi.
router.get('/terms-versions', async (req, res) => {
  try {
    const versions = await listAllVersions();
    // Ro'yxat ko'rinishida har bir versiyaning to'liq matnini yubormaymiz
    // (juda katta bo'ladi) -- faqat metadata. To'liq matn alohida so'rovda olinadi.
    const list = versions.map((v) => ({
      id: v.id, version: v.version, isCurrent: v.isCurrent,
      changeNote: v.changeNote, publishedAt: v.publishedAt,
      languagesCount: Object.keys(v.content || {}).length,
    }));
    res.json({ versions: list });
  } catch (e) {
    console.error('[admin/terms-versions] xato:', e);
    res.status(500).json({ error: "Shartlar versiyalarini yuklashda xato yuz berdi" });
  }
});

// GET /api/admin/terms-versions/:version -- ANIQ bir versiyaning TO'LIQ
// matnini (barcha tillarda) olish. Bu -- huquqiy dalil so'ralganda
// ishlatiladigan asosiy endpoint: "1.0 versiyasida aniq nima yozilgan
// edi?" degan savolga to'liq, o'zgarmagan javob.
router.get('/terms-versions/:version', async (req, res) => {
  try {
    const versionDoc = await getVersionByNumber(req.params.version);
    if (!versionDoc) return res.status(404).json({ error: 'Bu versiya topilmadi' });
    res.json({ version: versionDoc.version, isCurrent: versionDoc.isCurrent,
      changeNote: versionDoc.changeNote, publishedAt: versionDoc.publishedAt,
      content: versionDoc.content });
  } catch (e) {
    console.error('[admin/terms-version-detail] xato:', e);
    res.status(500).json({ error: "Versiya matnini yuklashda xato yuz berdi" });
  }
});

// POST /api/admin/terms-versions -- YANGI versiya yaratish.
// Body: { version, content, changeNote }
// DIQQAT: bu funksiya faqat yangi yozuv QO'SHADI -- eski versiyalarga
// HECH QACHON tegmaydi. Versiya raqami takrorlanmasligi SHART.
router.post('/terms-versions', async (req, res) => {
  try {
    const { version, content, changeNote } = req.body;
    if (!version || !content) return res.status(400).json({ error: 'version va content talab qilinadi' });
    const created = await createNewVersion({ version, content, changeNote });
    res.status(201).json({ version: created.version, isCurrent: created.isCurrent, publishedAt: created.publishedAt });
  } catch (e) {
    console.error('[admin/terms-versions-create] xato:', e);
    res.status(400).json({ error: e.message || 'Yangi versiya yaratishda xato yuz berdi' });
  }
});

// GET /api/admin/incidents -- barcha xavfsizlik hodisalari ro'yxati
router.get('/incidents', async (req, res) => {
  try {
    const incidents = await SecurityIncident.find().sort({ detectedAt: -1 });
    res.json({ incidents, severityLevels: SecurityIncident.SEVERITY_LEVELS, statuses: SecurityIncident.INCIDENT_STATUSES });
  } catch (e) {
    console.error('[admin/incidents] xato:', e);
    res.status(500).json({ error: 'Hodisalar ro\'yxatini yuklashda xato yuz berdi' });
  }
});

// GET /api/admin/incidents/:id -- bitta hodisaning to'liq tafsiloti (timeline bilan)
router.get('/incidents/:id', async (req, res) => {
  try {
    const incident = await SecurityIncident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Hodisa topilmadi' });
    res.json({ incident });
  } catch (e) {
    console.error('[admin/incident-detail] xato:', e);
    res.status(500).json({ error: 'Hodisani yuklashda xato yuz berdi' });
  }
});

// POST /api/admin/incidents -- yangi xavfsizlik hodisasini qayd etish.
// Body: { title, severity, description, affectedDataTypes, estimatedAffectedCount }
router.post('/incidents', async (req, res) => {
  try {
    const { title, severity, description, affectedDataTypes, estimatedAffectedCount } = req.body;
    if (!title || !severity || !description) {
      return res.status(400).json({ error: 'title, severity va description talab qilinadi' });
    }
    if (!SecurityIncident.SEVERITY_LEVELS.includes(severity)) {
      return res.status(400).json({ error: "Noto'g'ri severity qiymati" });
    }
    const incident = await SecurityIncident.create({
      title, severity, description,
      affectedDataTypes: affectedDataTypes || [],
      estimatedAffectedCount: estimatedAffectedCount || 0,
      status: 'detected',
      timeline: [{ status: 'detected', note: 'Hodisa qayd etildi', at: new Date() }],
    });
    res.status(201).json({ incident });
  } catch (e) {
    console.error('[admin/incident-create] xato:', e);
    res.status(500).json({ error: 'Hodisa yaratishda xato yuz berdi' });
  }
});

// PATCH /api/admin/incidents/:id/status -- hodisa statusini yangilash
// (masalan "investigating" -> "notified" -> "resolved"). Har bir o'zgarish
// timeline'ga yoziladi -- HECH QACHON o'chirilmaydi, faqat qo'shiladi.
// Body: { status, note }
router.patch('/incidents/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!SecurityIncident.INCIDENT_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Noto'g'ri status qiymati" });
    }
    const incident = await SecurityIncident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Hodisa topilmadi' });

    incident.status = status;
    incident.timeline.push({ status, note: note || '', at: new Date() });

    // Muhim sanalarni avtomatik belgilab qo'yamiz -- bu HUQUQIY DALIL
    // sifatida ishlatiladi (qachon organlarga/foydalanuvchilarga xabar
    // berilgani).
    if (status === 'notified' && !incident.usersNotifiedAt) incident.usersNotifiedAt = new Date();
    if (status === 'resolved' && !incident.resolvedAt) incident.resolvedAt = new Date();

    await incident.save();
    res.json({ incident });
  } catch (e) {
    console.error('[admin/incident-status] xato:', e);
    res.status(500).json({ error: 'Statusni yangilashda xato yuz berdi' });
  }
});

// PATCH /api/admin/incidents/:id/notify-authority -- "tegishli davlat
// organiga xabar berildi" sanasini qayd etish (alohida, chunki bu
// foydalanuvchilarga xabar berishdan FARQLI muddat/jarayon).
router.patch('/incidents/:id/notify-authority', async (req, res) => {
  try {
    const incident = await SecurityIncident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Hodisa topilmadi' });
    incident.authorityNotifiedAt = new Date();
    incident.timeline.push({ status: incident.status, note: 'Tegishli davlat organi xabardor qilindi', at: new Date() });
    await incident.save();
    res.json({ incident });
  } catch (e) {
    console.error('[admin/incident-notify-authority] xato:', e);
    res.status(500).json({ error: 'Belgilashda xato yuz berdi' });
  }
});

module.exports = router;
