/**
 * Daily rank command module
 */
import { EmbedBuilder } from 'discord.js';

/**
 * Fetches the daily rank data from the webhook and posts it to the specified channel
 * @param {Object} client - Discord client
 * @param {string} rankChannelId - ID of the channel to post the rank
 * @param {string} webhookUrl - URL of the webhook to fetch rank data
 * @returns {Promise<void>}
 */
export async function fetchAndPostDailyRank(client, rankChannelId, webhookUrl) {
  try {
    // Validate inputs
    if (!rankChannelId || rankChannelId === '') {
      console.error('Invalid rank channel ID. Cannot post daily rank.');
      return;
    }
    
    if (!webhookUrl || webhookUrl === '') {
      console.error('Invalid webhook URL. Cannot fetch rank data.');
      return;
    }
    
    console.log(`Fetching daily rank data from ${webhookUrl}...`);
    
    // Check if fetch is available
    if (typeof fetch !== 'function') {
      console.error('fetch is not initialized yet');
      return;
    }
    
    // Fetch rank data
    console.log(`Attempting to fetch data from: ${webhookUrl}`);
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rank data: ${response.status} ${response.statusText}`);
    }
    
    const rankData = await response.json();
    
    // Get the channel
    let channel;
    try {
      channel = await client.channels.fetch(rankChannelId);
      if (!channel) {
        console.error(`Rank channel not found with ID: ${rankChannelId}`);
        return;
      }
      console.log(`Successfully found rank channel: ${channel.name}`);
    } catch (channelError) {
      console.error(`Failed to fetch rank channel (ID: ${rankChannelId}):`, channelError.message);
      console.error('Please check that the RANK_ID is correct and the bot has access to this channel.');
      return;
    }
    
    // Create an embed for the rank data
    const embed = new EmbedBuilder()
      .setColor('#FFD700') // Gold color for rank
      .setTitle('🏆 Ranking Diário do Sistema de Pontos')
      .setDescription('Confira os membros que mais se destacaram hoje!')
      .setTimestamp()
      .setFooter({ text: '👑 DinastIA - Sistema de Pontos' });
    
    // Add fields for each ranked user
    if (Array.isArray(rankData) && rankData.length > 0) {
      // Limit to top 10 users
      const topUsers = rankData.slice(0, 10);
      
      // Add each user to the embed
      topUsers.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        embed.addFields({
          name: `${medal} ${user.username || 'Usuário'}`,
          value: `Pontos: **${user.points || 0}**`,
          inline: true
        });
      });
    } else {
      embed.setDescription('Nenhum dado de ranking disponível para hoje.');
    }
    
    await channel.send({ embeds: [embed] });
    console.log('Daily rank posted successfully.');
  } catch (err) {
    console.error('Failed to fetch and post daily rank:', err);
  }
}

export default {
  fetchAndPostDailyRank,
};
