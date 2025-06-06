/**
 * Scheduler utility for cron jobs
 */
import { fetchAndPostDailyRank } from '../commands/dailyRank.js';

/**
 * Schedule a function to run at a specific time every day
 * @param {Object} client - Discord client
 * @param {string} rankChannelId - ID of the channel to post the rank
 * @param {string} webhookUrl - URL of the webhook to fetch rank data
 */
export function scheduleDailyRank(client, rankChannelId, webhookUrl) {
  console.log('Setting up daily rank scheduler...');
  
  // Function to calculate milliseconds until next 8:00 AM São Paulo time
  const getMillisecondsUntil8AM = () => {
    // Create date object for São Paulo time (UTC-3)
    const now = new Date();
    const saoPauloOffset = -3 * 60; // São Paulo is UTC-3
    const utcOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
    const offsetDiff = utcOffset + saoPauloOffset; // Difference between local and São Paulo
    
    // Adjust current time to São Paulo time
    const saoPauloNow = new Date(now.getTime() + offsetDiff * 60 * 1000);
    
    // Create target time (8:00 AM today in São Paulo)
    const target = new Date(saoPauloNow);
    target.setHours(8, 0, 0, 0);
    
    // If it's already past 8 AM, schedule for tomorrow
    if (saoPauloNow > target) {
      target.setDate(target.getDate() + 1);
    }
    
    // Return milliseconds until target time
    return target.getTime() - saoPauloNow.getTime();
  };
  
  // Function to schedule the next run
  const scheduleNextRun = () => {
    const msUntil8AM = getMillisecondsUntil8AM();
    console.log(`Scheduled next daily rank update in ${Math.floor(msUntil8AM / (1000 * 60 * 60))} hours and ${Math.floor((msUntil8AM % (1000 * 60 * 60)) / (1000 * 60))} minutes`);
    
    setTimeout(() => {
      // Execute the rank update
      fetchAndPostDailyRank(client, rankChannelId, webhookUrl)
        .catch(err => console.error('Error in scheduled rank update:', err))
        .finally(() => {
          // Schedule the next run
          scheduleNextRun();
        });
    }, msUntil8AM);
  };
  
  // Start the scheduling
  scheduleNextRun();
}

export default {
  scheduleDailyRank,
};
