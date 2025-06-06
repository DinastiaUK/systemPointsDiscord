import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
} from 'discord.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const BOT_INVITE_URL = process.env.BOT_INVITE_URL;
const PORT = process.env.PORT ?? 9090;
const CADASTRE_SE_ID =
  process.env.CADASTRE_SE_ID || process.env['CADASTRE-SE_ID'];
const CADASTRE_SE_WEBHOOK =
  process.env.CADASTRE_SE_WEBHOOK || process.env['CADASTRE-SE_WEBHOOK'];

// Validate required environment variables early
for (const [name, value] of Object.entries({
  DISCORD_TOKEN,
  CADASTRE_SE_ID,
  CADASTRE_SE_WEBHOOK,
})) {
  if (!value) {
    console.error(`Environment variable ${name} is not set`);
    process.exit(1);
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    const channel = await client.channels.fetch(CADASTRE_SE_ID);
    if (!channel) {
      console.error('Channel not found');
      return;
    }
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('register')
        .setLabel('Cadastre-se')
        .setStyle(ButtonStyle.Primary)
    );

    const description = `\u{1F680} Cadastre-se no Sistema de Pontos da Dinastia!
Ao clicar no bot\u00E3o abaixo, voc\u00EA ir\u00E1 preencher um formul\u00E1rio de cadastro do sistema de pontos.

Esse sistema \u00E9 uma forma de recompensar voc\u00EA por sua participa\u00E7\u00E3o ativa na comunidade Dinastia.

Ao longo do tempo, voc\u00EA poder\u00E1 acumular pontos e troc\u00E1-los por pr\u00EAmios incr\u00EDveis!

Aproveite essa oportunidade e fa\u00E7a parte do nosso sistema de pontos!

DinastIA - Bem-vindo ao Sistema de Pontos!`;

    await channel.send({ content: description, components: [row] });
    console.log('Message sent.');
  } catch (err) {
    console.error('Failed to send message:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'register') {
    const modal = new ModalBuilder()
      .setCustomId('registerModal')
      .setTitle('Cadastro Sistema de Pontos');

    const emailInput = new TextInputBuilder()
      .setCustomId('email')
      .setLabel('E-mail')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const whatsappInput = new TextInputBuilder()
      .setCustomId('whatsapp')
      .setLabel('WhatsApp')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(emailInput),
      new ActionRowBuilder().addComponents(whatsappInput),
    );

    await interaction.showModal(modal);
  } else if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === 'registerModal'
  ) {
    const email = interaction.fields.getTextInputValue('email');
    const whatsapp = interaction.fields.getTextInputValue('whatsapp');

    try {
      await fetch(CADASTRE_SE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          whatsapp,
          userName: interaction.user.username,
          discordId: interaction.user.id,
        }),
      });
      await interaction.reply({ content: 'Cadastro enviado com sucesso!', ephemeral: true });
    } catch (err) {
      console.error('Failed to submit form:', err);
      await interaction.reply({ content: 'Erro ao enviar cadastro.', ephemeral: true });
    }
  }
});

client.login(DISCORD_TOKEN);

const app = express();
app.get('/', (_req, res) => {
  if (BOT_INVITE_URL) {
    res.send(`<a href="${BOT_INVITE_URL}">Invite the bot</a>`);
  } else {
    res.send('Bot is running');
  }
});
app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));
