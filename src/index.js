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
import { scheduleDailyRank } from './utils/scheduler.js';

// Import command modules
import { sendRegistrationMessage } from './commands/register.js';

// Import handlers
import { setupInteractionHandler } from './handlers/interactions.js';

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const BOT_INVITE_URL = process.env.BOT_INVITE_URL;
const PORT = process.env.PORT ?? 9090;
const CADASTRE_SE_ID = process.env.CADASTRE_SE_ID || process.env['CADASTRE-SE_ID'];
const CADASTRE_SE_WEBHOOK = process.env.CADASTRE_SE_WEBHOOK || process.env['CADASTRE-SE_WEBHOOK'];
const RANK_WEBHOOK = process.env.RANK_WEBHOOK || 'https://n8n.dinastia.uk/webhook/v1/systempoints/pontos';
const RANK_ID = process.env.RANK_ID || '1369785587862601768';

// Validate required environment variables
validateEnvVars({
  DISCORD_TOKEN,
  CADASTRE_SE_ID,
  CADASTRE_SE_WEBHOOK,
});

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Set up interaction handler
setupInteractionHandler(client, CADASTRE_SE_WEBHOOK);

// Handle ready event
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  try {
    // Send registration message
    const channel = await client.channels.fetch(CADASTRE_SE_ID);
    if (!channel) {
      console.error('Registration channel not found');
    } else {
      await sendRegistrationMessage(channel);
    }
    
    // Set up daily rank scheduler
    scheduleDailyRank(client, RANK_ID, RANK_WEBHOOK);
  } catch (err) {
    console.error('Error during initialization:', err);
  }
});

// Login to Discord
client.login(DISCORD_TOKEN);

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
