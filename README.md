# Formulário com PDF por e-mail

Site de uma página com formulário responsivo. Ao enviar, o backend gera um PDF com perguntas e respostas e manda o arquivo por e-mail para os destinatários configurados nas variáveis de ambiente.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Onde editar perguntas

Edite `src/config/formQuestions.ts`. Para adicionar uma pergunta, inclua um novo item no array `formQuestions`.

## Variáveis no Vercel

Cadastre no painel do Vercel:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`
- `EMAIL_SUBJECT` opcional

`EMAIL_TO` controla quem recebe o formulário. Para mais de um destinatário, use vírgula:

```env
EMAIL_TO=sac@datarestore.com.br,laboratorio@datarestore.com.br
```

O assunto do e-mail usa `EMAIL_SUBJECT` e adiciona automaticamente o valor do campo `Contato`.
