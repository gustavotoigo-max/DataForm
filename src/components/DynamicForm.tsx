"use client";

import { FormEvent, useMemo, useState } from "react";
import { FormQuestion, formQuestions, getFlatQuestions } from "@/config/formQuestions";

type FormValues = Record<string, string | boolean>;
type SubmitState = "idle" | "submitting" | "success" | "error";

const allQuestions = getFlatQuestions();

const initialValues = allQuestions.reduce<FormValues>((values, question) => {
  values[question.id] = question.type === "checkbox" ? false : "";
  return values;
}, {});

function isExtraFieldVisible(parent: FormQuestion, field: FormQuestion, values: FormValues) {
  const showWhen = "showWhen" in field ? field.showWhen : undefined;
  return !showWhen || values[parent.id] === showWhen;
}

function isMissing(question: FormQuestion, value: string | boolean) {
  return question.type === "checkbox" ? value !== true : !String(value).trim();
}

export function DynamicForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const isSubmitting = submitState === "submitting";
  const firstQuestion = formQuestions[0];
  const firstQuestionValue = firstQuestion ? values[firstQuestion.id] : "";
  const canAnswerRemainingQuestions = Boolean(String(firstQuestionValue).trim());

  const missingRequired = useMemo(
    () =>
      formQuestions.some((question) => {
        if (question.required && isMissing(question, values[question.id])) {
          return true;
        }

        return question.extraFields?.some((field) => {
          if (!field.required || !isExtraFieldVisible(question, field, values)) {
            return false;
          }
          return isMissing(field, values[field.id]);
        });
      }),
    [values]
  );

  function updateValue(id: string, value: string | boolean) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: values })
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível enviar o formulário.");
      }

      setSubmitState("success");
      setMessage(data.message || "Formulário enviado com sucesso.");
      setValues(initialValues);
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o formulário. Tente novamente."
      );
    }
  }

  function renderQuestion(
    question: FormQuestion,
    fieldDisabled: boolean,
    className = ""
  ) {
    const commonProps = {
      id: question.id,
      name: question.id,
      required: question.required,
      disabled: fieldDisabled,
      maxLength: question.maxLength
    };

    return (
      <div
        className={`field field-${question.type}${fieldDisabled ? " field-disabled" : ""}${className}`}
        key={question.id}
      >
        {question.type !== "checkbox" && (
          <div className="label-wrap">
            <label
              aria-describedby={question.helperText ? `${question.id}-helper` : undefined}
              className={question.helperText ? "question-label has-helper" : "question-label"}
              htmlFor={question.id}
              tabIndex={question.helperText ? 0 : undefined}
            >
              {question.label}
              {question.required && <span aria-hidden="true">*</span>}
            </label>
            {question.helperText && (
              <div className="helper-tooltip" id={`${question.id}-helper`} role="tooltip">
                {question.helperText}
              </div>
            )}
          </div>
        )}

        {question.type === "textarea" && (
          <textarea
            {...commonProps}
            placeholder={question.placeholder}
            rows={5}
            value={String(values[question.id])}
            onChange={(event) => updateValue(question.id, event.target.value)}
          />
        )}

        {question.type === "select" && (
          <select
            {...commonProps}
            value={String(values[question.id])}
            onChange={(event) => updateValue(question.id, event.target.value)}
          >
            <option value="">Selecione</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {question.type === "radio" && (
          <div className="option-row" role="radiogroup" aria-labelledby={`${question.id}-label`}>
            <span id={`${question.id}-label`} className="sr-only">
              {question.label}
            </span>
            {question.options?.map((option) => (
              <label className="option-pill" key={option}>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  required={question.required}
                  disabled={fieldDisabled}
                  checked={values[question.id] === option}
                  onChange={(event) => updateValue(question.id, event.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === "checkbox" && (
          <label className="checkbox-line" htmlFor={question.id}>
            <input
              {...commonProps}
              type="checkbox"
              checked={Boolean(values[question.id])}
              onChange={(event) => updateValue(question.id, event.target.checked)}
            />
            <span>
              {question.label}
              {question.required && <strong aria-hidden="true">*</strong>}
            </span>
          </label>
        )}

        {["text", "email", "tel"].includes(question.type) && (
          <>
            <input
              {...commonProps}
              type={question.type}
              placeholder={question.placeholder}
              value={String(values[question.id])}
              onChange={(event) => updateValue(question.id, event.target.value)}
            />
            {question.maxLength && (
              <span className="character-count">
                {String(values[question.id]).length}/{question.maxLength}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <div className="question-grid">
        {formQuestions.map((question, index) => {
          const isFirstQuestion = index === 0;
          const fieldDisabled =
            isSubmitting || (!isFirstQuestion && !canAnswerRemainingQuestions);

          return (
            <div className="question-group" key={question.id}>
              {renderQuestion(question, fieldDisabled)}
              {question.extraFields?.map((field) => {
                if (!isExtraFieldVisible(question, field, values)) {
                  return null;
                }

                return renderQuestion(field, fieldDisabled, " field-extra");
              })}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <p className={`status-message status-${submitState}`} aria-live="polite">
          {isSubmitting ? "Gerando PDF e enviando e-mail..." : message}
        </p>
        <button type="submit" disabled={isSubmitting || missingRequired}>
          {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
          <span>{isSubmitting ? "Enviando..." : "Enviar formulário"}</span>
        </button>
      </div>
    </form>
  );
}
