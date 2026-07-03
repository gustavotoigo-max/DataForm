import { ExtraField, FormQuestion, formQuestions } from "@/config/formQuestions";

type AnswerValue = string | boolean;
export type AnswerMap = Record<string, AnswerValue>;

type PdfPage = {
  content: string[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function formatAnswer(answer: AnswerValue) {
  if (typeof answer === "boolean") {
    return answer ? "Sim" : "Não";
  }

  return answer || "Não informado";
}

function shouldPrintExtraField(parent: FormQuestion, field: ExtraField, answers: AnswerMap) {
  if (field.showWhen && answers[parent.id] !== field.showWhen) {
    return false;
  }

  return field.required || Boolean(String(answers[field.id] || "").trim());
}

function escapePdfString(value: string) {
  return value
    .replace(/[^\u0009\u0020-\u00ff]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function wrapText(value: string, fontSize: number, width: number) {
  const maxChars = Math.max(18, Math.floor(width / (fontSize * 0.52)));
  const paragraphs = String(value).split(/\r?\n/);
  const lines: string[] = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);

    if (!words.length) {
      lines.push("");
      return;
    }

    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;

      if (candidate.length <= maxChars) {
        line = candidate;
        return;
      }

      if (line) {
        lines.push(line);
      }

      line = word;
    });

    if (line) {
      lines.push(line);
    }
  });

  return lines;
}

function colorToRgb(color: string) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function createPdfDocument() {
  const pages: PdfPage[] = [{ content: [] }];
  let currentPage = pages[0];
  let y = PAGE_HEIGHT - MARGIN;

  function addPage() {
    currentPage = { content: [] };
    pages.push(currentPage);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(height: number) {
    if (y - height < MARGIN) {
      addPage();
    }
  }

  function moveDown(amount: number) {
    y -= amount;
  }

  function text(value: string, options: { fontSize: number; color: string; spacing?: number }) {
    const spacing = options.spacing ?? options.fontSize * 1.35;
    const lines = wrapText(value, options.fontSize, CONTENT_WIDTH);

    lines.forEach((line) => {
      ensureSpace(spacing);
      currentPage.content.push(
        `BT /F1 ${options.fontSize} Tf ${colorToRgb(options.color)} rg 1 0 0 1 ${MARGIN.toFixed(
          2
        )} ${y.toFixed(2)} Tm (${escapePdfString(line)}) Tj ET\n`
      );
      y -= spacing;
    });
  }

  return {
    pages,
    moveDown,
    text
  };
}

function buildPdfBuffer(pages: PdfPage[]) {
  const objects: string[] = [];
  const addObject = (value: string) => {
    objects.push(value);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const pageIds: number[] = [];

  pages.forEach((page) => {
    const stream = page.content.join("");
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}endstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pageIds.length} >>`;

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "binary")];
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, "latin1"));
  });

  const xrefOffset = Buffer.concat(chunks).length;
  const xref = [
    `xref\n0 ${objects.length + 1}\n`,
    "0000000000 65535 f \n",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`,
    `startxref\n${xrefOffset}\n%%EOF`
  ].join("");

  chunks.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(chunks);
}

function printAnswer(
  doc: ReturnType<typeof createPdfDocument>,
  label: string,
  answer: AnswerValue
) {
  doc.text(label, { fontSize: 11, color: "#4b5563" });
  doc.text(String(formatAnswer(answer)), { fontSize: 13, color: "#111827" });
}

export async function createAnswersPdf(answers: AnswerMap) {
  const doc = createPdfDocument();

  doc.text("Formulário recebido", { fontSize: 20, color: "#101b2b" });
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, {
    fontSize: 10,
    color: "#606b7a"
  });
  doc.moveDown(18);

  formQuestions.forEach((question, index) => {
    if (index > 0) {
      doc.moveDown(10);
    }

    printAnswer(doc, question.label, answers[question.id]);

    question.extraFields?.forEach((field) => {
      if (!shouldPrintExtraField(question, field, answers)) {
        return;
      }

      doc.moveDown(5);
      printAnswer(doc, field.label, answers[field.id]);
    });
  });

  return buildPdfBuffer(doc.pages);
}
