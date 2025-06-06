/**
 * Registration command module
 */
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} from 'discord.js';

/**
 * Sends the registration message with button to the specified channel
 * @param {Object} channel - Discord channel to send the message to
 * @returns {Promise<void>}
 */
export async function sendRegistrationMessage(channel) {
  try {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('register')
        .setLabel('Fazer Cadastro')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⚡')
    );

    const embed = new EmbedBuilder()
      .setColor('#00a550') // Green color for the embed border
      .setTitle('🚀 Cadastre-se no Sistema de Pontos da Dinastia!')
      .setDescription(
        'Ao clicar no botão abaixo, você irá preencher um formulário de cadastro do sistema de pontos.\n\n' +
        'Esse sistema é uma forma de recompensar você por sua participação ativa na comunidade Dinastia.\n\n' +
        'Ao longo do tempo, você poderá acumular pontos e trocá-los por prêmios incríveis!\n\n' +
        'Aproveite essa oportunidade e faça parte do nosso sistema de pontos!'
      )
      .setFooter({ text: '👑DinastIA - Bem-vindo ao Sistema de Pontos!' });

    await channel.send({ embeds: [embed], components: [row] });
    console.log('Registration message sent.');
  } catch (err) {
    console.error('Failed to send registration message:', err);
  }
}

/**
 * Handles the registration button interaction
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<void>}
 */
export async function handleRegisterButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('registerModal')
    .setTitle('Cadastro Sistema de Pontos');

  const emailInput = new TextInputBuilder()
    .setCustomId('email')
    .setLabel('E-mail')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('comercial@dinastia.uk')
    .setRequired(true);

  const whatsappInput = new TextInputBuilder()
    .setCustomId('whatsapp')
    .setLabel('WhatsApp (com DDD)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('557899009909')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(emailInput),
    new ActionRowBuilder().addComponents(whatsappInput),
  );

  await interaction.showModal(modal);
}

/**
 * Handles the registration modal submission
 * @param {Object} interaction - Discord interaction object
 * @param {string} webhookUrl - Webhook URL to send the form data to
 * @returns {Promise<void>}
 */
/**
 * Format a phone number into the pattern +XX(XX)XXXX-XXXX
 * @param {string} phoneNumber - Raw phone number input
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid phone number with country code
  if (digits.length >= 12) {
    // Format as +XX(XX)XXXX-XXXX
    const countryCode = digits.substring(0, 2);
    const areaCode = digits.substring(2, 4);
    const firstPart = digits.substring(4, 8);
    const secondPart = digits.substring(8, 12);
    return `+${countryCode}(${areaCode})${firstPart}-${secondPart}`;
  } 
  // For Brazilian numbers without +55 prefix
  else if (digits.length === 10 || digits.length === 11) {
    const areaCode = digits.substring(0, 2);
    const firstPart = digits.length === 11 ? digits.substring(2, 7) : digits.substring(2, 6);
    const secondPart = digits.length === 11 ? digits.substring(7, 11) : digits.substring(6, 10);
    return `+55(${areaCode})${firstPart}-${secondPart}`;
  } 
  // Return original if format doesn't match expected patterns
  return phoneNumber;
}

/**
 * Validate an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Validate a WhatsApp number
 * @param {string} number - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidPhoneNumber(number) {
  // Remove all non-digit characters
  const digits = number.replace(/\D/g, '');
  
  // Check if it's a valid length for a phone number (with or without country code)
  return digits.length >= 10 && digits.length <= 15;
}

export async function handleRegisterModalSubmit(interaction, webhookUrl) {
  const email = interaction.fields.getTextInputValue('email');
  const whatsapp = interaction.fields.getTextInputValue('whatsapp');
  
  // Validate email
  if (!isValidEmail(email)) {
    await interaction.reply({ 
      content: 'Por favor, forneça um endereço de email válido (exemplo: nome@dominio.com).', 
      ephemeral: true 
    });
    return;
  }
  
  // Validate WhatsApp number
  if (!isValidPhoneNumber(whatsapp)) {
    await interaction.reply({ 
      content: 'Por favor, forneça um número de WhatsApp válido com pelo menos 10 dígitos.', 
      ephemeral: true 
    });
    return;
  }
  
  // Format phone number
  const formattedWhatsapp = formatPhoneNumber(whatsapp);

  try {
    // Check if fetch is available
    if (typeof fetch !== 'function') {
      console.error('fetch is not initialized yet');
      await interaction.reply({ content: 'Erro interno do servidor. Tente novamente mais tarde.', ephemeral: true });
      return;
    }
    
    // Validate webhook URL
    if (!webhookUrl || webhookUrl.includes('your-webhook-url.com') || webhookUrl === '') {
      console.error('Invalid webhook URL:', webhookUrl);
      await interaction.reply({ content: 'Configuração incompleta. Por favor, contate o administrador.', ephemeral: true });
      return;
    }
    
    console.log(`Sending registration data to webhook: ${webhookUrl}`);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        whatsapp: formattedWhatsapp, // Use the formatted WhatsApp number
        userName: interaction.user.username,
        discordId: interaction.user.id,
      }),
    });
    await interaction.reply({ 
      content: `Cadastro enviado com sucesso! \nEmail: ${email} \nWhatsApp: ${formattedWhatsapp}`, 
      ephemeral: true 
    });
  } catch (err) {
    console.error('Failed to submit form:', err);
    await interaction.reply({ content: 'Erro ao enviar cadastro.', ephemeral: true });
  }
}

export default {
  sendRegistrationMessage,
  handleRegisterButton,
  handleRegisterModalSubmit,
};
