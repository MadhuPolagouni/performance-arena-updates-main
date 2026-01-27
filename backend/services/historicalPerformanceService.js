const dataService = require('./dataService');
const kpiService = require('./kpiService');

class HistoricalPerformanceService {
  /**
   * Get last N days of performance data for an agent
   * @param {string} userId - User ID
   * @param {number} days - Number of days to retrieve (default 5)
   * @returns {Array} Array of daily performance data
   */
  getLastNDaysPerformance(userId, days = 5) {
    const performanceMetrics = dataService.getData('performanceMetrics');
    const userMetrics = performanceMetrics.filter(m => m.user_id === userId);

    if (userMetrics.length === 0) return [];

    // Get unique dates from metrics
    const dates = [...new Set(userMetrics.map(m => m.date.split('T')[0]))].sort().reverse().slice(0, days);

    return dates.map(date => {
      const dayMetrics = userMetrics.filter(m => m.date.startsWith(date));
      
      // Group by metric key (take latest value per key for this day)
      const latestMetricsForDay = {};
      dayMetrics.forEach(metric => {
        if (!latestMetricsForDay[metric.metric_key] || 
            new Date(metric.date) > new Date(latestMetricsForDay[metric.metric_key].date)) {
          latestMetricsForDay[metric.metric_key] = metric;
        }
      });

      return {
        date,
        metrics: latestMetricsForDay,
        kpiScores: this.calculateDayKPIScores(latestMetricsForDay),
        xpEarned: this.calculateDayXP(latestMetricsForDay),
        pointsEarned: this.calculateDayPoints(latestMetricsForDay)
      };
    });
  }

  /**
   * Calculate KPI scores for a specific day
   * @param {Object} metricsForDay - Metrics for a specific day
   * @returns {Object} KPI scores with targets and achievement
   */
  calculateDayKPIScores(metricsForDay) {
    const KPI_CONFIG = require('../config/kpiConfig');
    const kpiResults = {};

    Object.keys(KPI_CONFIG).forEach(kpiKey => {
      const config = KPI_CONFIG[kpiKey];
      const metric = metricsForDay[kpiKey];

      if (metric) {
        const rawScore = config.formula(metric.value, config.target);
        kpiResults[kpiKey] = {
          name: config.name,
          value: metric.value,
          target: config.target,
          unit: config.unit,
          achieved: rawScore >= 100,
          percentage: Math.min(rawScore, 100),
          status: this.getStatus(rawScore)
        };
      }
    });

    return kpiResults;
  }

  /**
   * Calculate XP earned for a specific day based on KPI performance
   * @param {Object} metricsForDay - Metrics for a specific day
   * @returns {number} XP earned
   */
  calculateDayXP(metricsForDay) {
    const KPI_CONFIG = require('../config/kpiConfig');
    let totalXP = 0;

    Object.keys(KPI_CONFIG).forEach(kpiKey => {
      const config = KPI_CONFIG[kpiKey];
      const metric = metricsForDay[kpiKey];

      if (metric) {
        const rawScore = config.formula(metric.value, config.target);
        // Base XP per KPI, scaled by achievement percentage
        totalXP += Math.round((rawScore / 100) * (config.xpReward || 50));
      }
    });

    return Math.round(totalXP);
  }

  /**
   * Calculate points earned for a specific day
   * @param {Object} metricsForDay - Metrics for a specific day
   * @returns {number} Points earned
   */
  calculateDayPoints(metricsForDay) {
    const KPI_CONFIG = require('../config/kpiConfig');
    let totalPoints = 0;

    Object.keys(KPI_CONFIG).forEach(kpiKey => {
      const config = KPI_CONFIG[kpiKey];
      const metric = metricsForDay[kpiKey];

      if (metric) {
        const rawScore = config.formula(metric.value, config.target);
        // Base points per KPI, scaled by achievement percentage
        totalPoints += Math.round((rawScore / 100) * (config.pointsReward || 100));
      }
    });

    return Math.round(totalPoints);
  }

  /**
   * Get performance comparison for last 5 days
   * @param {string} userId - User ID
   * @returns {Object} Performance data with targets and achievements
   */
  getLast5DaysPerformanceSummary(userId) {
    const daysData = this.getLastNDaysPerformance(userId, 5);
    
    return {
      totalDaysTracked: daysData.length,
      days: daysData.map(day => ({
        date: day.date,
        dailyStats: {
          xpEarned: day.xpEarned,
          pointsEarned: day.pointsEarned,
          progressPercentage: Math.round((day.xpEarned / 100) * 100) // Assuming 100 XP per day target
        },
        kpiAchievements: Object.entries(day.kpiScores).map(([key, kpi]) => ({
          name: kpi.name,
          value: `${kpi.value}${kpi.unit}`,
          target: `${kpi.target}${kpi.unit}`,
          achieved: kpi.achieved,
          percentage: kpi.percentage,
          status: kpi.status
        }))
      })),
      aggregatedStats: {
        totalXP: daysData.reduce((sum, day) => sum + day.xpEarned, 0),
        totalPoints: daysData.reduce((sum, day) => sum + day.pointsEarned, 0),
        averageDailyXP: Math.round(daysData.reduce((sum, day) => sum + day.xpEarned, 0) / daysData.length),
        averageDailyPoints: Math.round(daysData.reduce((sum, day) => sum + day.pointsEarned, 0) / daysData.length),
        daysWithCompleteData: daysData.filter(day => Object.keys(day.metrics).length > 0).length
      }
    };
  }

