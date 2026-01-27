/**
 * Agent API Layer
 * Functions representing backend endpoints for Agent role.
 * Updated: v2
 */

import { agentApi } from '@/api';

/**
 * Fetch agent dashboard data
 * @param {string} agentId - Agent identifier
 * @returns {Promise<Object>} Dashboard data
 */
export const fetchAgentDashboard = async (agentId) => {
  return agentApi.getDashboard(agentId);
};

/**
 * Fetch agent performance data
 * @param {string} agentId - Agent identifier
 * @param {Object} [filters] - Optional filters
 * @returns {Promise<Object>} Performance data
 */
export const fetchAgentPerformance = async (agentId, filters = {}) => {
  return agentApi.getPerformance(agentId, filters);
};

/**
 * Fetch leaderboard data
 * @param {string} agentId - Agent identifier
 * @param {Object} [filters] - Filter options (viewType, timeRange)
 * @returns {Promise<Object>} Leaderboard data
 */
export const fetchLeaderboard = async (agentId, filters = {}) => {
  return agentApi.getLeaderboard(agentId, filters);
};

/**
 * Fetch play zone data
 * @param {string} agentId - Agent identifier
 * @returns {Promise<Object>} Play zone data
 */
export const fetchPlayzone = async (agentId) => {
  return agentApi.getPlayzone(agentId);
};

/**
 * Fetch rewards vault data
 * @param {string} agentId - Agent identifier
 * @param {Object} [filters] - Filter options (category)
 * @returns {Promise<Object>} Rewards data
 */
export const fetchRewards = async (agentId, filters = {}) => {
  const data = await agentApi.getRewardsVault(agentId);
  // Transform to expected format if needed
  return {
    rewards: data.rewards.map(reward => ({
      id: reward.id,
      title: reward.name,
      description: `Claim this ${reward.category} reward worth ${reward.pointCost} points`,
      points: reward.pointCost,
      category: reward.category,
      rarity: reward.rarity,
      status: reward.inStock ? (reward.stockCount > 0 ? 'available' : 'limited') : 'locked',
      stock: reward.stockCount,
      image: reward.image || '🎁'
    })),
    userBalance: data.availablePoints,
    userRank: data.level ? `Level ${data.level}` : "Bronze",
    nextRankPoints: data.nextLevelXP || 10000,
    nextRank: data.level ? `Level ${data.level + 1}` : "Silver",
    redemptionHistory: data.claimHistory.map(item => ({
      item: item.rewardName,
      date: item.claimedAt,
      status: item.status,
      points: item.pointsSpent
    })),
  };
};

/**
 * Fetch achievements data
 * @param {string} agentId - Agent identifier
 * @returns {Promise<Object>} Achievements data
 */
export const fetchAchievements = async (agentId) => {
  const data = await agentApi.getAchievements(agentId);
  // Transform to expected format
  return {
    level: data.level || 1,
    title: data.title || "Novice",
    tier: "ELITE",
    currentXP: data.currentXP || 0,
    nextLevelXP: data.nextLevelXP || 1000,
    levelProgress: data.levelProgress || 0,
    badges: data.badges || [],
    milestones: [], // Add if available
    stats: {
      badges: data.badges?.length || 0,
      streak: data.streak || 0,
      completion: 85, // Mock
    },
  };
};

/**
 * Claim scratch card reward (reveal the card)
 * @param {string} agentId - Agent identifier
 * @returns {Promise<Object>} Scratch reveal result with reward
 */
export const claimScratchCard = async (agentId) => {
  return agentApi.scratchCard(agentId);
};

/**
 * Claim and record scratch card points to backend
 * @param {string} agentId - Agent identifier
 * @param {Object} rewardData - { reward: string, points: number }
 * @returns {Promise<Object>} Claim result with updated balance
 */
export const claimScratchReward = async (agentId, rewardData) => {
  return agentApi.claimScratchReward(agentId, rewardData);
};

/**
 * Spin the wheel - deducts tokens from balance
 * @param {string} agentId - Agent identifier
 * @param {Object} spinData - { tokenCost: number }
 * @returns {Promise<Object>} Spin result with reward and new balance
 */
export const spinWheel = async (agentId, spinData = { tokenCost: 100 }) => {
  return agentApi.spinWheel(agentId, spinData);
};

/**
 * Claim spin wheel reward - records points/xp to backend
 * @param {string} agentId - Agent identifier
 * @param {Object} rewardData - { reward: { label, sublabel, points, xp } }
 * @returns {Promise<Object>} Claim result with updated balance
 */
export const claimSpinReward = async (agentId, rewardData) => {
  return agentApi.claimSpinReward(agentId, rewardData);
};

/**
 * Redeem a reward
 * @param {string} agentId - Agent identifier
 * @param {number} rewardId - Reward identifier
 * @returns {Promise<Object>} Redemption result
 */
export const redeemReward = async (agentId, rewardId) => {
  // Note: This might need a separate endpoint in backend
  return { success: true, message: "Reward redeemed successfully" };
};
