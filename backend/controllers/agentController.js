const roleService = require('../services/roleService');
const scoreService = require('../services/scoreService');
const dataService = require('../services/dataService');
const guidesService = require('../services/guidesService');
const historicalPerformanceService = require('../services/historicalPerformanceService');

// Helper functions
function getCurrentWeek() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
}

function getDailyMissions(guide) {
  if (!guide) return [];
  return [
    {
      id: 1,
      title: `Maintain AHT below 20`,
      progress: Math.min(100 - (guide.metrics.aht / 20) * 100, 100),
      total: 100,
      reward: 50,
      completed: guide.metrics.aht <= 20,
      current: guide.metrics.aht
    },
    {
      id: 2,
      title: `Achieve AOS above 100`,
      progress: Math.min(guide.metrics.aos, 100),
      total: 100,
      reward: 100,
      completed: guide.metrics.aos >= 100,
      current: guide.metrics.aos
    },
    {
      id: 3,
      title: `Generate $500 revenue`,
      progress: Math.min(guide.metrics.revenue, 500),
      total: 500,
      reward: 75,
      id: 1, 
      title: 'NRPC Target', 
      value: guide.metrics.nrpc, 
      target: 30, 
      progress: Math.min((guide.metrics.nrpc / 30) * 100, 100), 
      reward: 200 
    },
    { 
      id: 2, 
      title: 'NConv%', 
      value: (guide.metrics.nconv_pct * 100).toFixed(1) + '%', 
      target: '20%', 
      progress: Math.min(guide.metrics.nconv_pct * 100, 100), 
      reward: 150 
    },
    { 
      id: 3, 
      title: 'NPS Score', 
      value: guide.metrics.nps, 
      target: 50, 
      progress: Math.min((guide.metrics.nps / 50) * 100, 100), 
      reward: 250 
    },
    { 
      id: 4, 
      title: 'AOS Target', 
      value: guide.metrics.aos.toFixed(2), 
      target: 100, 
      progress: Math.min((guide.metrics.aos / 100) * 100, 100), 
      reward: 180 
    },
    { 
      id: 5, 
      title: 'QA Score', 
      value: guide.metrics.qa_score, 
      target: 4, 
      progress: Math.min((guide.metrics.qa_score / 4) * 100, 100), 
      reward: 300 
    }
  ];
}

function getScratchCards() {
  return [
    { id: 1, type: 'bronze', unlocked: true, scratched: false },
    { id: 2, type: 'silver', unlocked: false, scratched: false },
    { id: 3, type: 'gold', unlocked: false, scratched: false }
  ];
}

function timeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

function getBadges(streak, score) {
  const badges = [];
  
  if (streak >= 7) badges.push({ id: 1, name: 'Week Warrior', description: '7 day streak', icon: '🔥', unlocked: true });
  if (streak >= 30) badges.push({ id: 2, name: 'Month Master', description: '30 day streak', icon: '👑', unlocked: true });
  if (score >= 95) badges.push({ id: 3, name: 'Quality King', description: '95%+ QA score', icon: '⭐', unlocked: true });
  if (score >= 98) badges.push({ id: 4, name: 'Perfectionist', description: '98%+ QA score', icon: '💎', unlocked: true });
  
  // Add some locked badges
  badges.push({ id: 5, name: 'Century Club', description: '100 day streak', icon: '🏆', unlocked: false });
  badges.push({ id: 6, name: 'Legend', description: '99%+ QA score', icon: '🌟', unlocked: false });
  
  return badges;
}

