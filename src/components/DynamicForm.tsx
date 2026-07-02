"use client";

import { FormEvent, useMemo, useState } from "react";
import { formQuestions } from "@/config/formQuestions";

type FormValues = Record<string, string | boolean>;
type SubmitState = "idle" | "submitting" | "success" | "error";

const initialValues = formQuestions.reduce<FormValues>((values, question) => {
  values[question.id] = question.type === "checkbox" ? false : "";
  return values;
}, {});

export function DynamicForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const isSubmitting = submitState === "submitting";

  const missingRequired = useMemo(
    () =>
      formQuestions.some((question) => {
        if (!question.required) return false;
        const value = values[question.id];
        return question.type === "checkbox" ? value !== true : !String(value).trim();
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
        throw new Error(data.message || "Nao foi possivel enviar o formulario.");
      }

      setSubmitState("success");
      setMessage(data.message || "Formulario enviado com sucesso.");
      setValues(initialValues);
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o formulario. Tente novamente."
      );
    }
  }

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <div className="question-grid">
        {formQuestions.map((question) => {
          const commonProps = {
            id: question.id,
            name: question.id,
            required: question.required,
            disabled: isSubmitting
          };

          return (
            <div
              className={`field field-${question.type}`}
              key={question.id}
            >
              {question.type !== "checkbox" && (
                <label htmlFor={question.id}>
                  {question.label}
                  {question.required && <span aria-hidden="true">*</span>}
                </label>
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
                        disabled={isSubmitting}
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
                <input
                  {...commonProps}
                  type={question.type}
                  placeholder={question.placeholder}
                  value={String(values[question.id])}
                  onChange={(event) => updateValue(question.id, event.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <p className={`status-message status-${submitState}`} aria-live="polite">
          {message}
        </p>
        <button type="submit" disabled={isSubmitting || missingRequired}>
          {isSubmitting ? "Enviando..." : "Enviar formulario"}
        </button>
      </div>
    </form>
  );
}
