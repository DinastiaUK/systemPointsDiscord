/**
 * Interaction handler module
 */
import { InteractionType } from 'discord.js';
import { handleRegisterButton, handleRegisterModalSubmit } from '../commands/register.js';
import { handleConsultPointsButton } from '../commands/consultPoints.js';
import { handleManagePointsButton, handleManagePointsModalSubmit, handleActionSelect } from '../commands/managePoints.js';

/**
 * Sets up the interaction handler for the Discord client
 * @param {Object} client - Discord client
 * @param {string} registerWebhookUrl - URL for the registration webhook
 * @param {string} consultPointsWebhookUrl - URL for the points consultation webhook
 * @param {string} managePointsWebhookUrl - URL for the points management webhook
 */
export function setupInteractionHandler(client, registerWebhookUrl, consultPointsWebhookUrl, managePointsWebhookUrl) {
  client.on('interactionCreate', async (interaction) => {
    try {
      // Handle button interactions
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'register':
            await handleRegisterButton(interaction);
            break;
          case 'start_onboarding':
            // Handle the start_onboarding button - redirect to register functionality
            await handleRegisterButton(interaction);
            break;
          case 'consult_points':
            await handleConsultPointsButton(interaction, consultPointsWebhookUrl);
            break;
          case 'manage_points':
            await handleManagePointsButton(interaction);
            break;
          default:
            console.log(`Unknown button interaction: ${interaction.customId}`);
        }
      } 
      // Handle modal submissions
      else if (interaction.type === InteractionType.ModalSubmit) {
        switch (interaction.customId) {
          case 'registerModal':
            await handleRegisterModalSubmit(interaction, registerWebhookUrl);
            break;
          case 'managePointsModal':
            await handleManagePointsModalSubmit(interaction, managePointsWebhookUrl);
            break;
          default:
            console.log(`Unknown modal submission: ${interaction.customId}`);
        }
      }
      // Handle select menu interactions
      else if (interaction.isStringSelectMenu()) {
        switch (interaction.customId) {
          case 'action_select':
            await handleActionSelect(interaction, managePointsWebhookUrl);
            break;
          default:
            console.log(`Unknown select menu interaction: ${interaction.customId}`);
        }
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
