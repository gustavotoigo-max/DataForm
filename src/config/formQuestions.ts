export type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "number"
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
  helperText?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  extraFields?: ExtraField[];
};

export type ExtraField = FormQuestion & {
  showWhen?: string;
  showWhenAnswered?: boolean;
};

export const formTitle = "Formulário de Diagnóstico";
export const formSubtitle = "Preencha as informações abaixo detalhadamente.";

export const formQuestions: FormQuestion[] = [
  {
    id: "contato",
    label: "Contato",
    type: "text",
    required: true,
    placeholder: "",
    maxLength: 30,
    helperText:
      "Informe uma identificação para este formulário. Pode ser nome, e-mail, telefone, número da OS ou qualquer referência curta."
  },
  {
    id: "modeloServidor",
    label: "Modelo/marca do servidor",
    type: "text",
    required: false,
    placeholder: "Ex: Dell PowerEdge R740, HP ProLiant DL380..."
  },
  {
    id: "tipoRaid",
    label: "Tipo de RAID",
    type: "radio",
    required: true,
    options: ["RAID 0", "RAID 1", "RAID 5", "RAID 6", "RAID 10", "RAID 50", "OUTRO"],
    extraFields: [
      {
        id: "quantidadeDiscos",
        label: "Número de discos",
        type: "number",
        required: true,
        showWhenAnswered: true,
        min: 2,
        max: 100,
        placeholder: ""
      },
      {
        id: "tipoRaidOutro",
        label: "Qual tipo de RAID?",
        type: "text",
        required: false,
        showWhen: "OUTRO",
        placeholder: "Digite o tipo",
        maxLength: 20
      }
    ]
  },
  {
    id: "discoRemovido",
    label: "1) Algum disco foi removido do RAID array e/ou não foi enviado?",
    type: "radio",
    required: true,
    options: ["Sim", "Não"],
    extraFields: [
      {
        id: "discosNaoEnviados",
        label: "Informe quais discos, ou quantos discos não foram enviados",
        type: "textarea",
        required: false,
        showWhen: "Sim",
        placeholder: "Ex: Disco 0, Disco 4, etc."
      }
    ]
  },
  {
    id: "hotSpare",
    label: "2) Existia algum disco de Hot-spare?",
    type: "radio",
    required: true,
    options: ["Sim", "Não"],
    helperText:
      "Hot-spare é um HD sobressalente que fica sem ser utilizado no RAID até que algum HD apresente problema, e quando isso acontece é adicionado ao RAID automaticamente.",
    extraFields: [
      {
        id: "quantidadeHotSpare",
        label: "Quantos discos de Hot-spare existiam?",
        type: "text",
        required: false,
        showWhen: "Sim",
        placeholder: "Ex: 1, 2, 3..."
      }
    ]
  },
  {
    id: "historicoProblema",
    label:
      "3) Favor detalhar como ocorreu o problema no RAID e quais ações foram tomadas.",
    type: "textarea",
    required: false,
    placeholder: "Digite sua resposta",
    helperText:
      "Exemplo: O servidor apresentou falha no dia 13 e, após isso, tentamos remontar o RAID com o próprio departamento de TI, mas sempre parava. Solicitamos então visita do suporte da DELL e recebemos visita do técnico da Dell no dia 14, quando este substituiu um dos discos com defeito e tentou remontar o RAID com sistema de rebuild, sem sucesso. Após isso, procuramos a Datarestore."
  },
  {
    id: "tentativaRecuperacao",
    label: "4) Existiu alguma tentativa de recuperação de dados?",
    type: "radio",
    required: true,
    options: ["Sim", "Não"],
    helperText:
      "Considere tentativas com comandos, programas, troca de placa, abertura de HD, softwares de recuperação ou qualquer outro procedimento.",
    extraFields: [
      {
        id: "detalheTentativaRecuperacao",
        label: "Detalhe comandos, programas e procedimentos utilizados",
        type: "textarea",
        required: false,
        showWhen: "Sim",
        placeholder:
          "Informe se houve algum procedimento físico, como troca de placa ou abertura de HD. Informe também softwares utilizados, onde os dados foram salvos e se houve gravação no próprio RAID."
      }
    ]
  },
  {
    id: "sistemaArquivos",
    label: "5) Qual o sistema de arquivos utilizado?",
    type: "radio",
    required: true,
    options: ["Windows (NTFS/FAT)", "Linux (Ext, etc)"],
    extraFields: [
      {
        id: "detalheSistemaArquivos",
        label: "Detalhes adicionais sobre partições, tamanhos, sistema e observações",
        type: "textarea",
        required: false,
        placeholder:
          "Exemplo: Sistema NTFS, distribuído mais ou menos assim:\n\nDRIVE | TAMANHO | SISTEMA | OBSERVAÇÕES\nC: | 50GB | NTFS | Sistema operacional\nD: | 400GB | NTFS | Sistema de Contabilidade\nE: | 1,45TB | NTFS | Dados dos usuários"
      }
    ]
  },
  {
    id: "arquivosRecuperar",
    label:
      "6) Liste os caminhos dos arquivos que deseja recuperar, pode também listar os tipos de arquivos. .mdb, .gdb etc.",
    type: "textarea",
    required: false,
    placeholder: "Digite sua resposta",
    helperText:
      "Liste pelo menos 5 caminhos ou nomes. Quanto mais detalhado, melhor. Se for banco de dados, informe o nome completo, a versão, o tamanho aproximado e a última data de modificação.\n\nExemplos:\nD:\\Users\\Server\\Documentos\\Planilhas do Financeiro\\Fluxo de caixa.xls\nD:\\Users\\Server\\Documentos\\RH\\currículos a avaliar.doc\nD:\\Users\\Server\\Desktop\\Contratos\\Contrato de expansão.pdf\nD:\\Users\\Server\\Imagens\\Minhas Fotos\\*.jpg\nTodos os e-mails do Microsoft Outlook do usuário \"Server\""
  },
  {
    id: "detalhesAdicionais",
    label:
      "7) Informe mais detalhes, como VMs ou outros tipos de sistemas. Qualquer detalhe neste contexto é importante.",
    type: "textarea",
    required: false,
    placeholder: "Digite sua resposta",
    helperText:
      "Exemplos: nomes de máquinas virtuais, hypervisor utilizado, sistemas críticos, bancos de dados, serviços, aplicações, versões, caminhos importantes ou qualquer contexto técnico adicional."
  }
];

export function getFlatQuestions() {
  return formQuestions.flatMap((question) => [
    question,
    ...(question.extraFields || [])
  ]);
}