  /**
   * Get daily performance score (XP per day as a fraction)
   * @param {string} userId - User ID
   * @param {number} days - Number of days (default 7)
   * @returns {Array} Daily performance scores
   */
  getDailyPerformanceScores(userId, days = 7) {
    const daysData = this.getLastNDaysPerformance(userId, days);
    const targetXPPerDay = 100; // Target XP per day

    return daysData.map(day => ({
      date: day.date,
      xpEarned: day.xpEarned,
      target: targetXPPerDay,
      percentage: Math.min((day.xpEarned / targetXPPerDay) * 100, 100),
      display: `${day.xpEarned}/${targetXPPerDay}`
    })).reverse(); // Show oldest first
  }

  /**
   * Get weekly point trajectory (4 weeks of points earned)
   * @param {string} userId - User ID
   * @returns {Array} Weekly point data
   */
  getWeeklyPointTrajectory(userId) {
    const performanceMetrics = dataService.getData('performanceMetrics');
    const userMetrics = performanceMetrics.filter(m => m.user_id === userId);

    if (userMetrics.length === 0) return [];

    // Get last 28 days of data
    const dates = [...new Set(userMetrics.map(m => m.date.split('T')[0]))].sort();
    const last28Days = dates.slice(-28);

    // Group into 4 weeks
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekDays = last28Days.slice(i * 7, (i + 1) * 7);
      const weekPoints = weekDays.reduce((sum, date) => {
        const dayMetrics = userMetrics.filter(m => m.date.startsWith(date));
        return sum + this.calculateDayPoints(this.groupMetricsByKey(dayMetrics));
      }, 0);

      weeks.push({
        week: i + 1,
        label: `Week ${i + 1}`,
        pointsEarned: weekPoints,
        daysInWeek: weekDays.length
      });
    }

    return weeks;
  }

  /**
   * Get points activity log with KPI metrics
   * @param {string} userId - User ID
   * @param {string} period - 'week' or 'month'
   * @returns {Object} KPI metrics for the period
   */
  getPointsActivityLog(userId, period = 'week') {
    const performanceMetrics = dataService.getData('performanceMetrics');
    const userMetrics = performanceMetrics.filter(m => m.user_id === userId);

    if (userMetrics.length === 0) return { kpiMetrics: [], totalPoints: 0 };

    // Get dates for period
    const now = new Date();
    const periodStart = new Date(now);
    if (period === 'week') {
      periodStart.setDate(now.getDate() - now.getDay()); // Start of this week
    } else if (period === 'month') {
      periodStart.setDate(1); // Start of this month
    }

    const periodMetrics = userMetrics.filter(m => new Date(m.date) >= periodStart);
    const dates = [...new Set(periodMetrics.map(m => m.date.split('T')[0]))].sort();

    // Calculate daily metrics for each KPI
    const KPI_CONFIG = require('../config/kpiConfig');
    const kpiData = {};

    dates.forEach(date => {
      const dayMetrics = periodMetrics.filter(m => m.date.startsWith(date));
      const metricsForDay = this.groupMetricsByKey(dayMetrics);

      Object.keys(KPI_CONFIG).forEach(kpiKey => {
        const metric = metricsForDay[kpiKey];
        if (metric) {
          if (!kpiData[kpiKey]) {
            kpiData[kpiKey] = {
              name: KPI_CONFIG[kpiKey].name,
              unit: KPI_CONFIG[kpiKey].unit,
              dataPoints: []
            };
          }
          kpiData[kpiKey].dataPoints.push({
            date,
            value: metric.value,
            target: KPI_CONFIG[kpiKey].target
          });
        }
      });
    });

    // Convert to array for graphing
    const kpiMetrics = Object.entries(kpiData).map(([key, data]) => ({
      key,
      name: data.name,
      unit: data.unit,
      dataPoints: data.dataPoints
    }));

    const totalPoints = dates.reduce((sum, date) => {
      const dayMetrics = periodMetrics.filter(m => m.date.startsWith(date));
      return sum + this.calculateDayPoints(this.groupMetricsByKey(dayMetrics));
    }, 0);

    return { kpiMetrics, totalPoints };
  }

  /**
   * Helper: Group metrics by key (taking latest value per key)
   * @private
   */
  groupMetricsByKey(metrics) {
    const grouped = {};
    metrics.forEach(metric => {
      if (!grouped[metric.metric_key] || 
          new Date(metric.date) > new Date(grouped[metric.metric_key].date)) {
        grouped[metric.metric_key] = metric;
      }
    });
    return grouped;
  }

  /**
   * Determine status based on score percentage
   * @private
   */
  getStatus(score) {
    if (score >= 95) return 'excellent';
    if (score >= 80) return 'on-track';
    if (score >= 60) return 'at-risk';
    return 'critical';
  }
}

module.exports = new HistoricalPerformanceService();
