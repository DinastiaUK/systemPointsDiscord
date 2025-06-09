/**
 * Main entry point for the Discord bot
 */
import 'dotenv/config';
import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

// Dynamic import for fetch
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
}).catch(err => {
  console.error('Error importing node-fetch:', err);
  process.exit(1);
});

// Import utility modules
import { validateEnvVars } from './utils/env.js';
import { setupInteractionHandler } from './handlers/interactions.js';
import { sendRegistrationMessage } from './commands/register.js';
import { sendConsultPointsMessage } from './commands/consultPoints.js';
import { sendManagePointsMessage } from './commands/managePoints.js';
import { scheduleDailyRank } from './utils/scheduler.js';

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const BOT_INVITE_URL = process.env.BOT_INVITE_URL;
const PORT = process.env.PORT ?? 9090;
const CADASTRE_SE_ID = process.env.CADASTRE_SE_ID || process.env['CADASTRE-SE_ID'];
const CADASTRE_SE_WEBHOOK = process.env.CADASTRE_SE_WEBHOOK || process.env['CADASTRE-SE_WEBHOOK'];
const RANK_WEBHOOK = process.env.RANK_WEBHOOK || 'https://n8n.dinastia.uk/webhook/v1/systempoints/pontos';
const RANK_ID = process.env.RANK_ID || '1369785587862601768';
const CONSULTAR_PONTOS_ID = process.env.CONSULTAR_PONTOS_ID;
const CONSULTAR_PONTOS_WEBHOOK = process.env.CONSULTAR_PONTOS_WEBHOOK || 'https://n8n.dinastia.uk/webhook/v1/systempoints/pontos';
const GERENCIADOR_PONTOS_ID = process.env.GERENCIADOR_PONTOS_ID;
const GERENCIADOR_PONTOS_WEBHOOK = process.env.GERENCIADOR_PONTOS_WEBHOOK || 'https://n8n.dinastia.uk/webhook/v1/systempoints/gerenciar';
const AUTH_WEBHOOK = process.env.AUTH_WEBHOOK || '';

// Validate required environment variables
validateEnvVars({
  DISCORD_TOKEN,
  CADASTRE_SE_ID,
  CADASTRE_SE_WEBHOOK,
});

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Set up interaction handler
setupInteractionHandler(client, CADASTRE_SE_WEBHOOK, CONSULTAR_PONTOS_WEBHOOK, GERENCIADOR_PONTOS_WEBHOOK, AUTH_WEBHOOK);

// Handle ready event
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  try {
    // Validate channel IDs
    if (!CADASTRE_SE_ID || CADASTRE_SE_ID === '') {
      console.warn('CADASTRE_SE_ID is not set. Registration message will not be sent.');
    } else {
      try {
        // Send registration message
        const channel = await client.channels.fetch(CADASTRE_SE_ID);
        if (channel) {
          await sendRegistrationMessage(channel);
          console.log(`Registration message sent to channel: ${channel.name}`);
        }
      } catch (channelError) {
        console.error(`Failed to fetch registration channel (ID: ${CADASTRE_SE_ID}):`, channelError.message);
        console.error('Please check that the CADASTRE_SE_ID is correct and the bot has access to this channel.');
      }
    }
    
    // Send points consultation message
    if (!CONSULTAR_PONTOS_ID || CONSULTAR_PONTOS_ID === '') {
      console.warn('CONSULTAR_PONTOS_ID is not set. Points consultation message will not be sent.');
    } else {
      try {
        // Send points consultation message
        const consultChannel = await client.channels.fetch(CONSULTAR_PONTOS_ID);
        if (consultChannel) {
          await sendConsultPointsMessage(consultChannel);
          console.log(`Points consultation message sent to channel: ${consultChannel.name}`);
        }
      } catch (channelError) {
        console.error(`Failed to fetch points consultation channel (ID: ${CONSULTAR_PONTOS_ID}):`, channelError.message);
        console.error('Please check that the CONSULTAR_PONTOS_ID is correct and the bot has access to this channel.');
      }
    }
    
    // Send points management message
    if (!GERENCIADOR_PONTOS_ID || GERENCIADOR_PONTOS_ID === '') {
      console.warn('GERENCIADOR_PONTOS_ID is not set. Points management message will not be sent.');
    } else {
      try {
        // Send points management message
        const manageChannel = await client.channels.fetch(GERENCIADOR_PONTOS_ID);
        if (manageChannel) {
          await sendManagePointsMessage(manageChannel);
          console.log(`Points management message sent to channel: ${manageChannel.name}`);
        }
      } catch (channelError) {
        console.error(`Failed to fetch points management channel (ID: ${GERENCIADOR_PONTOS_ID}):`, channelError.message);
        console.error('Please check that the GERENCIADOR_PONTOS_ID is correct and the bot has access to this channel.');
      }
    }
    
    // Set up daily rank scheduler
    if (!RANK_ID || RANK_ID === '') {
      console.warn('RANK_ID is not set. Daily rank will not be posted to a channel.');
    } else {
      try {
        // Validate rank channel exists
        await client.channels.fetch(RANK_ID);
        scheduleDailyRank(client, RANK_ID, RANK_WEBHOOK);
        console.log(`Daily rank scheduler set up for channel ID: ${RANK_ID}`);
      } catch (rankChannelError) {
        console.error(`Failed to fetch rank channel (ID: ${RANK_ID}):`, rankChannelError.message);
        console.error('Please check that the RANK_ID is correct and the bot has access to this channel.');
      }
    }
  } catch (err) {
    console.error('Error during initialization:', err);
  }
});

// Validate Discord token before login
if (!DISCORD_TOKEN || DISCORD_TOKEN === '') {
  console.error('ERROR: Discord token is missing or empty. Please set the DISCORD_TOKEN environment variable.');
  process.exit(1);
}

// Login to Discord
client.login(DISCORD_TOKEN).catch(error => {
  console.error('Failed to login to Discord:', error);
  console.error('Please check that your Discord token is valid.');
  process.exit(1);
});

// Set up Express server
const app = express();
app.get('/', (_req, res) => {
  if (BOT_INVITE_URL) {
    res.send(`<a href="${BOT_INVITE_URL}">Invite the bot</a>`);
  } else {
    res.send('Bot is running');
  }
});

// Start HTTP server
app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));
