# Sistema de Pontos Discord Bot

Este repositório contém um bot simples do Discord que envia uma mensagem de cadastro com um botão. Ao clicar, o usuário fornece e-mail e WhatsApp em um formulário integrado, que é enviado para o n8n através de um webhook.

## Configuração
1. Abra o arquivo `.env` e preencha as variáveis `DISCORD_TOKEN`, `CADASTRE_SE_ID`, `CADASTRE_SE_WEBHOOK` e outras se necessário.

As variáveis usam sublinhado `_`, não hífen `-`. Caso algum dos valores não
esteja definido (por exemplo `CADASTRE_SE_ID`), o bot encerrará informando
2. Instale as dependências com `npm install` (requer acesso à internet).
3. Execute `npm start` para iniciar o bot. O servidor HTTP será iniciado na porta definida em `PORT` (padrão `9090`).

O bot envia a mensagem no canal definido em `CADASTRE_SE_ID` quando inicia. Ao clicar em **Cadastre-se**, o usuário fornece os dados de contato que são enviados para o webhook configurado em `CADASTRE_SE_WEBHOOK`.
Se `BOT_INVITE_URL` estiver definido, a página inicial do servidor exibe um link para convidar o bot.

## Docker

Este projeto inclui um `Dockerfile`. Para criar uma imagem e executar o bot
em um contêiner, utilize:

```bash
docker build -t system-points .
docker run --env-file .env system-points
```

Certifique-se de fornecer um arquivo `.env` com todas as variáveis de
ambiente necessárias.