function getWeeklyChallenges(guide) {
  if (!guide) return [];
  return [
    {
      id: 1,
      title: 'Maintain QA Score',
      description: 'Keep QA score above 85%',
      points: 20,
      progress: Math.min((guide.metrics.qa / 85) * 100, 100),
      completed: guide.metrics.qa >= 85,
      reward: 20
    },
    {
      id: 2,
      title: 'NRPC Target',
      description: 'Achieve NRPC of 30+',
      points: 30,
      progress: Math.min((guide.metrics.nrpc / 30) * 100, 100),
      completed: guide.metrics.nrpc >= 30,
      reward: 30
    },
    {
      id: 3,
      title: 'NPS Excellence',
      description: 'Reach NPS score of 50+',
      points: 20,
      progress: Math.min((guide.metrics.nps / 50) * 100, 100),
      completed: guide.metrics.nps >= 50,
      reward: 20
    },
    {
      id: 4,
      title: 'Handle Time Target',
      description: 'Maintain AHT below 23 mins',
      points: 20,
      progress: Math.min((23 / guide.metrics.aht) * 100, 100),
      completed: guide.metrics.aht <= 23,
      reward: 20
    },
    {
      id: 5,
      title: 'Revenue Goal',
      description: 'Generate $500+ revenue',
      points: 10,
      progress: Math.min((guide.metrics.revenue / 500) * 100, 100),
      completed: guide.metrics.revenue >= 500,
      reward: 10
    }
  ];
}

function getLevelTiers() {
  return [
    { level: 1, name: 'Beginner', minXP: 0, maxXP: 999, color: '#94a3b8' },
    { level: 2, name: 'Intermediate', minXP: 1000, maxXP: 4999, color: '#3b82f6' },
    { level: 3, name: 'Expert', minXP: 5000, maxXP: 14999, color: '#10b981' },
    { level: 4, name: 'Elite', minXP: 15000, maxXP: 49999, color: '#f59e0b' },
    { level: 5, name: 'Master', minXP: 50000, maxXP: Infinity, color: '#ef4444' }
  ];
}

