export type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

export type FormQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export const formTitle = "Formulario de Atendimento";
export const formSubtitle =
  "Preencha as informacoes abaixo. Ao finalizar, um PDF sera enviado automaticamente para a equipe cadastrada.";

export const formQuestions: FormQuestion[] = [
  {
    id: "nome",
    label: "Nome completo",
    type: "text",
    required: true,
    placeholder: "Digite seu nome"
  },
  {
    id: "email",
    label: "E-mail",
    type: "email",
    required: true,
    placeholder: "voce@exemplo.com"
  },
  {
    id: "telefone",
    label: "Telefone",
    type: "tel",
    required: true,
    placeholder: "(00) 00000-0000"
  },
  {
    id: "tipoSolicitacao",
    label: "Tipo de solicitacao",
    type: "select",
    required: true,
    options: ["Comercial", "Suporte", "Financeiro", "Outro"]
  },
  {
    id: "urgencia",
    label: "Nivel de urgencia",
    type: "radio",
    required: true,
    options: ["Baixa", "Media", "Alta"]
  },
  {
    id: "autorizaContato",
    label: "Autorizo contato por e-mail ou telefone",
    type: "checkbox",
    required: true
  },
  {
    id: "mensagem",
    label: "Mensagem",
    type: "textarea",
    required: true,
    placeholder: "Descreva sua solicitacao"
  }
];
