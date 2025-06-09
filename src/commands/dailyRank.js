/**
 * Daily rank command module
 */
import { EmbedBuilder } from 'discord.js';

/**
 * Fetches the daily rank data from the webhook and posts it to the specified channel
 * @param {Object} client - Discord client
 * @param {string} rankChannelId - ID of the channel to post the rank
 * @param {string} webhookUrl - URL of the webhook to fetch rank data
 * @param {string} authToken - Authentication token for webhook requests
 * @returns {Promise<void>}
 */
export async function fetchAndPostDailyRank(client, rankChannelId, webhookUrl, authToken) {
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
    
    const headers = { 
      'Accept': 'text/plain, application/json' 
    };
    
    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = authToken;
    }
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rank data: ${response.status} ${response.statusText}`);
    }
    
    // Primeiro tentamos obter o texto da resposta
    const responseText = await response.text();
    console.log('Rank response received:', responseText);
    
    // Verificamos se a resposta é um texto simples ou um JSON
    let rankData;
    try {
      // Tentamos converter para JSON
      rankData = JSON.parse(responseText);
    } catch (e) {
      // Se não for um JSON válido, usamos o texto como está
      console.log('Response is not valid JSON, using as plain text');
    }
    
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
      .setTimestamp()
      .setFooter({ text: '👑 DinastIA - Sistema de Pontos' });
    
    // Se temos um objeto JSON válido, processamos normalmente
    if (rankData && Array.isArray(rankData) && rankData.length > 0) {
      embed.setDescription('Confira os membros que mais se destacaram hoje!');
      
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
    } 
    // Se não é um JSON válido, mas temos texto, usamos o texto como descrição
    else if (responseText && responseText.trim() !== '') {
      embed.setDescription(responseText);
    }
    // Se não temos dados válidos
    else {
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
