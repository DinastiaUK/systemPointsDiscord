import 'dotenv/config';
import express from 'express';
// Use dynamic import for fetch to ensure compatibility
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
}).catch(err => {
  console.error('Error importing node-fetch:', err);
  process.exit(1);
});

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
  EmbedBuilder,
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
        .setLabel('Fazer Cadastro')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⚡')
    );

    const embed = new EmbedBuilder()
      .setColor('#00a550') // Green color for the embed border
      .setTitle('👑 Cadastre-se no Sistema de Pontos da Dinastia!')
      .setDescription(
        'Ao clicar no botão abaixo, você irá preencher um formulário de cadastro do sistema de pontos.\n\n' +
        'Esse sistema é uma forma de recompensar você por sua participação ativa na comunidade Dinastia.\n\n' +
        'Ao longo do tempo, você poderá acumular pontos e trocá-los por prêmios incríveis!\n\n' +
        'Aproveite essa oportunidade e faça parte do nosso sistema de pontos!'
      )
      .setFooter({ text: 'DinastIA - Bem-vindo ao Sistema de Pontos!' });

    await channel.send({ embeds: [embed], components: [row] });
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
      // Check if fetch is available
      if (!fetch) {
        console.error('fetch is not initialized yet');
        await interaction.reply({ content: 'Erro interno do servidor. Tente novamente mais tarde.', ephemeral: true });
        return;
      }
      
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
