/**
 * Interaction handler module
 */
import { InteractionType } from 'discord.js';
import { handleRegisterButton, handleRegisterModalSubmit } from '../commands/register.js';

/**
 * Sets up the interaction handler for the Discord client
 * @param {Object} client - Discord client
 * @param {string} webhookUrl - Webhook URL for form submissions
 */
export function setupInteractionHandler(client, webhookUrl) {
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
          default:
            console.log(`Unknown button interaction: ${interaction.customId}`);
        }
      } 
      // Handle modal submissions
      else if (interaction.type === InteractionType.ModalSubmit) {
        switch (interaction.customId) {
          case 'registerModal':
            await handleRegisterModalSubmit(interaction, webhookUrl);
            break;
          default:
            console.log(`Unknown modal submission: ${interaction.customId}`);
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
