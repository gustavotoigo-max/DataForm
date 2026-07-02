import { NextRequest, NextResponse } from "next/server";
import { formQuestions } from "@/config/formQuestions";
import { sendFormEmail } from "@/lib/email";
import { AnswerMap, createAnswersPdf } from "@/lib/pdf";

export const runtime = "nodejs";

const RECIPIENT_EMAILS = [
  "destinatario1@exemplo.com",
  "destinatario2@exemplo.com"
];

function sanitizeValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, 3000);
}

function validateAnswers(rawAnswers: unknown) {
  if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    return { error: "Dados invalidos." };
  }

  const source = rawAnswers as Record<string, unknown>;
  const answers: AnswerMap = {};

  for (const question of formQuestions) {
    const value = sanitizeValue(source[question.id]);

    if (question.required) {
      const missing = question.type === "checkbox" ? value !== true : !String(value).trim();
      if (missing) {
        return { error: `Campo obrigatorio: ${question.label}.` };
      }
    }

    if ((question.type === "select" || question.type === "radio") && value) {
      if (!question.options?.includes(String(value))) {
        return { error: `Opcao invalida para: ${question.label}.` };
      }
    }

    answers[question.id] = value;
  }

  return { answers };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { answers?: unknown };
    const validation = validateAnswers(payload.answers);

    if ("error" in validation) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const pdf = await createAnswersPdf(validation.answers);

    await sendFormEmail({
      to: RECIPIENT_EMAILS,
      subject: process.env.EMAIL_SUBJECT || "Novo formulario recebido",
      text: "Um novo formulario foi enviado. O PDF com perguntas e respostas esta anexado.",
      pdf
    });

    return NextResponse.json({
      message: "Formulario enviado com sucesso."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message:
          "Nao foi possivel enviar o formulario agora. Verifique a configuracao de e-mail."
      },
      { status: 500 }
    );
  }
}
