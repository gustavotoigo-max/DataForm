import { DynamicForm } from "@/components/DynamicForm";
import { formSubtitle, formTitle } from "@/config/formQuestions";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="form-title">
        <header className="form-header">
          <div className="logo-slot" aria-label="Espaco para logotipo">
            <img src="/logo-placeholder.svg" alt="Logotipo" />
          </div>
          <div className="header-copy">
            <p className="eyebrow">Envio seguro com PDF</p>
            <h1 id="form-title">{formTitle}</h1>
            <p>{formSubtitle}</p>
          </div>
        </header>

        <DynamicForm />
      </section>
    </main>
  );
}
