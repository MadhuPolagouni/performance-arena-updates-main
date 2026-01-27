
const KPI_CONFIG = {
  new_refund_pct: {
    name: 'New Refund %',
    weightage: 10,
    target: 8.0,
    type: 'lower_better',
    unit: '%',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      if (value <= target) return 100;
      const penalty = Math.min((value - target) / target * 50, 50);
      return Math.max(100 - penalty, 0);
    }
  },
  new_conversion_pct: {
    name: 'New Conversion %',
    weightage: 20,
    target: 20.0,
    type: 'higher_better',
    unit: '%',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      return Math.min((value / target) * 100, 150);
    }
  },
  nrpc: {
    name: 'NRPC',
    weightage: 25,
    target: 50.0,
    type: 'higher_better',
    unit: '$',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      return Math.min((value / target) * 100, 150);
    }
  },
  aht: {
    name: 'Average Handle Time',
    weightage: 20,
    target: 23,
    type: 'lower_better',
    unit: 'min',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      if (value <= target) return 100;
      const penalty = Math.min((value - target) / target * 50, 50);
      return Math.max(100 - penalty, 0);
    }
  },
  nps: {
    name: 'Net Promoter Score',
    weightage: 15,
    target: 65,
    type: 'higher_better',
    unit: '',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      if (value >= target) return 100;
      return Math.max((value / target) * 100, 0);
    }
  },
  qa_score: {
    name: 'QA Score',
    weightage: 10,
    target: 80,
    type: 'higher_better',
    unit: '%',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      if (value >= target) return 100;
      return Math.max((value / target) * 100, 0);
    }
  },
  aos: {
    name: 'Average Order Size',
    weightage: 0,
    target: 100,
    type: 'higher_better',
    unit: '$',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      return Math.min((value / target) * 100, 150);
    }
  },
  revenue: {
    name: 'Revenue',
    weightage: 0,
    target: 500,
    type: 'higher_better',
    unit: '$',
    maxPoints: 100,
    xpReward: 10,
    pointsReward: 100,
    formula: (value, target) => {
      return Math.min((value / target) * 100, 150);
    }
  }
};

module.exports = KPI_CONFIG;