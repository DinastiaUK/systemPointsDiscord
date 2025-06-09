/**
 * Points management command module
 */
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

/**
 * Sends the points management message with button to the specified channel
 * @param {Object} channel - Discord channel to send the message to
 * @returns {Promise<void>}
 */
export async function sendManagePointsMessage(channel) {
  try {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('manage_points')
        .setLabel('Gerenciar Pontos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⚙️')
    );

    const embed = new EmbedBuilder()
      .setColor('#4CAF50') // Green color for the embed border
      .setTitle('⚙️ Gerenciamento de Pontos')
      .setDescription(
        'Clique no botão abaixo para gerenciar os pontos dos usuários.\n\n' +
        'Você poderá adicionar ou remover pontos e registrar a razão da alteração.\n\n' +
        'Apenas administradores podem utilizar esta função.'
      )
      .setFooter({ text: '👑DinastIA - Sistema de Pontos' });

    await channel.send({ embeds: [embed], components: [row] });
    console.log('Points management message sent.');
  } catch (err) {
    console.error('Failed to send points management message:', err);
  }
}

/**
 * Handles the manage points button interaction
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<void>}
 */
export async function handleManagePointsButton(interaction) {
  try {
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('managePointsModal')
      .setTitle('Gerenciamento de Pontos');

    // Create the user ID input
    const userIdInput = new TextInputBuilder()
      .setCustomId('userId')
      .setLabel('ID do Usuário')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('123456789012345678')
      .setRequired(true);

    // Create the action input (dropdown is not supported in modals, so we'll use a text input)
    const actionInput = new TextInputBuilder()
      .setCustomId('action')
      .setLabel('Ação (digite "adicionar" ou "remover")')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('adicionar')
      .setRequired(true);

    // Create the description input
    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Descrição')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Motivo da alteração de pontos')
      .setRequired(true);

    // Create the points value input
    const pointsInput = new TextInputBuilder()
      .setCustomId('points')
      .setLabel('Valor')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('100')
      .setRequired(true);

    // Add inputs to the modal
    const userIdRow = new ActionRowBuilder().addComponents(userIdInput);
    const actionRow = new ActionRowBuilder().addComponents(actionInput);
    const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const pointsRow = new ActionRowBuilder().addComponents(pointsInput);

    modal.addComponents(userIdRow, actionRow, descriptionRow, pointsRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  } catch (err) {
    console.error('Error showing points management modal:', err);
    await interaction.reply({ content: 'Ocorreu um erro ao abrir o formulário.', ephemeral: true });
  }
}

/**
 * Handles the points management modal submission
 * @param {Object} interaction - Discord interaction object
 * @param {string} webhookUrl - URL for the points management webhook
 * @returns {Promise<void>}
 */
export async function handleManagePointsModalSubmit(interaction, webhookUrl) {
  try {
    // Get form values
    const userId = interaction.fields.getTextInputValue('userId');
    const actionInput = interaction.fields.getTextInputValue('action').toLowerCase();
    const description = interaction.fields.getTextInputValue('description');
    const points = interaction.fields.getTextInputValue('points');
    
    // Normalize action input
    let action;
    if (actionInput.includes('adicionar') || actionInput === 'add') {
      action = 'add';
    } else if (actionInput.includes('remover') || actionInput === 'remove') {
      action = 'remove';
    } else {
      await interaction.reply({ 
        content: 'Ação inválida. Por favor, use "adicionar" ou "remover".', 
        ephemeral: true 
      });
      return;
    }
    
    // Validate points value
    const pointsValue = parseInt(points, 10);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      await interaction.reply({ 
        content: 'O valor de pontos deve ser um número positivo.', 
        ephemeral: true 
      });
      return;
    }
    
    // Send the data to the webhook
    try {
      await interaction.deferReply({ ephemeral: true });
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          description,
          points: pointsValue,
          action, // 'add' or 'remove'
          adminUsername: interaction.user.username,
          adminId: interaction.user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor: ${response.status}`);
      }
      
      const actionText = action === 'add' ? 'adicionados' : 'removidos';
      
      await interaction.editReply({ 
        content: `✅ Operação realizada com sucesso!\n\n**${pointsValue}** pontos foram ${actionText} ${action === 'add' ? 'para' : 'de'} <@${userId}>.\n**Motivo:** ${description}`, 
        components: [] 
      });
    } catch (error) {
      console.error('Error sending data to webhook:', error);
      await interaction.editReply({ 
        content: 'Erro ao enviar dados para o servidor. Por favor, tente novamente.', 
        components: [] 
      });
    }
  } catch (err) {
    console.error('Failed to process form submission:', err);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Erro ao processar o formulário.', ephemeral: true });
    }
  }
}

// A função handleActionSelect foi removida pois agora a ação é selecionada diretamente no modal
