# Sistema de Pontos Discord Bot

Este repositório contém um bot do Discord para o Sistema de Pontos da Dinastia. O bot possui três funcionalidades principais:

1. **Sistema de Cadastro**: Envia uma mensagem com um botão para cadastro. Ao clicar, o usuário fornece e-mail e WhatsApp em um formulário integrado, que é enviado para o n8n através de um webhook.

2. **Ranking Diário**: Automaticamente busca e publica o ranking diário de pontos às 8h (horário de São Paulo) em um canal específico.

3. **Consulta de Pontos**: Envia uma mensagem com um botão para consulta de pontos. Ao clicar, o usuário recebe seus pontos atuais e posição no ranking, obtidos através de um webhook.

## Configuração
1. Abra o arquivo `.env` e preencha as variáveis necessárias (veja `.env.example` para referência):
   - `DISCORD_TOKEN`: Token do seu bot Discord
   - `CADASTRE_SE_ID`: ID do canal para mensagem de cadastro
   - `CADASTRE_SE_WEBHOOK`: URL do webhook para envio dos dados de cadastro
   - `RANK_WEBHOOK`: URL do webhook para buscar dados de ranking (padrão: https://n8n.dinastia.uk/webhook/v1/systempoints/pontos)
   - `RANK_ID`: ID do canal para publicação do ranking diário (padrão: 1369785587862601768)
   - `CONSULTAR_PONTOS_ID`: ID do canal para mensagem de consulta de pontos
   - `CONSULTAR_PONTOS_WEBHOOK`: URL do webhook para consulta de pontos (padrão: https://n8n.dinastia.uk/webhook/v1/systempoints/pontos)

As variáveis usam sublinhado `_`, não hífen `-`. Caso algum dos valores não
esteja definido (por exemplo `CADASTRE_SE_ID`), o bot encerrará informando
qual variável está ausente. Se o seu `.env` antigo possuir `CADASTRE-SE_ID` ou
`CADASTRE-SE_WEBHOOK`, renomeie-os para `CADASTRE_SE_ID` e
`CADASTRE_SE_WEBHOOK`.

2. Instale as dependências com `npm install` (requer acesso à internet).
3. Execute `npm start` para iniciar o bot. O servidor HTTP será iniciado na porta definida em `PORT` (padrão `9090`).

O bot envia a mensagem no canal definido em `CADASTRE_SE_ID` quando inicia. Ao clicar em **Fazer Cadastro**, o usuário fornece os dados de contato que são enviados para o webhook configurado em `CADASTRE_SE_WEBHOOK`. Além disso, o bot busca e publica automaticamente o ranking diário às 8h (horário de São Paulo) no canal definido em `RANK_ID`.

Se `BOT_INVITE_URL` estiver definido, a página inicial do servidor exibe um link para convidar o bot.

## Estrutura do Projeto

O projeto foi modularizado para melhor organização e manutenção:

```
src/
├── commands/        # Comandos e funcionalidades do bot
│   ├── register.js  # Funcionalidade de cadastro
│   ├── dailyRank.js # Funcionalidade de ranking diário
│   └── consultPoints.js # Funcionalidade de consulta de pontos
├── handlers/        # Manipuladores de eventos
│   └── interactions.js # Manipulador de interações do Discord
├── utils/           # Utilitários
│   ├── env.js       # Validação de variáveis de ambiente
│   └── scheduler.js # Agendador para tarefas periódicas
└── index.js         # Ponto de entrada principal
```

## Docker

Este projeto inclui um `Dockerfile`. Para criar uma imagem e executar o bot
em um contêiner, utilize:

```bash
docker build -t system-points .
docker run --env-file .env system-points
```

Certifique-se de fornecer um arquivo `.env` com todas as variáveis de
ambiente necessárias.
