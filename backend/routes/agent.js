const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const guidesService = require('../services/guidesService');


router.get('/:agentId/dashboard', agentController.getDashboard);
router.get('/:agentId/performance', agentController.getPerformance);
router.get('/:agentId/leaderboard', agentController.getLeaderboard);
router.get('/:agentId/playzone', agentController.getPlayzone);
router.get('/:agentId/achievements', agentController.getAchievements);
router.get('/:agentId/rewards-vault', agentController.getRewardsVault);
router.get('/:agentId/historical-performance', agentController.getHistoricalPerformance);
router.get('/:agentId/daily-performance-scores', agentController.getDailyPerformanceScores);
router.get('/:agentId/weekly-point-trajectory', agentController.getWeeklyPointTrajectory);
router.get('/:agentId/points-activity-log', agentController.getPointsActivityLog);

router.post('/:agentId/playzone/scratch', (req, res) => {

  const rewards = [
    { reward: '+500 PTS', points: 500, type: 'points' },
    { reward: '+250 PTS', points: 250, type: 'points' },
    { reward: '+100 PTS', points: 100, type: 'points' },
    { reward: '+1000 PTS', points: 1000, type: 'points' },
    { reward: 'SPIN TOKEN', points: 0, type: 'spin' },
    { reward: 'MYSTERY BOX', points: 0, type: 'mystery' },
  ];
  const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
  res.json({ ...randomReward, revealed: true });
});


router.post('/:agentId/playzone/scratch/claim', (req, res) => {
  try {
    const { agentId } = req.params;
    const { reward, points } = req.body;
    
    const guide = guidesService.getGuide(agentId);
    if (!guide) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    }
    
    // Add points to guide's calculated points
    if (points && points > 0) {
      guide.calculated.points += points;
      guide.calculated.xp += Math.floor(points / 10); // Convert points to XP
    }
    
    // Return updated balance
    res.json({ 
      success: true, 
      reward,
      pointsAdded: points,
      newBalance: guide.calculated.points,
      newXP: guide.calculated.xp,
      message: `${reward} claimed successfully!`
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Spin wheel - deducts tokens and awards reward
router.post('/:agentId/playzone/spin', (req, res) => {
  try {
    const { agentId } = req.params;
    const { tokenCost = 100 } = req.body;
    
    const guide = guidesService.getGuide(agentId);
    if (!guide) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    }
    
    // Check if user has enough tokens (using points as tokens for simplicity)
    const currentTokens = guide.calculated?.spinTokens || guide.calculated?.points || 0;
    if (currentTokens < tokenCost) {
      return res.status(400).json({ 
        error: { 
          code: 'INSUFFICIENT_TOKENS', 
          message: `Not enough tokens. Need ${tokenCost}, have ${currentTokens}` 
        } 
      });
    }
    
    // Generate random wheel spin reward
    const rewards = [
      { label: '+500', sublabel: 'PTS', points: 500, xp: 0, tone: 'primary' },
      { label: '+100', sublabel: 'XP', points: 0, xp: 100, tone: 'secondary' },
      { label: 'x2', sublabel: 'Multiplier', points: 200, xp: 50, tone: 'primary' },
      { label: '+250', sublabel: 'PTS', points: 250, xp: 0, tone: 'primary' },
      { label: 'Mystery', sublabel: 'Box', points: 300, xp: 75, tone: 'secondary' },
      { label: 'x3', sublabel: 'Multiplier', points: 400, xp: 100, tone: 'primary' },
      { label: '+50', sublabel: 'XP', points: 0, xp: 50, tone: 'secondary' },
      { label: 'Elite', sublabel: 'Gift', points: 1000, xp: 200, tone: 'accent' },
    ];
    
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const wonReward = rewards[randomIndex];
    
    // Deduct tokens (using points as tokens)
    if (!guide.calculated) guide.calculated = { points: 0, xp: 0 };
    guide.calculated.points = Math.max(0, (guide.calculated.points || 0) - tokenCost);
    
    res.json({ 
      success: true,
      spun: true,
      segmentIndex: randomIndex,
      reward: wonReward,
      tokensDeducted: tokenCost,
      newTokenBalance: guide.calculated.points,
      message: `You won ${wonReward.label} ${wonReward.sublabel}!`
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Claim spin wheel reward - records points/xp to agent
router.post('/:agentId/playzone/spin/claim', (req, res) => {
  try {
    const { agentId } = req.params;
    const { reward } = req.body; // { label, sublabel, points, xp }
    
    const guide = guidesService.getGuide(agentId);
    if (!guide) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    }
    
    if (!guide.calculated) guide.calculated = { points: 0, xp: 0 };
    
    // Add points and XP from the reward
    const pointsWon = reward?.points || 0;
    const xpWon = reward?.xp || 0;
    
    guide.calculated.points += pointsWon;
    guide.calculated.xp += xpWon;
    
    res.json({ 
      success: true, 
      reward: `${reward?.label || ''} ${reward?.sublabel || ''}`.trim(),
      pointsAdded: pointsWon,
      xpAdded: xpWon,
      newBalance: guide.calculated.points,
      newXP: guide.calculated.xp,
      message: `${reward?.label || 'Reward'} ${reward?.sublabel || ''} claimed successfully!`
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/:agentId/playzone/challenge/:challengeId/accept', (req, res) => {
  // Mock challenge acceptance
  res.json({ accepted: true, challengeId: req.params.challengeId });
});

module.exports = router;