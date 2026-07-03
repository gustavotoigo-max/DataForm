import { DynamicForm } from "@/components/DynamicForm";
import { formSubtitle, formTitle } from "@/config/formQuestions";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="form-title">
        <header className="form-header">
          <div className="header-copy">
            <div className="brand-logo">
              <img src="/logo.webp" alt="Datarestore Recuperação de Dados" />
            </div>
            <h1 id="form-title">{formTitle}</h1>
            <p>{formSubtitle}</p>
          </div>
        </header>

        <DynamicForm />
      </section>
    </main>
  );
}
