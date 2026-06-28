// docxBuilder.js — buildSections() natijasidan haqiqiy .docx fayl yaratadi.
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle,
} = require('docx');
const { buildSections } = require('./contractText');

function buildSignatureTable(s) {
  const colCell = (label, name) =>
    new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      },
      children: [
        new Paragraph({ children: [new TextRun({ text: `${label}:`, bold: true })] }),
        new Paragraph({ text: name || '________________' }),
        new Paragraph({ text: ' ' }),
        new Paragraph({ text: 'Manzil: ______________________' }),
        new Paragraph({ text: 'Pasport: _______________' }),
        new Paragraph({ text: "Imzo: ____________  M.O'." }),
      ],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [colCell(s.col1.label, s.col1.name), colCell(s.col2.label, s.col2.name)],
      }),
    ],
  });
}

async function generateDocxBuffer(doc) {
  const sections = buildSections(doc);
  const children = [];

  sections.forEach((s) => {
    if (s.type === 'h1') {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: s.text.toUpperCase(), bold: true, size: 30 })],
      }));
    } else if (s.type === 'h2') {
      children.push(new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: s.text, bold: true, size: 26 })],
      }));
    } else if (s.type === 'p') {
      children.push(new Paragraph({
        alignment: s.align === 'right' ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
        children: [new TextRun({ text: s.text, bold: !!s.bold, size: 23 })],
      }));
    } else if (s.type === 'sig') {
      children.push(new Paragraph({ text: ' ', spacing: { before: 300 } }));
      children.push(buildSignatureTable(s));
    }
  });

  const document = new Document({
    sections: [{
      properties: {},
      children,
    }],
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 23 } },
      },
    },
  });

  return Packer.toBuffer(document);
}

module.exports = { generateDocxBuffer };
