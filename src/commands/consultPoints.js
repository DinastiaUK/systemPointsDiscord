/**
 * Points consultation command module
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
 * Sends the points consultation message with button to the specified channel
 * @param {Object} channel - Discord channel to send the message to
 * @returns {Promise<void>}
 */
export async function sendConsultPointsMessage(channel) {
  try {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dinastia_consult_points')
        .setLabel('Consultar Pontos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔍')
    );

    const embed = new EmbedBuilder()
      .setColor('#0099ff') // Blue color for the embed border
      .setTitle('🔍 Consulte seus Pontos na Dinastia!')
      .setDescription(
        'Clique no botão abaixo para consultar seus pontos acumulados no sistema.\n\n' +
        'Veja quantos pontos você já acumulou e acompanhe seu progresso na comunidade Dinastia!\n\n' +
        'Quanto mais você participa, mais pontos você ganha!'
      )
      .setFooter({ text: '👑DinastIA - Sistema de Pontos' });

    await channel.send({ embeds: [embed], components: [row] });
    console.log('Points consultation message sent.');
  } catch (err) {
    console.error('Failed to send points consultation message:', err);
  }
}

/**
 * Handles the consult points button interaction
 * @param {Object} interaction - Discord interaction object
 * @param {string} webhookUrl - URL for the points consultation webhook
 * @param {string} authToken - Authentication token for webhook requests
 * @returns {Promise<void>}
 */
export async function handleConsultPointsButton(interaction, webhookUrl, authToken) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const discordId = interaction.user.id;
    
    // Check if fetch is available
    if (typeof fetch !== 'function') {
      console.error('fetch is not initialized yet');
      await interaction.editReply('Erro interno do servidor. Tente novamente mais tarde.');
      return;
    }
    
    console.log(`Fetching points for user ${discordId}...`);
    
    try {
      // Fetch user points data
      const headers = { 
        'Accept': 'text/plain, application/json'
      };
      
      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = authToken;
      }
      
      const response = await fetch(`${webhookUrl}?discordId=${discordId}`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch points data: ${response.status} ${response.statusText}`);
      }
      
      // Primeiro tentamos obter o texto da resposta
      const responseText = await response.text();
      console.log('Response received:', responseText);
      
      // Create an embed to display the user's points
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🏆 Seus Pontos na Dinastia')
        .setTimestamp()
        .setFooter({ text: '👑 DinastIA - Sistema de Pontos' });
      
      // Exibir o texto exatamente como recebido do webhook
      embed.setDescription(responseText);
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error fetching points:', error);
      await interaction.editReply('Não foi possível consultar seus pontos. Por favor, tente novamente mais tarde.');
    }
  } catch (err) {
    console.error('Error handling consult points button:', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Ocorreu um erro ao processar sua solicitação.', ephemeral: true });
    } else {
      await interaction.editReply('Ocorreu um erro ao processar sua solicitação.');
    }
  }
}
