
export const ENDPOINTS = {
  // Auth Endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },

  // Agent Endpoints
  agent: {
    dashboard: (agentId) => `/agent/${agentId}/dashboard`,
    performance: (agentId) => `/agent/${agentId}/performance`,
    leaderboard: (agentId) => `/agent/${agentId}/leaderboard`,
    playzone: (agentId) => `/agent/${agentId}/playzone`,
    achievements: (agentId) => `/agent/${agentId}/achievements`,
    rewardsVault: (agentId) => `/agent/${agentId}/rewards-vault`,
    scratchCard: (agentId) => `/agent/${agentId}/playzone/scratch`,
    claimScratchReward: (agentId) => `/agent/${agentId}/playzone/scratch/claim`,
    spinWheel: (agentId) => `/agent/${agentId}/playzone/spin`,
    claimSpinReward: (agentId) => `/agent/${agentId}/playzone/spin/claim`,
    acceptChallenge: (agentId, challengeId) => `/agent/${agentId}/playzone/challenge/${challengeId}/accept`,
    historicalPerformance: (agentId) => `/agent/${agentId}/historical-performance`,
    dailyPerformanceScores: (agentId) => `/agent/${agentId}/daily-performance-scores`,
    weeklyPointTrajectory: (agentId) => `/agent/${agentId}/weekly-point-trajectory`,
    pointsActivityLog: (agentId) => `/agent/${agentId}/points-activity-log`,
  },

  // Manager Endpoints
  manager: {
    overview: (managerId) => `/manager/${managerId}/overview`,
    teamPerformance: (managerId) => `/manager/${managerId}/team-performance`,
    contests: (managerId) => `/manager/${managerId}/contests`,
    rewardsAudit: (managerId) => `/manager/${managerId}/rewards-audit`,
    createContest: '/manager/contests',
    updateContest: (contestId) => `/manager/contests/${contestId}`,
    deleteContest: (contestId) => `/manager/contests/${contestId}`,
  },

  // Leadership Endpoints
  leadership: {
    overview: '/leadership/overview',
    leaderboards: '/leadership/leaderboards',
    reports: '/leadership/reports',
    roi: '/leadership/roi',
    exportReport: '/leadership/reports/export',
  },

  // Admin Endpoints
  admin: {
    overview: '/admin/overview',
    metrics: '/admin/metrics',
    createMetric: '/admin/metrics',
    updateMetric: (metricId) => `/admin/metrics/${metricId}`,
    deleteMetric: (metricId) => `/admin/metrics/${metricId}`,
    pointsRules: '/admin/points-rules',
    updatePointsRules: '/admin/points-rules',
    simulatePointsRules: '/admin/points-rules/simulate',
    rewardsCatalog: '/admin/rewards-catalog',
    createReward: '/admin/rewards-catalog',
    updateReward: (rewardId) => `/admin/rewards-catalog/${rewardId}`,
    deleteReward: (rewardId) => `/admin/rewards-catalog/${rewardId}`,
    updateStock: (rewardId) => `/admin/rewards-catalog/${rewardId}/stock`,
    auditLogs: '/admin/audit-logs',
    toggleTrigger: (triggerName) => `/admin/audit-logs/triggers/${triggerName}`,
    exportAudit: (reportType) => `/admin/audit-logs/export/${reportType}`,
    // Contest endpoints
    contests: '/admin/contests',
    activeContests: '/admin/contests/active',
    createContest: '/admin/contests',
    updateContest: (contestId) => `/admin/contests/${contestId}`,
    deleteContest: (contestId) => `/admin/contests/${contestId}`,
    publishContest: (contestId) => `/admin/contests/${contestId}/publish`,
  },
};

export default ENDPOINTS;
