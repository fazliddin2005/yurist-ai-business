// server/textExtraction.js
// Hujjat fayllaridan (TXT/PDF/DOCX) HAQIQIY matn ajratish.
//
// MUHIM TARIX: avval bu yerda PDF/DOCX uchun "buffer.toString('utf-8')" kabi
// soddalashtirilgan (noto'g'ri) usul ishlatilgan -- PDF/DOCX binar/siqilgan
// formatlar bo'lgani uchun, bu usul deyarli har doim chalkash, o'qib bo'lmas
// matn berardi. Natijada AI Risk Audit HAQIQIY, professional shartnomalarni
// ham "o'qib bo'lmaydi" yoki noto'g'ri xavfli deb baholardi -- garchi
// qoidalar (riskEngine.js) o'zi to'g'ri ishlasa ham, ularga to'g'ri matn
// yetib bormagani uchun natija yomon chiqardi.
//
// Endi haqiqiy parserlar ishlatiladi: PDF uchun "pdf-parse" (PDF.js asosida),
// DOCX uchun "mammoth". Ikkisi ham 50-60 betlik haqiqiy hujjatlarni to'liq,
// kirill/lotin harflari bilan to'g'ri o'qiydi.
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_PDF_PAGES = 200; // haddan tashqari katta faylni cheksiz qayta ishlamaslik uchun xavfsizlik chegarasi

/**
 * Fayl buferi va MIME/nomidan haqiqiy matnni ajratadi.
 * @returns {Promise<{text: string, method: string, pages?: number, warning?: string}>}
 */
async function extractText(buffer, mimetype, filename) {
  const mime = (mimetype || '').toLowerCase();
  const fname = (filename || '').toLowerCase();

  // ---- TXT ----
  if (mime.includes('text') || fname.endsWith('.txt')) {
    return { text: buffer.toString('utf-8'), method: 'txt' };
  }

  // ---- DOCX ----
  if (mime.includes('officedocument.wordprocessingml') || fname.endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value || '', method: 'docx' };
    } catch (e) {
      console.error('[textExtraction] DOCX o\'qishda xato:', e.message);
      return { text: '', method: 'docx-failed', warning: 'DOCX faylni o\'qib bo\'lmadi' };
    }
  }

  // ---- Eski .doc (binar Word, 2003 va undan oldingi) -- mammoth buni
  // o'qiy olmaydi (faqat .docx tushunadi). Ochiq tan olamiz, taxmin qilmaymiz.
  if (mime.includes('msword') || fname.endsWith('.doc')) {
    return { text: '', method: 'doc-unsupported', warning: 'Eski .doc format qo\'llab-quvvatlanmaydi -- iltimos, .docx yoki PDF formatda yuklang' };
  }

  // ---- PDF ----
  if (mime.includes('pdf') || fname.endsWith('.pdf')) {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText({ first: MAX_PDF_PAGES });
      const warning = result.total > MAX_PDF_PAGES
        ? `Hujjat ${result.total} betdan iborat -- birinchi ${MAX_PDF_PAGES} bet tahlil qilindi`
        : undefined;
      return { text: result.text || '', method: 'pdf', pages: result.total, warning };
    } catch (e) {
      console.error('[textExtraction] PDF o\'qishda xato:', e.message);
      return { text: '', method: 'pdf-failed', warning: 'PDF faylni o\'qib bo\'lmadi -- fayl buzilgan yoki parol bilan himoyalangan bo\'lishi mumkin' };
    }
  }

  // ---- Noma'lum format ----
  return { text: '', method: 'unsupported', warning: 'Fayl turi qo\'llab-quvvatlanmaydi -- .txt, .pdf yoki .docx yuklang' };
}

module.exports = { extractText };
