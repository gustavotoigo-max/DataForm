import { NextRequest, NextResponse } from "next/server";
import { ExtraField, FormQuestion, formQuestions } from "@/config/formQuestions";
import { sendFormEmail } from "@/lib/email";
import { AnswerMap, createAnswersPdf } from "@/lib/pdf";

export const runtime = "nodejs";

function sanitizeValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, 3000);
}

function getRecipientEmails() {
  const value = process.env.EMAIL_TO;

  if (!value) {
    throw new Error("Variável de ambiente ausente: EMAIL_TO");
  }

  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function buildEmailSubject(answers: AnswerMap) {
  const baseSubject = process.env.EMAIL_SUBJECT || "Novo formulário recebido";
  const contact = String(answers.contato || "").trim();

  return contact ? `${baseSubject} - ${contact}` : baseSubject;
}

function shouldValidateExtraField(parent: FormQuestion, field: ExtraField, answers: AnswerMap) {
  if (field.showWhenAnswered) return Boolean(String(answers[parent.id]).trim());
  return !field.showWhen || answers[parent.id] === field.showWhen;
}

function validateQuestion(question: FormQuestion, value: string | boolean) {
  if (question.required) {
    const missing = question.type === "checkbox" ? value !== true : !String(value).trim();
    if (missing) {
      return `Campo obrigatório: ${question.label}.`;
    }
  }

  if (typeof value === "string" && question.maxLength && value.length > question.maxLength) {
    return `O campo "${question.label}" deve ter no máximo ${question.maxLength} caracteres.`;
  }

  if (question.type === "number" && value !== "") {
    const number = Number(value);
    if (!Number.isInteger(number)) {
      return `O campo "${question.label}" deve conter apenas um número inteiro.`;
    }
    if (question.min !== undefined && number < question.min) {
      return `O campo "${question.label}" deve ser no mínimo ${question.min}.`;
    }
    if (question.max !== undefined && number > question.max) {
      return `O campo "${question.label}" deve ser no máximo ${question.max}.`;
    }
  }

  if ((question.type === "select" || question.type === "radio") && value) {
    if (!question.options?.includes(String(value))) {
      return `Opção inválida para: ${question.label}.`;
    }
  }

  return null;
}

function validateAnswers(rawAnswers: unknown) {
  if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    return { error: "Dados inválidos." };
  }

  const source = rawAnswers as Record<string, unknown>;
  const answers: AnswerMap = {};

  for (const question of formQuestions) {
    const value = sanitizeValue(source[question.id]);
    const error = validateQuestion(question, value);

    if (error) {
      return { error };
    }

    answers[question.id] = value;

    for (const field of question.extraFields || []) {
      const extraValue = sanitizeValue(source[field.id]);

      if (!shouldValidateExtraField(question, field, answers)) {
        answers[field.id] = "";
        continue;
      }

      const extraError = validateQuestion(field, extraValue);

      if (extraError) {
        return { error: extraError };
      }

      answers[field.id] = extraValue;
    }
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
      to: getRecipientEmails(),
      subject: buildEmailSubject(validation.answers),
      text: "Um novo formulário foi enviado. O PDF com perguntas e respostas está anexado.",
      pdf
    });

    return NextResponse.json({
      message: "Formulário enviado com sucesso."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message:
          "Não foi possível enviar o formulário agora. Verifique a configuração de e-mail."
      },
      { status: 500 }
    );
  }
}
