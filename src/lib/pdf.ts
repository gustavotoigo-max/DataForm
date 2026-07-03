import PDFDocument from "pdfkit";
import { ExtraField, FormQuestion, formQuestions } from "@/config/formQuestions";

type AnswerValue = string | boolean;
export type AnswerMap = Record<string, AnswerValue>;

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

function printAnswer(doc: PDFKit.PDFDocument, label: string, answer: AnswerValue) {
  doc
    .fontSize(11)
    .fillColor("#4b5563")
    .text(label, { continued: false });

  doc
    .fontSize(13)
    .fillColor("#111827")
    .text(String(formatAnswer(answer)), {
      width: 500
    });
}

export async function createAnswersPdf(answers: AnswerMap) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(20)
      .fillColor("#101b2b")
      .text("Formulário recebido", { align: "left" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#606b7a")
      .text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);

    doc.moveDown(1.5);

    formQuestions.forEach((question, index) => {
      if (index > 0) {
        doc.moveDown(0.8);
      }

      printAnswer(doc, question.label, answers[question.id]);

      question.extraFields?.forEach((field) => {
        if (!shouldPrintExtraField(question, field, answers)) {
          return;
        }

        doc.moveDown(0.45);
        printAnswer(doc, field.label, answers[field.id]);
      });
    });

    doc.end();
  });
}
