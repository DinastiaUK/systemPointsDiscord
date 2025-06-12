/**
 * Interaction handler module
 */
import { InteractionType } from 'discord.js';
import { handleRegisterButton, handleRegisterModalSubmit } from '../commands/register.js';
import { handleConsultPointsButton } from '../commands/consultPoints.js';
import { handleAddPointsButton, handleRemovePointsButton, handlePointsModalSubmit } from '../commands/managePoints.js';

/**
 * Sets up the interaction handler for the Discord client
 * @param {Object} client - Discord client
 * @param {string} registerWebhookUrl - URL for the registration webhook
 * @param {string} consultPointsWebhookUrl - URL for the points consultation webhook
 * @param {string} managePointsWebhookUrl - URL for the points management webhook
 * @param {string} authToken - Authentication token for webhook requests
 */
export function setupInteractionHandler(client, registerWebhookUrl, consultPointsWebhookUrl, managePointsWebhookUrl, authToken) {
  client.on('interactionCreate', async (interaction) => {
    try {
      // Handle button interactions
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'dinastia_register':
            await handleRegisterButton(interaction, authToken);
            break;
          case 'dinastia_consult_points':
            await handleConsultPointsButton(interaction, consultPointsWebhookUrl, authToken);
            break;
          case 'dinastia_add_points':
            await handleAddPointsButton(interaction, authToken);
            break;
          case 'dinastia_remove_points':
            await handleRemovePointsButton(interaction, authToken);
            break;
          case 'email_request':
            // Ignorar silenciosamente este botão de outro bot
            console.log(`Ignorando botão de outro bot: ${interaction.customId}`);
            break;
          default:
            console.log(`Unknown button interaction: ${interaction.customId}`);
        }
      } 
      // Handle modal submissions
      else if (interaction.type === InteractionType.ModalSubmit) {
        switch (interaction.customId) {
          case 'dinastia_registerModal':
            await handleRegisterModalSubmit(interaction, registerWebhookUrl, authToken);
            break;
          case 'dinastia_addPointsModal':
          case 'dinastia_removePointsModal':
            await handlePointsModalSubmit(interaction, managePointsWebhookUrl, authToken);
            break;
          case 'email_form':
            // Ignorar silenciosamente este modal de outro bot
            console.log(`Ignorando modal de outro bot: ${interaction.customId}`);
            break;
          default:
            console.log(`Unknown modal submission: ${interaction.customId}`);
        }
      }
      // Handle select menu interactions
      else if (interaction.isStringSelectMenu()) {
        console.log(`Received select menu interaction: ${interaction.customId}`);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      // Try to respond to the interaction if it hasn't been responded to yet
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: 'Ocorreu um erro ao processar sua interação.', 
          ephemeral: true 
        }).catch(err => console.error('Failed to send error response:', err));
      }
    }
  });
}

export default {
  setupInteractionHandler,
};
