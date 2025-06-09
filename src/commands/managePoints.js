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
    const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const pointsRow = new ActionRowBuilder().addComponents(pointsInput);

    modal.addComponents(userIdRow, descriptionRow, pointsRow);

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
  const userId = interaction.fields.getTextInputValue('userId');
  const description = interaction.fields.getTextInputValue('description');
  const points = interaction.fields.getTextInputValue('points');
  
  // Show action selection menu
  try {
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('action_select')
        .setPlaceholder('Selecione a ação')
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel('Adicionar')
            .setValue('add')
            .setDescription('Adicionar pontos ao usuário')
            .setEmoji('➕'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Remover')
            .setValue('remove')
            .setDescription('Remover pontos do usuário')
            .setEmoji('➖'),
        ])
    );

    // Store the form data in a temporary object for later use
    const formData = {
      userId,
      description,
      points
    };
    
    // Convert the form data to a JSON string and store it in a custom ID
    const dataString = Buffer.from(JSON.stringify(formData)).toString('base64');
    
    await interaction.reply({
      content: 'Selecione a ação a ser realizada:',
      components: [row],
      ephemeral: true,
      // Store the data in the message for retrieval later
      customId: `points_action_${dataString}`
    });
  } catch (err) {
    console.error('Failed to process form submission:', err);
    await interaction.reply({ content: 'Erro ao processar o formulário.', ephemeral: true });
  }
}

/**
 * Handles the action selection for points management
 * @param {Object} interaction - Discord interaction object
 * @param {string} webhookUrl - URL for the points management webhook
 * @returns {Promise<void>}
 */
export async function handleActionSelect(interaction, webhookUrl) {
  try {
    // Get the selected action
    const action = interaction.values[0]; // 'add' or 'remove'
    
    // Get the original message custom ID which contains our data
    const originalMessage = interaction.message;
    const customId = originalMessage.customId;
    
    // Extract the data from the custom ID if it exists
    let formData;
    if (customId && customId.startsWith('points_action_')) {
      const dataString = customId.replace('points_action_', '');
      formData = JSON.parse(Buffer.from(dataString, 'base64').toString());
    } else {
      // If we can't find the data, we need to get it from the message content
      // This is a fallback and might not work in all cases
      await interaction.update({ 
        content: 'Erro ao recuperar dados do formulário. Por favor, tente novamente.', 
        components: [] 
      });
      return;
    }
    
    const { userId, description, points } = formData;
    
    // Validate points value
    const pointsValue = parseInt(points, 10);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      await interaction.update({ 
        content: 'O valor de pontos deve ser um número positivo.', 
        components: [] 
      });
      return;
    }
    
    // Send the data to the webhook
    try {
      await fetch(webhookUrl, {
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
      
      const actionText = action === 'add' ? 'adicionados' : 'removidos';
      
      await interaction.update({ 
        content: `✅ Operação realizada com sucesso!\n\n**${pointsValue}** pontos foram ${actionText} ${action === 'add' ? 'para' : 'de'} <@${userId}>.\n**Motivo:** ${description}`, 
        components: [] 
      });
    } catch (error) {
      console.error('Error sending data to webhook:', error);
      await interaction.update({ 
        content: 'Erro ao enviar dados para o servidor. Por favor, tente novamente.', 
        components: [] 
      });
    }
  } catch (err) {
    console.error('Error handling action selection:', err);
    await interaction.reply({ content: 'Ocorreu um erro ao processar sua seleção.', ephemeral: true });
  }
}
