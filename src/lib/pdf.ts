import PDFDocument from "pdfkit";
import { formQuestions } from "@/config/formQuestions";

type AnswerValue = string | boolean;
export type AnswerMap = Record<string, AnswerValue>;

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
      .text("Formulario recebido", { align: "left" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#606b7a")
      .text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);

    doc.moveDown(1.5);

    formQuestions.forEach((question, index) => {
      const rawAnswer = answers[question.id];
      const answer =
        typeof rawAnswer === "boolean" ? (rawAnswer ? "Sim" : "Nao") : rawAnswer || "Nao informado";

      if (index > 0) {
        doc.moveDown(0.8);
      }

      doc
        .fontSize(11)
        .fillColor("#4b5563")
        .text(question.label, { continued: false });

      doc
        .fontSize(13)
        .fillColor("#111827")
        .text(String(answer), {
          width: 500
        });
    });

    doc.end();
  });
}
