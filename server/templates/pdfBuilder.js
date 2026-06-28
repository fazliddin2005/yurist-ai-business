// pdfBuilder.js — buildSections() natijasidan haqiqiy PDF fayl yaratadi (server tomonda).
const PDFDocument = require('pdfkit');
const { buildSections } = require('./contractText');

function generatePdfBuffer(doc) {
  return new Promise((resolve, reject) => {
    const sections = buildSections(doc).map((s) => {
      // Standart PDF shriftlarida "№" belgisi uchun glif yo'q -- "No." ga almashtiramiz.
      // AI tomonidan generatsiya qilingan erkin matnlarda bu belgi uchrashi mumkin.
      const clean = (t) => (typeof t === 'string' ? t.replace(/№/g, 'No.') : t);
      const next = { ...s };
      if (next.text) next.text = clean(next.text);
      if (next.col1) next.col1 = { ...next.col1, name: clean(next.col1.name) };
      if (next.col2) next.col2 = { ...next.col2, name: clean(next.col2.name) };
      return next;
    });
    const pdf = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks = [];
    pdf.on('data', (c) => chunks.push(c));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);

    const pageW = pdf.page.width - 56 * 2;

    sections.forEach((s) => {
      if (s.type === 'h1') {
        pdf.font('Times-Bold').fontSize(15);
        pdf.text(s.text.toUpperCase(), { align: 'center' });
        pdf.moveDown(0.6);
      } else if (s.type === 'h2') {
        pdf.moveDown(0.3);
        pdf.font('Times-Bold').fontSize(12.5);
        pdf.text(s.text, { align: 'left' });
        pdf.moveDown(0.2);
      } else if (s.type === 'p') {
        pdf.font(s.bold ? 'Times-Bold' : 'Times-Roman').fontSize(11.5);
        pdf.text(s.text, { align: s.align === 'right' ? 'right' : 'justify', width: pageW });
        pdf.moveDown(0.25);
      } else if (s.type === 'sig') {
        pdf.moveDown(1);
        const colW = pageW / 2 - 10;
        const startY = pdf.y;
        pdf.font('Times-Bold').fontSize(11);
        pdf.text(`${s.col1.label}:`, 56, startY, { width: colW });
        pdf.font('Times-Roman').text(s.col1.name || '________________', { width: colW });
        pdf.text(' ');
        pdf.text('Manzil: ______________________', { width: colW });
        pdf.text('Pasport: _______________', { width: colW });
        pdf.text('Imzo: ____________  M.O\'.', { width: colW });
        const afterCol1Y = pdf.y;

        pdf.font('Times-Bold').fontSize(11);
        pdf.text(`${s.col2.label}:`, 56 + colW + 20, startY, { width: colW });
        pdf.font('Times-Roman').text(s.col2.name || '________________', { width: colW });
        pdf.text(' ');
        pdf.text('Manzil: ______________________', { width: colW });
        pdf.text('Pasport: _______________', { width: colW });
        pdf.text('Imzo: ____________  M.O\'.', { width: colW });
        const afterCol2Y = pdf.y;

        pdf.x = 56;
        pdf.y = Math.max(afterCol1Y, afterCol2Y) + 10;
      }
    });

    pdf.end();
  });
}

module.exports = { generatePdfBuffer };