class AgentController {
  // GET /api/agent/{agentId}/dashboard
  async getDashboard(req, res) {
    try {
      const { agentId } = req.params;
      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const calculated = guide.calculated;
      
      // Get all guides and calculate ranking
      const allGuides = guidesService.getAllGuides();
      const sorted = allGuides.sort((a, b) => b.calculated.xp - a.calculated.xp);
      const rankPosition = sorted.findIndex(g => g.guide_id === agentId) + 1;
      const totalAgents = allGuides.length;
      const percentile = Math.round(((totalAgents - rankPosition + 1) / totalAgents) * 100);
      
      const metrics = [
        {
          key: 'aht',
          title: 'Handle Time',
          value: `${Math.floor(guide.metrics.aht)}:${String(Math.round((guide.metrics.aht % 1) * 60)).padStart(2, '0')}`, // Current (lower is better)
          target: `23:00`, // Target (reversed - shows target first in display)
          progress: Math.min((23 / guide.metrics.aht) * 100, 100), // Lower better: target/actual
          status: guide.metrics.aht <= 23 ? 'excellent' : guide.metrics.aht <= 25 ? 'on-track' : 'at-risk'
        },
        {
          key: 'qa',
          title: 'Quality Score',
          value: guide.metrics.qa.toString(),
          target: `Target: 80`,
          progress: Math.min((guide.metrics.qa / 80) * 100, 100),
          status: guide.metrics.qa >= 80 ? 'excellent' : guide.metrics.qa >= 70 ? 'on-track' : 'at-risk'
        },
        {
          key: 'revenue',
          title: 'Revenue',
          value: `$${guide.metrics.revenue}`,
          target: `Target: $500`,
          progress: Math.min((guide.metrics.revenue / 500) * 100, 100),
          status: guide.metrics.revenue >= 500 ? 'excellent' : guide.metrics.revenue >= 300 ? 'on-track' : 'at-risk'
        }
      ];

      const leaderboard = allGuides
        .sort((a, b) => b.calculated.xp - a.calculated.xp)
        .slice(0, 5)
        .map((g, index) => ({
          rank: index + 1,
          name: g.name,
          avatar: g.name.split(' ').map(n => n[0]).join(''),
          points: g.calculated.points,
          trend: 'neutral'
        }));

      const response = {
        score: calculated.points,
        xp: calculated.xp,
        ranking: `${rankPosition}/${totalAgents}`,
        percentile: percentile,
        level: Math.floor(Math.sqrt(calculated.xp / 100)) + 1,
        nextLevelXP: (Math.floor(Math.sqrt(calculated.xp / 100)) + 1) * (Math.floor(Math.sqrt(calculated.xp / 100)) + 1) * 100,
        levelProgress: ((calculated.xp % 100) / 100) * 100,
        streak: guide.streak,
        countdown: { hours: 4, minutes: 23, seconds: 15 },
        metrics,
        leaderboard,
        gamification: {
          wheelUnlocked: calculated.points >= 250,
          scratchCardsAvailable: calculated.xp >= 8 ? 1 : 0,
          tokensEarned: calculated.xp,
          tokensNeeded: 8
        }
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/performance
  async getPerformance(req, res) {
      const { timeFilter = "this-week" } = req.query; // Support "this-week" or "this-month"
    try {
      const { agentId } = req.params;
      const { timeFilter } = req.query;
      // timeFilter: "this-week" or "this-month"
      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const teamGuides = guidesService.getGuidesBySupervisor(guide.supervisor);
      const avgScore = teamGuides.reduce((sum, g) => sum + g.calculated.points, 0) / teamGuides.length;
      const rank = teamGuides.sort((a, b) => b.calculated.xp - a.calculated.xp).findIndex(g => g.guide_id === agentId) + 1;

      // Generate dummy KPI data for graphs
      const generateKpiData = (metric, baseValue) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map((name, idx) => ({
          name,
          value: Math.round(baseValue + (Math.random() - 0.5) * (baseValue * 0.3))
        }));
      };

      // Generate weekly breakdown data for 4 weeks
      const weeklyBreakdowns = [1, 2, 3, 4].map(week => ({
        week: `Week ${week}`,
        points: 500 + (week * 150) + Math.floor(Math.random() * 200),
        trend: week > 2 ? '+12%' : '-5%',
        days: [
          { day: 'Mon', points: 200 + week * 20 },
          { day: 'Tue', points: 250 + week * 15 },
          { day: 'Wed', points: 180 + week * 25 },
          { day: 'Thu', points: 300 + week * 10 },
          { day: 'Fri', points: 280 + week * 20 },
          { day: 'Sat', points: 150 + week * 30 },
          { day: 'Sun', points: 220 + week * 18 }
        ]
      }));

      const response = {
        totalPoints: guide.calculated.points,
        totalXPEarned: guide.calculated.xp || 0,
        totalXPSEarned: guide.calculated.xps || 0,
        totalPointsGained: Math.floor(guide.calculated.points * 0.3),
        currentStreak: guide.streak,
        avgScore: avgScore.toFixed(2),
        rank: rank,
        agent: {
          name: guide.name,
          avatar: guide.name.split(' ').map(n => n[0]).join(''),
          rank: rank,
          team: guide.supervisor,
          percentile: Math.round((1 - (rank - 1) / teamGuides.length) * 100)
        },
        weeklyData: [
          { day: 'Mon', points: guide.calculated.points, team: avgScore, target: 80 },
          { day: 'Tue', points: guide.calculated.points, team: avgScore, target: 80 },
          { day: 'Wed', points: guide.calculated.points, team: avgScore, target: 80 },
          { day: 'Thu', points: guide.calculated.points, team: avgScore, target: 80 },
          { day: 'Fri', points: guide.calculated.points, team: avgScore, target: 80 },
          { day: 'Sat', points: guide.calculated.points, team: avgScore, target: 80 },
          { day: 'Sun', points: guide.calculated.points, team: avgScore, target: 80 }
        ],
        metrics: [
          {
            key: 'qa',
            title: 'Quality Score',
            value: guide.metrics.qa,
            prefix: '',
            suffix: '',
            target: '4',
            progress: Math.min((guide.metrics.qa / 4) * 100, 100),
            change: '+2.1%',
            status: guide.metrics.qa >= 4 ? 'excellent' : guide.metrics.qa >= 3 ? 'on-track' : 'at-risk',
            statusLabel: guide.metrics.qa >= 4 ? 'Excellent' : guide.metrics.qa >= 3 ? 'On Track' : 'At Risk'
          },
          {
            key: 'revenue',
            title: 'Revenue',
            value: guide.metrics.revenue,
            prefix: '$',
            suffix: '',
            target: '$500',
            progress: Math.min((guide.metrics.revenue / 500) * 100, 100),
            change: '+5.0%',
            status: guide.metrics.revenue >= 500 ? 'excellent' : guide.metrics.revenue >= 300 ? 'on-track' : 'at-risk',
            statusLabel: guide.metrics.revenue >= 500 ? 'Excellent' : guide.metrics.revenue >= 300 ? 'On Track' : 'At Risk'
          },
          {
            key: 'aht',
            title: 'AHT',
            value: guide.metrics.aht,
            prefix: '',
            suffix: ' min',
            target: '20 min',
            progress: Math.min((20 / guide.metrics.aht) * 100, 100),
            change: '-1.2%',
            status: guide.metrics.aht <= 20 ? 'excellent' : guide.metrics.aht <= 25 ? 'on-track' : 'at-risk',
            statusLabel: guide.metrics.aht <= 20 ? 'Excellent' : guide.metrics.aht <= 25 ? 'On Track' : 'At Risk'
          },
          {
            key: 'nps',
            title: 'NPS',
            value: guide.metrics.nps,
            prefix: '',
            suffix: '',
            target: '50',
            progress: Math.min((guide.metrics.nps / 50) * 100, 100),
            change: '+3.5%',
            status: guide.metrics.nps >= 50 ? 'excellent' : guide.metrics.nps >= 30 ? 'on-track' : 'at-risk',
            statusLabel: guide.metrics.nps >= 50 ? 'Excellent' : guide.metrics.nps >= 30 ? 'On Track' : 'At Risk'
          }
        ],
        pointsLog: [
          { id: 1, source: 'QA Bonus', category: 'QA', amount: 50, time: '2 hours ago' },
          { id: 2, source: 'Revenue Milestone', category: 'Revenue', amount: 100, time: '1 day ago' }
        ],
        // KPI Data for graphs
        kpiData: {
          newRevenue: generateKpiData('newRevenue', 45),
          aht: generateKpiData('aht', 22),
          qaScore: generateKpiData('qaScore', 78),
          nrpc: generateKpiData('nrpc', 48),
          newConversionPct: generateKpiData('newConversionPct', 16),
          nps: generateKpiData('nps', 72)
        },
        // Weekly breakdown data
        weeklyBreakdowns: weeklyBreakdowns,
        // XPS data
        rewardsClaimed: Math.floor(Math.random() * 15) + 5,
        xpsData: {
          dailyXPS: generateKpiData('xps', 35),
          weeklyXPS: Math.floor(Math.random() * 500) + 200,
          monthlyXPS: Math.floor(Math.random() * 2000) + 800
        }
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/leaderboard
  async getLeaderboard(req, res) {
    try {
      const { agentId } = req.params;
      const { viewType = 'individual', timeRange = 'weekly', department } = req.query;

      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      let filteredGuides;
      if (timeRange === 'weekly' || timeRange === 'team' || timeRange === 'current-team') {
        // Team: same supervisor
        filteredGuides = guidesService.getGuidesBySupervisor(guide.supervisor);
      } else if (timeRange === 'monthly' || timeRange === 'department' || timeRange === 'departments') {
        // Department - use provided department or user's department
        const dept = department || guide.department;
        filteredGuides = guidesService.getGuidesByDepartment(dept);
      } else if (timeRange === 'all-departments') {
        // All departments
        filteredGuides = guidesService.getAllGuides();
      } else {
        // All time: all guides
        filteredGuides = guidesService.getAllGuides();
      }

      const allDepartments = [...new Set(guidesService.getAllGuides().map(g => g.department))].sort();

      const sortedGuides = filteredGuides.sort((a, b) => b.calculated.xp - a.calculated.xp);
      const currentRank = sortedGuides.findIndex(g => g.guide_id === agentId) + 1;

      const response = {
        lastUpdated: new Date().toLocaleString(),
        currentWeek: getCurrentWeek(),
        levelTiers: getLevelTiers(),
        allDepartments,
        weeklyRewards: {
          top3: { points: 500, scratchCards: 3 },
          top10: { points: 250, scratchCards: 2 },
          top25Percent: { points: 100, scratchCards: 1 }
        },
        currentUser: {
          rank: currentRank,
          name: guide.name,
          xp: guide.calculated.xp,
          level: 'Elite',
          percentile: Math.round((1 - (currentRank - 1) / sortedGuides.length) * 100)
        },
        topThree: sortedGuides.slice(0, 3).map((g, index) => ({
          rank: index + 1,
          name: g.name,
          avatar: g.name.split(' ').map(n => n[0]).join(''),
          department: g.department,
          points: g.calculated.points,
          xp: g.calculated.xp,
          level: 'Elite'
        })),
        leaderboard: sortedGuides.map((g, index) => ({
          rank: index + 1,
          name: g.name,
          avatar: g.name.split(' ').map(n => n[0]).join(''),
          department: g.department,
          region: 'North',
          points: g.calculated.points,
          xp: g.calculated.xp,
          level: 'Elite',
          trend: '0',
          trendType: 'neutral'
        }))
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/playzone
  async getPlayzone(req, res) {
    try {
      const { agentId } = req.params;
      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const tokenBalance = guide.calculated.points || 0;
      const tokensNeeded = 250; // Points needed to unlock spin wheel (as per requirements)
      
      // Check if all weekly challenges are completed for wheel unlock
      const challenges = getWeeklyChallenges(guide);
      const allChallengesCompleted = challenges.length > 0 && challenges.every(c => c.progress >= 100);
      const wheelUnlockedByPoints = tokenBalance >= tokensNeeded;
      const wheelUnlockedByChallenges = allChallengesCompleted;
      
      // Generate scratch cards data (5 days)
      const today = new Date();
      const scratchCards = [
        {
          id: 'sc-today',
          date: today.toISOString().split('T')[0],
          name: 'Daily Performance',
          status: 'pending',
          reward: null,
          expiresIn: '23h 45m',
          points: null,
          claimedAt: null,
          cardDesign: {
            icon: '📊',
            gradient: 'from-blue-600 to-cyan-500',
            hint: 'Performance based reward'
          }
        },
        {
          id: 'sc-1d',
          date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'QA Excellence',
          status: 'pending',
          reward: null,
          expiresIn: '12h 30m',
          points: null,
          claimedAt: null,
          cardDesign: {
            icon: '⭐',
            gradient: 'from-yellow-600 to-orange-500',
            hint: 'Quality achievement reward'
          }
        },
        {
          id: 'sc-2d',
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'NPS Achievement',
          status: 'scratched',
          reward: '+250 PTS',
          expiresIn: null,
          points: 250,
          claimedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          cardDesign: {
            icon: '😊',
            gradient: 'from-green-600 to-emerald-500',
            hint: 'Customer satisfaction bonus'
          }
        },
        {
          id: 'sc-3d',
          date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'NRPC Target Hit',
          status: 'scratched',
          reward: '+450 PTS',
          expiresIn: null,
          points: 450,
          claimedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          cardDesign: {
            icon: '🎯',
            gradient: 'from-purple-600 to-pink-500',
            hint: 'Revenue target achievement'
          }
        },
        {
          id: 'sc-4d',
          date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'Daily Streak',
          status: 'expired',
          reward: null,
          expiresIn: null,
          points: null,
          claimedAt: null,
          cardDesign: {
            icon: '🔥',
            gradient: 'from-red-600 to-orange-500',
            hint: 'Streak bonus'
          }
        }
      ];
      
      const response = {
        streak: guide.streak || 1,
        totalPoints: Math.round(guide.calculated.points || 0),
        totalXPS: Math.round(guide.calculated.xp || 0),
        tokenBalance: Math.round(tokenBalance),
        tokensNeeded: tokensNeeded,
        wheelUnlocked: wheelUnlockedByPoints || wheelUnlockedByChallenges,
        countdown: { hours: 4, minutes: 23, seconds: 15 },
        dailyMissions: getDailyMissions(guide),
        weeklyChallenges: getWeeklyChallenges(guide),
        scratchCards: scratchCards,
        earningHistory: [
          { id: 'e1', source: 'Daily Mission', amount: 100, time: '2 hours ago', status: 'claimed' },
          { id: 'e2', source: 'Spin Wheel', amount: 250, time: '5 hours ago', status: 'claimed' },
          { id: 'e3', source: 'Challenge Bonus', amount: 75, time: '1 day ago', status: 'claimed' }
        ],
        todaysPerformance: {
          meetsThreshold: (guide.calculated.points || 0) >= 50,
          metric: { name: 'Revenue', value: `$${Math.round(guide.metrics?.revenue || 0)}`, target: '$500' }
        },
        scratchReward: '+500 PTS',
        weekRange: getCurrentWeek()
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/achievements
  async getAchievements(req, res) {
    try {
      const { agentId } = req.params;
      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const allGuides = guidesService.getAllGuides();
      const sorted = allGuides.sort((a, b) => b.calculated.xp - a.calculated.xp);
      const rank = sorted.findIndex(g => g.guide_id === agentId) + 1;
      const total = allGuides.length;
      const level = rank <= total * 0.2 ? 'Master' : rank <= total * 0.45 ? 'Elite' : rank <= total * 0.7 ? 'Expert' : rank <= total * 0.9 ? 'Intermediate' : 'Beginner';

      const response = {
        level: 12, // Mock
        title: 'Elite Performer',
        currentXP: guide.calculated.xp,
        nextLevelXP: 5000,
        levelProgress: (guide.calculated.xp / 50), // Mock
        badges: [
          {
            id: 'b1',
            title: 'Streak Master',
            description: 'Maintained 7-day streak',
            icon: 'flame',
            color: 'from-amber-500 to-orange-600',
            earned: guide.streak >= 7,
            date: 'Jan 15, 2024',
            progress: guide.streak
          }
        ]
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/rewards-vault
  async getRewardsVault(req, res) {
    try {
      const { agentId } = req.params;
      const roleData = roleService.getAgentData(agentId);
      const rewardsCatalog = dataService.getData('rewardsCatalog');

      // Generate scratch cards data (5 days) - with card design details
      const today = new Date();
      const scratchCards = [
        {
          id: 'sc-today',
          date: today.toISOString().split('T')[0],
          name: 'Daily Performance',
          status: 'pending',
          reward: null,
          expiresIn: '23h 45m',
          points: null,
          claimedAt: null,
          cardDesign: {
            icon: '📊',
            gradient: 'from-blue-600 to-cyan-500',
            hint: 'Performance based reward'
          }
        },
        {
          id: 'sc-1d',
          date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'QA Excellence',
          status: 'pending',
          reward: null,
          expiresIn: '12h 30m',
          points: null,
          claimedAt: null,
          cardDesign: {
            icon: '⭐',
            gradient: 'from-yellow-600 to-orange-500',
            hint: 'Quality achievement reward'
          }
        },
        {
          id: 'sc-2d',
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'NPS Achievement',
          status: 'scratched',
          reward: '+250 PTS',
          expiresIn: null,
          points: 250,
          claimedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          cardDesign: {
            icon: '😊',
            gradient: 'from-green-600 to-emerald-500',
            hint: 'Customer satisfaction bonus'
          }
        },
        {
          id: 'sc-3d',
          date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'NRPC Target Hit',
          status: 'scratched',
          reward: '+450 PTS',
          expiresIn: null,
          points: 450,
          claimedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          cardDesign: {
            icon: '🎯',
            gradient: 'from-purple-600 to-pink-500',
            hint: 'Revenue target achievement'
          }
        },
        {
          id: 'sc-4d',
          date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: 'Daily Streak',
          status: 'expired',
          reward: null,
          expiresIn: null,
          points: null,
          claimedAt: null,
          cardDesign: {
            icon: '🔥',
            gradient: 'from-red-600 to-orange-500',
            hint: 'Streak bonus'
          }
        }
      ];

      // Generate spin wheel wins (1 month)
      const spinWins = [];
      const rewards = [
        { reward: '+500 PTS', type: 'points', points: 500 },
        { reward: '+250 PTS', type: 'points', points: 250 },
        { reward: '+100 PTS', type: 'points', points: 100 },
        { reward: '+1000 PTS', type: 'points', points: 1000 },
        { reward: 'SPIN TOKEN', type: 'spin', points: 0 },
        { reward: 'MYSTERY BOX', type: 'mystery', points: 0 }
      ];
      for (let i = 0; i < 12; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const spinDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        spinWins.push({
          id: `spin-${i}`,
          date: spinDate.toISOString().split('T')[0],
          reward: reward.reward,
          type: reward.type,
          points: reward.points,
          claimedAt: spinDate.toLocaleDateString(),
          spinTokensUsed: 1
        });
      }

      // Vault Rank Progress
      const userBalance = roleData.gamification.totalPoints || 0;
      const userRank = Math.floor((userBalance / 10000) * 5) + 1; // Levels 1-5 based on points
      const nextRankPoints = (userRank * 10000);
      const pointsToNextRank = Math.max(0, nextRankPoints - userBalance);

      const response = {
        availablePoints: roleData.gamification.totalPoints,
        level: roleData.gamification.level || 1,
        nextLevelXP: roleData.gamification.nextLevelXP || 1000,
        userRank: userRank,
        userBalance: userBalance,
        nextRankPoints: nextRankPoints,
        nextRank: userRank + 1,
        rewards: rewardsCatalog.slice(0, 10).map(reward => ({
          id: reward.reward_id,
          title: reward.name,
          name: reward.name,
          description: reward.description,
          category: reward.category,
          points: reward.point_cost,
          pointCost: reward.point_cost,
          rarity: reward.point_cost > 4000 ? 'legendary' : reward.point_cost > 2000 ? 'epic' : reward.point_cost > 500 ? 'rare' : 'common',
          inStock: reward.stock !== 'Unlimited' ? reward.stock > 0 : true,
          stock: reward.stock !== 'Unlimited' ? reward.stock : null,
          stockCount: reward.stock !== 'Unlimited' ? reward.stock : null,
          image: reward.image || '🎁',
          status: reward.status,
          requiredRank: Math.floor(reward.point_cost / 2000) + 1
        })),
        claimHistory: roleData.pointsHistory.filter(entry => entry.points < 0).map(entry => ({
          id: entry.transaction_id,
          rewardName: 'Reward Claimed', // Mock
          pointsSpent: Math.abs(entry.points),
          claimedAt: entry.date.split('T')[0],
          status: 'delivered'
        })).concat([
          {
            id: 'mock_1',
            rewardName: 'Premium Headset',
            pointsSpent: 2500,
            claimedAt: '2024-01-15',
            status: 'delivered'
          },
          {
            id: 'mock_2', 
            rewardName: 'Gift Card - $50',
            pointsSpent: 1200,
            claimedAt: '2024-01-10',
            status: 'processing'
          },
          {
            id: 'mock_3',
            rewardName: 'Extra Vacation Day',
            pointsSpent: 3000,
            claimedAt: '2024-01-05',
            status: 'delivered'
          }
        ]).slice(0, 5),
        scratchCards,
        spinWins
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }
  async getHistoricalPerformance(req, res) {
    try {
      const { agentId } = req.params;
      const { days = 5 } = req.query;
      
      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const performanceSummary = historicalPerformanceService.getLast5DaysPerformanceSummary(agentId);
      
      res.json(performanceSummary);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/daily-performance-scores
  async getDailyPerformanceScores(req, res) {
    try {
      const { agentId } = req.params;
      const { days = 7 } = req.query;

      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const dailyScores = historicalPerformanceService.getDailyPerformanceScores(agentId, parseInt(days));
      
      res.json({ dailyScores });
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/weekly-point-trajectory
  async getWeeklyPointTrajectory(req, res) {
    try {
      const { agentId } = req.params;

      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const weeklyTrajectory = historicalPerformanceService.getWeeklyPointTrajectory(agentId);
      
      res.json({ weeks: weeklyTrajectory });
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // GET /api/agent/{agentId}/points-activity-log
  async getPointsActivityLog(req, res) {
    try {
      const { agentId } = req.params;
      const { period = 'week' } = req.query;

      const guide = guidesService.getGuide(agentId);
      if (!guide) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Guide not found' } });
      }

      const activityLog = historicalPerformanceService.getPointsActivityLog(agentId, period);
      
      res.json(activityLog);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  // Helper methods
  getCountdown() {
    // Calculate time until next daily reset (assuming 6 AM)
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(6, 0, 0, 0);
    if (now > resetTime) {
      resetTime.setDate(resetTime.getDate() + 1);
    }
    const diff = resetTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }

  formatMetrics(kpiBreakdown) {
    // kpiBreakdown is an object, convert to array
    return Object.entries(kpiBreakdown).map(([key, kpi]) => ({
      key,
      title: kpi.name,
      value: this.formatValue(kpi.value, kpi.unit),
      target: `Target: ${this.formatValue(kpi.target, kpi.unit)}`,
      progress: kpi.rawScore,
      status: kpi.status
    }));
  }

  formatValue(value, unit) {
    if (unit === 'seconds') return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
    if (unit === '%') return `${value}%`;
    if (unit === '$') return `$${value}`;
    return value.toString();
  }

  getTopLeaderboard() {
    // Return top 5 from leaderboard
    const leaderboard = scoreService.calculateLeaderboard('weekly');
    return leaderboard.slice(0, 5).map(user => ({
      rank: user.rank,
      name: user.name,
      avatar: user.name.split(' ').map(n => n[0]).join(''),
      points: user.total_points,
      trend: user.rank < 3 ? 'up' : 'neutral'
    }));
  }

  calculatePercentile(agentId) {
    // Mock percentile calculation
    return Math.floor(Math.random() * 20) + 80; // 80-99 percentile
  }

  formatDetailedMetrics(kpiBreakdown) {
    return kpiBreakdown.map(kpi => ({
      key: kpi.metric,
      name: kpi.metric.replace('_', ' ').toUpperCase(),
      value: kpi.score,
      target: kpi.target || 100,
      change: Math.floor(Math.random() * 10) - 5, // -5 to +5
      status: kpi.score >= 90 ? 'Excellent' : kpi.score >= 75 ? 'Good' : kpi.score >= 60 ? 'Needs Improvement' : 'Critical',
      trend: 'up'
    }));
  }

  timeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  getCurrentUserPosition(leaderboard, userId) {
    // Mock current user position
    return {
      rank: Math.floor(Math.random() * 50) + 1,
      name: 'Current User',
      xp: Math.floor(Math.random() * 5000) + 1000,
      level: 'Gold',
      percentile: Math.floor(Math.random() * 30) + 70
    };
  }

  // Get spin wheel rewards history (last 1 month)
  getSpinWheelRewardsHistory(agentId) {
    const today = new Date();
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const rewards = [
      { reward: '+500 PTS', type: 'points', points: 500 },
      { reward: '+250 PTS', type: 'points', points: 250 },
      { reward: '+100 PTS', type: 'points', points: 100 },
      { reward: '+1000 PTS', type: 'points', points: 1000 },
      { reward: 'SPIN TOKEN', type: 'spin', points: 0 },
      { reward: 'MYSTERY BOX', type: 'mystery', points: 0 }
    ];
    
    // Generate dummy data for last 1 month
    const spinWheelHistory = [];
    for (let i = 0; i < 12; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const spinDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      
      spinWheelHistory.push({
        id: `spin-${i}`,
        date: spinDate.toISOString().split('T')[0],
        reward: reward.reward,
        type: reward.type,
        points: reward.points,
        claimedAt: spinDate.toLocaleDateString(),
        spinTokensUsed: 1
      });
    }
    
    return spinWheelHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

module.exports = new AgentController();