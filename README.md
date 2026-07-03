# Formulário com PDF por e-mail

Site de uma página com formulário responsivo. Ao enviar, o backend gera um PDF com perguntas e respostas e manda o arquivo para uma lista fixa de destinatários cadastrada no código.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Onde editar perguntas

Edite `src/config/formQuestions.ts`. Para adicionar uma pergunta, inclua um novo item no array `formQuestions`.

## Onde editar destinatários

Edite `RECIPIENT_EMAILS` em `src/app/api/submit/route.ts`.

## Variaveis no Vercel

Cadastre no painel do Vercel:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_SUBJECT` opcional

Esses valores ficam apenas no backend. O navegador nunca recebe a lista de destinatários nem as credenciais SMTP.
