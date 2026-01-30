import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Star, Flame, Lock, Target, Phone, CheckCircle, DollarSign, Heart, TrendingUp, Sparkles, Trophy, Zap, Gift, Clock, Medal, Crown, Award, Rocket, Shield, X, Activity, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAgentDashboard } from "./hooks.jsx";
import { AgentDashboardSkeleton } from "../../components/ui/PageSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import ContestBanner from "@/components/game/ContestBanner";
// ProductionReport and RewardsGallery removed from Agent overview per design

const AgentHome = () => {
  const { data, loading, error } = useAgentDashboard();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedMissionIds, setCompletedMissionIds] = useState([]);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 23, seconds: 15 });
  const [activeContests, setActiveContests] = useState([]);
  const [dismissedContests, setDismissedContests] = useState([]);
  const [showLast5DaysModal, setShowLast5DaysModal] = useState(false);
  const [last5DaysData, setLast5DaysData] = useState(null);
  const [loadingLast5Days, setLoadingLast5Days] = useState(false);
  const [showExpandedKPIs, setShowExpandedKPIs] = useState(false);

  // Count-up animation based on fetched data
  useEffect(() => {
    if (!data) return;
    
    const targetScore = data.score;
    const targetXP = data.xp;
    const duration = 1500;
    const steps = 60;
    const scoreIncrement = targetScore / steps;
    const xpIncrement = targetXP / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAnimatedScore(Math.min(Math.round(scoreIncrement * step), targetScore));
      setAnimatedXP(Math.min(Math.round(xpIncrement * step), targetXP));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for newly completed missions and trigger confetti
  useEffect(() => {
    if (!data?.metrics) return;
    
    const nowComplete = data.metrics.filter(m => m.progress >= 100).map(m => m.key);
    const newlyCompleted = nowComplete.filter(id => !completedMissionIds.includes(id));
    
    if (newlyCompleted.length > 0 && completedMissionIds.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
    
    setCompletedMissionIds(nowComplete);
  }, [data?.metrics]);

  // Fetch active contests for banner display
  useEffect(() => {
    const fetchActiveContests = async () => {
      try {
        const response = await fetch('/api/admin/contests/active');
        if (response.ok) {
          const data = await response.json();
          setActiveContests(data.contests || []);
        }
      } catch (error) {
        // Fallback to mock contest for demo
        setActiveContests([
          {
            id: 'demo-contest-1',
            name: 'Q1 Performance Championship',
            bannerText: 'Rise Above. Compete. Win Big!',
            contestIcon: 'trophy',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            theme: {
              primary: "#8B5CF6",
              secondary: "#A855F7",
              accent: "#EC4899",
              backgroundColor: "#1a1a2e",
            },
            metrics: [{ name: 'Revenue' }, { name: 'QA Score' }],
            rewards: [{ position: '1st' }, { position: '2nd' }, { position: '3rd' }],
            createdByRole: 'admin',
            status: 'published',
          }
        ]);
      }
    };
    
    fetchActiveContests();
  }, []);

  const handleDismissContest = (contestId) => {
    setDismissedContests(prev => [...prev, contestId]);
  };

  const handleFetchLast5Days = useCallback(async () => {
    if (!data?.agentId) return;
    setLoadingLast5Days(true);
    try {
      const response = await fetch(`/api/agent/${data.agentId}/historical-performance?days=5`);
      if (response.ok) {
        const performanceData = await response.json();
        setLast5DaysData(performanceData);
        setShowLast5DaysModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch last 5 days data:', error);
    } finally {
      setLoadingLast5Days(false);
    }
  }, [data?.agentId]);

  const visibleContests = activeContests.filter(c => !dismissedContests.includes(c.id));

  const formatTime = (num) => String(num).padStart(2, "0");

  // Dummy KPI data for last 5 days
  const kpiHistoryData = [
    { date: 'Today', new_revenue: 520, aht: 22, qa_score: 92, nrpc: 48, new_conv_pct: 18, nps: 75, xps: 8, scratch: true },
    { date: 'Yesterday', new_revenue: 485, aht: 24, qa_score: 88, nrpc: 45, new_conv_pct: 16, nps: 72, xps: 7, scratch: false },
    { date: '2 days ago', new_revenue: 510, aht: 21, qa_score: 94, nrpc: 52, new_conv_pct: 19, nps: 78, xps: 9, scratch: true },
    { date: '3 days ago', new_revenue: 495, aht: 23, qa_score: 90, nrpc: 46, new_conv_pct: 17, nps: 74, xps: 7, scratch: false },
    { date: '4 days ago', new_revenue: 530, aht: 20, qa_score: 96, nrpc: 55, new_conv_pct: 20, nps: 80, xps: 10, scratch: true }
  ];

  const kpiTargets = {
    new_revenue: 500,
    aht: 23,
    qa_score: 80,
    nrpc: 50,
    new_conv_pct: 15,
    nps: 70
  };

  const getIcon = (key) => {
    const icons = { aht: Phone, qa: CheckCircle, revenue: DollarSign, nps: Heart };
    return icons[key] || Target;
  };

  if (loading) return <AgentDashboardSkeleton />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-destructive mb-2">Error loading dashboard</p>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    </div>
  );
  if (!data) return null;

  const missionMetrics = data.metrics || [];
  const completedMissions = missionMetrics.filter(m => m.progress >= 100).length;
  const totalMissions = missionMetrics.length;
  const allMissionsComplete = completedMissions === totalMissions;
  const overallProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[200px] bg-primary/8" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[180px] bg-secondary/6" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[250px] bg-accent/4" />
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/25"
            animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
            style={{ left: `${Math.random() * 100}%`, top: `${50 + Math.random() * 50}%` }}
          />
        ))}
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -30, x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000), rotate: 0, opacity: 1, scale: Math.random() * 0.6 + 0.4 }}
                animate={{ y: (typeof window !== "undefined" ? window.innerHeight : 800) + 100, rotate: Math.random() * 1440, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.5 }}
                className="absolute rounded-sm"
                style={{
                  width: Math.random() * 10 + 5,
                  height: Math.random() * 10 + 5,
                  backgroundColor: ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-8 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
        {/* Active Contest Banners */}
        <AnimatePresence>
          {visibleContests.map((contest, index) => (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ContestBanner
                contest={contest}
                onDismiss={() => handleDismissContest(contest.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Header with Stats */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-6"
        >
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Sora', sans-serif", background: "linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 50%, hsl(var(--secondary)) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Command Center
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  <span className="text-secondary">&gt;</span> Your daily performance hub
                </p>
              </div>
            </div>
          <div className="flex items-center gap-4">
            {/* Streak Badge */}
            <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center px-4 py-2 rounded-xl glass-card border border-warning/50" style={{ boxShadow: "0 0 20px hsl(var(--warning) / 0.2)" }}>
              <div className="flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-warning" />
                <span className="font-bold text-xl text-warning">{data.streak}</span>
              </div>
              <span className="text-[10px] text-warning/70 uppercase tracking-wider font-medium">Day Streak</span>
            </motion.div>
            {/* Timer */}
            <div className="flex flex-col items-center px-4 py-2 rounded-xl glass-card border border-border">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Reset In</span>
              <span className="font-bold text-lg text-secondary font-mono">{formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}</span>
            </div>
          </div>
          <div className="ml-4" />
        </motion.header>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: GAMIFIED MISSION PROGRESS (PILL VIEW - NOT CARDS)
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative p-5 lg:p-6 rounded-2xl border overflow-hidden",
            allMissionsComplete
              ? "bg-gradient-to-r from-success/15 via-secondary/15 to-accent/15 border-success/40"
              : "bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-primary/30"
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", allMissionsComplete ? "bg-success/20 shadow-lg shadow-success/20" : "bg-primary/20")}>
                  {allMissionsComplete ? <Trophy className="w-6 h-6 text-success" /> : <Target className="w-6 h-6 text-primary" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Today's Missions</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className={allMissionsComplete ? "text-success font-bold" : "text-secondary font-bold"}>{completedMissions}/{totalMissions}</span> completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View Last 5 Days Button */}
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFetchLast5Days}
                  disabled={loadingLast5Days}
                  className="px-4 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors border border-secondary/40 text-sm font-semibold flex items-center gap-2"
                >
                  {loadingLast5Days ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-secondary/40 border-t-secondary animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Last 5 Days
                    </>
                  )}
                </motion.button> */}
                {/* Bonus Reward */}
                <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-2", allMissionsComplete ? "bg-success/20 border-success/40" : "bg-warning/10 border-warning/30")}>
                  <Gift className={cn("w-5 h-5", allMissionsComplete ? "text-success" : "text-warning")} />
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">All Clear Bonus</p>
                    <p className={cn("font-bold text-sm", allMissionsComplete ? "text-success" : "text-warning")}>+100 Bonus PTS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Pills - Interactive Gamified View */}
            <div className="flex flex-wrap gap-3 mb-5">
              {missionMetrics.map((metric, index) => {
                const Icon = getIcon(metric.key);
                const isComplete = metric.progress >= 100;
                
                return (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={cn(
                      "group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer",
                      isComplete
                        ? "bg-success/15 border-success/50 shadow-[0_0_15px_hsl(var(--success)/0.15)]"
                        : metric.progress > 50
                        ? "bg-primary/10 border-primary/40 hover:border-primary/60"
                        : "bg-muted/30 border-border/60 hover:border-border"
                    )}
                  >
                    {/* Icon Badge */}
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all", isComplete ? "bg-success/25" : "bg-muted/60")}>
                      {isComplete ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                          <CheckCircle className="w-5 h-5 text-success" />
                        </motion.div>
                      ) : (
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-[100px]">
                      <p className={cn("text-sm font-semibold", isComplete ? "text-success" : "text-foreground")}>{metric.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold", isComplete ? "text-success" : "text-muted-foreground")}>{metric.value}</span>
                        <span className="text-xs text-muted-foreground">/ {metric.target?.replace("Target: ", "").replace(" Goal", "")}</span>
                      </div>
                      {/* Progress Bar */}
                      {!isComplete && (
                        <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(metric.progress, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", isComplete ? "bg-success/20 text-success" : metric.progress > 70 ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground")}>
                      {isComplete ? "✓ Done" : `${metric.progress}%`}
                    </div>

                    {/* Completion Sparkle */}
                    {isComplete && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <Sparkles className="w-4 h-4 text-success" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* ProductionReport and RewardsGallery removed from Agent overview per design */}

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className={allMissionsComplete ? "text-success font-bold" : "text-secondary font-bold"}>{Math.round(overallProgress)}%</span>
              </div>
              <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full relative", allMissionsComplete ? "bg-gradient-to-r from-success via-secondary to-success" : "bg-gradient-to-r from-primary via-secondary to-accent")}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ boxShadow: allMissionsComplete ? "0 0 15px hsl(var(--success) / 0.5)" : "0 0 10px hsl(var(--primary) / 0.4)" }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} />
                </motion.div>
              </div>
            </div>

            {/* All Complete Celebration */}
            <AnimatePresence>
              {allMissionsComplete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 p-4 rounded-xl bg-success/20 border border-success/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>
                      <Sparkles className="w-6 h-6 text-success" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-success">All Missions Complete! 🎉</p>
                      <p className="text-xs text-success/70">You're a superstar today!</p>
                    </div>
                  </div>
                  <Link to="/agent/play">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-lg bg-success text-success-foreground font-bold text-sm shadow-lg shadow-success/30">
                      Claim Bonus
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expandable KPI Breakdown Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5"
            >
              <motion.button
                onClick={() => setShowExpandedKPIs(!showExpandedKPIs)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">Last 5 Days  Metrics</span>
                </div>
                <motion.div
                  animate={{ rotate: showExpandedKPIs ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </motion.div>
              </motion.button>

              {/* Expanded KPI Content */}
              <AnimatePresence>
                {showExpandedKPIs && (
              <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              
              {/* KPI Rows */}
              <div className="kpi-timeline">
  {kpiHistoryData.map((day, idx) => {
    const prev = kpiHistoryData[idx + 1];
    const trend = prev ? day.new_revenue - prev.new_revenue : 0;
    const progress = Math.min((day.xps / 10) * 100, 100);

    return (
      <motion.div
        key={day.date}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.08 }}
        className="kpi-timeline-row"
      >
        {/* Timeline rail */}
        <div className="timeline-rail">
          <div className={`timeline-dot ${day.xps >= 8 ? "active" : ""}`} />
          {idx !== kpiHistoryData.length - 1 && <div className="timeline-line" />}
        </div>

        {/* KPI Card */}
        <div className="kpi-rail-card">
  {/* MAIN CONTENT */}
  <div className="kpi-rail-main">
    {/* Header */}
    <div className="kpi-header">
      <span className="day">{day.date}</span>
    </div>

    {/* KPI values */}
    <div className="kpi-values">
    <div className="kpi-metric">
  <span className="kpi-label">Revenue</span>

  <div className="kpi-value-row">
    <strong>${day.new_revenue}</strong>
    <span className="kpi-target">
      / ${kpiTargets.new_revenue}
    </span>
  </div>
</div>

<div className="kpi-metric">
  <span className="kpi-label">AHT</span>
  <div className="kpi-value-row">
    <strong>{day.aht}m</strong>
    <span className="kpi-target">
      / {kpiTargets.aht}m
    </span>
  </div>
</div>

<div className="kpi-metric">
  <span className="kpi-label">QA</span>
  <div className="kpi-value-row">
    <strong>{day.qa_score}%</strong>
    <span className="kpi-target">
      / {kpiTargets.qa_score}%
    </span>
  </div>
</div>

<div className="kpi-metric">
  <span className="kpi-label">NPS</span>
  <div className="kpi-value-row">
    <strong>{day.nps}</strong>
    <span className="kpi-target">
      / {kpiTargets.nps}
    </span>
  </div>
</div>

    </div>

    {/* XP + Progress */}
    <div className="kpi-footer">
      <div className="xp-pulse">⚡ {day.xps}/10 XP</div>

      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  </div>

  {/* RIGHT SIDE FIXED RAIL */}
  <div className="kpi-rail-side">
  <span className={`trend ${trend >= 0 ? "up" : "down"}`}>
  {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} points
</span>


    {day.scratch && <span className="reward">🎁</span>}
  </div>
</div>

      </motion.div>
    );
  })}
</div>

            </motion.div>
            
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: SPIN WHEEL BANNER
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative p-5 rounded-2xl border overflow-hidden bg-gradient-to-r from-purple-500/10 via-card to-pink-500/10 border-purple-500/30"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
          
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_hsla(280,100%,60%,0.4)]"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                {!data.spinUnlocked && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-destructive flex items-center justify-center border-2 border-background">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Lucky Spin Wheel
                  {data.spinUnlocked && <span className="text-success text-sm">✓ Unlocked</span>}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.spinUnlocked ? "Your weekly challenges are complete! Spin to win." : `Complete ${data.callsToUnlock || 3} more challenges to unlock`}
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Unlock Progress</span>
                <span className="text-sm font-bold text-primary">90%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                  style={{ boxShadow: "0 0 10px hsla(280,100%,60%,0.5)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `90%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <Link to="/agent/play">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition-all",
                  data.spinUnlocked
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-[0_0_25px_hsla(280,100%,60%,0.4)]"
                    : "bg-muted/50 text-muted-foreground border-border opacity-70 cursor-not-allowed"
                )}
                disabled={!data.spinUnlocked}
              >
                {data.spinUnlocked ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {data.spinUnlocked ? "Spin Now" : "Locked"}
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: SCRATCH CARDS SHOWCASE (GOOGLE PAY STYLE)
            Only show if threshold is met
        ═══════════════════════════════════════════════════════════════════ */}
        {data.scratchCardAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl border bg-gradient-to-r from-accent/10 via-card to-warning/10 border-accent/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-foreground">Your Rewards</h3>
                <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold">THRESHOLD MET ✓</span>
              </div>
              <Link to="/agent/play" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Pending Cards */}
              {[1, 2, 3].map((idx) => (
                <Link to="/agent/play" key={`pending-${idx}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-accent/20 to-warning/20 border-2 border-accent/40 flex flex-col items-center justify-center p-3 cursor-pointer relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    <Gift className="w-8 h-8 text-accent mb-2 group-hover:animate-bounce" />
                    <span className="text-[10px] text-accent font-bold uppercase">Scratch Me</span>
                    <span className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {23 - idx * 5}h left
                    </span>
                  </motion.div>
                </Link>
              ))}

              {/* Today's Card */}
              <Link to="/agent/play">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="aspect-square rounded-xl bg-gradient-to-br from-success/20 to-secondary/20 border-2 border-success/50 flex flex-col items-center justify-center p-3 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                  <Sparkles className="w-8 h-8 text-success mb-2" />
                  <span className="text-[10px] text-success font-bold uppercase">New Today!</span>
                </motion.div>
              </Link>

              {/* Claimed Cards */}
              {[1, 2].map((idx) => (
                <motion.div
                  key={`claimed-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx + 3) * 0.1 }}
                  className="aspect-square rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center p-3 opacity-60"
                >
                  <CheckCircle className="w-6 h-6 text-success/60 mb-2" />
                  <span className="text-[10px] text-muted-foreground font-medium">+{idx * 250} PTS</span>
                  <span className="text-[9px] text-muted-foreground">Claimed</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: STATS ROW
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-5"
        >
          {/* XP Points Card */}
          <div className="glass-card p-5 flex items-center justify-between group hover:border-accent/40 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground font-medium">Points Earned</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {animatedXP.toLocaleString()} <span className="text-lg text-accent font-semibold">XP</span>
              </p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                +{data.xpToday} XP Today
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Star className="w-8 h-8 text-accent drop-shadow-[0_0_10px_hsla(45,100%,55%,0.6)]" />
            </div>
          </div>

          {/* Streak Card */}
          <div className="glass-card p-5 flex items-center justify-between group hover:border-warning/40 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-warning" />
                <span className="text-sm text-muted-foreground font-medium">Daily Streak</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {data.streak} <span className="text-lg text-warning font-semibold">Days</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Personal Best: {data.personalBest} Days</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Flame className="w-8 h-8 text-warning drop-shadow-[0_0_10px_hsla(35,100%,55%,0.6)]" />
              </motion.div>
            </div>
          </div>

          {/* Ranking Card */}
          <div className="glass-card p-5 flex items-center justify-between group hover:border-secondary/40 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground font-medium">Your Rank</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{data.ranking || 'N/A'}</p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                Top {typeof data.percentile === 'number' && !isNaN(data.percentile) ? Math.round(100 - data.percentile) : '--'}%
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Trophy className="w-8 h-8 text-secondary drop-shadow-[0_0_10px_hsla(180,100%,55%,0.6)]" />
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 & 6: WEEKLY SPRINT + DAILY PERFORMANCE (SIDE BY SIDE)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Sprint Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-foreground">Weekly Sprint</h3>
              </div>
              <Link to="/agent/leaderboard" className="text-sm text-primary hover:underline">View All</Link>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-3 mb-4 pt-4">
              {/* 2nd Place */}
              {data.leaderboard[1] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-300 shadow-lg bg-gradient-to-br", data.leaderboard[1].color)}>
                    {data.leaderboard[1].avatar}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 font-medium">{data.leaderboard[1].name}</span>
                  <span className="text-xs text-muted-foreground">{Math.floor((data.leaderboard[1].points || 0) / 10).toLocaleString()} XPS</span>
                  <div className="w-14 h-14 mt-2 rounded-t-lg bg-gradient-to-b from-gray-400/40 to-gray-600/40 flex items-center justify-center text-2xl font-bold text-gray-400 border-t border-x border-gray-400/30">2</div>
                </motion.div>
              )}
              {/* 1st Place */}
              {data.leaderboard[0] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                  <div className="relative">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white font-bold border-2 border-yellow-400 shadow-[0_0_20px_hsla(45,100%,55%,0.5)] bg-gradient-to-br", data.leaderboard[0].color)}>
                      {data.leaderboard[0].avatar}
                    </div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2"><span className="text-xl">👑</span></div>
                  </div>
                  <span className="text-sm font-semibold text-accent mt-2">{data.leaderboard[0].name}</span>
                  <span className="text-xs text-accent">{Math.floor((data.leaderboard[0].points || 0) / 10).toLocaleString()} XPS</span>
                  <div className="w-16 h-20 mt-2 rounded-t-lg bg-gradient-to-b from-yellow-500/40 to-yellow-700/40 flex items-center justify-center text-3xl font-bold text-accent border-t border-x border-yellow-500/40">1</div>
                </motion.div>
              )}
              {/* 3rd Place */}
              {data.leaderboard[2] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-2 border-amber-600 shadow-lg bg-gradient-to-br", data.leaderboard[2].color)}>
                    {data.leaderboard[2].avatar}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 font-medium">{data.leaderboard[2].name}</span>
                  <span className="text-xs text-muted-foreground">{Math.floor((data.leaderboard[2].points || 0) / 10).toLocaleString()} XPS</span>
                  <div className="w-14 h-10 mt-2 rounded-t-lg bg-gradient-to-b from-amber-600/40 to-amber-800/40 flex items-center justify-center text-2xl font-bold text-amber-500 border-t border-x border-amber-600/30">3</div>
                </motion.div>
              )}
            </div>

            {/* Your Position */}
            {data.currentUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {data.currentUser.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Your Position</p>
                    <p className="text-xs text-muted-foreground">Rank #{data.currentUser.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">{Math.floor((data.currentUser.points || 0) / 10).toLocaleString()} XPS</p>
                  <p className="text-xs text-success flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" /> Climbing!
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Daily Performance Score Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 flex flex-col items-center text-center"
          >
            {/* Radial XPS Meter */}
            <div className="relative w-44 h-44 mb-4">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-xl animate-pulse" />
              
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="none"
                  stroke="hsla(260, 30%, 20%, 0.5)"
                  strokeWidth="12"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${animatedScore * 4.9} 490`}
                  className="drop-shadow-[0_0_15px_hsla(280,100%,60%,0.6)] transition-all duration-300"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(280, 100%, 60%)" />
                    <stop offset="50%" stopColor="hsl(320, 100%, 55%)" />
                    <stop offset="100%" stopColor="hsl(195, 100%, 50%)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold text-foreground drop-shadow-[0_0_20px_hsla(280,100%,60%,0.5)]">
                  {Math.floor(animatedXP)}/10
                </span>
                <span className="text-xs text-muted-foreground font-medium">XPS Today</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">
              Total XPS
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              You've earned {Math.floor(animatedXP)} XP out of 10 maximum today. Complete more KPIs to maximize!
            </p>
            
            <Link to="/agent/performance">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm
                               hover:shadow-[0_0_25px_hsla(280,100%,60%,0.5)] transition-all duration-300 hover:scale-[1.02]">
                View Performance <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
        </div>

        {/* Shimmer animation style */}
     {/* Shimmer + KPI styles */}
     <style>{`
  /* ===== Shimmer animation ===== */
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  /* ===== KPI TIMELINE RAIL ===== */
  
  .kpi-timeline {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 20px 10px;
  }
  
  /* Timeline row */
  .kpi-timeline-row {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 16px;
  }
  
  /* Timeline rail */
  .timeline-rail {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .timeline-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: hsl(var(--muted));
    border: 2px solid hsl(var(--border));
  }
  
  .timeline-dot.active {
    background: hsl(var(--accent));
    box-shadow: 0 0 20px hsl(var(--accent));
  }
  
  .timeline-line {
    width: 2px;
    flex: 1;
    margin-top: 6px;
    background: linear-gradient(
      to bottom,
      hsl(var(--border)),
      transparent
    );
  }
  
  /* ===== KPI CARD (FIXED STRUCTURE) ===== */
  
  .kpi-rail-card {
    display: grid;
    grid-template-columns: 1fr 70px; /* main + right rail */
    gap: 16px;
    align-items: center;
  
    padding: 18px 20px;
    border-radius: 20px;
  
    background:
      radial-gradient(
        120% 120% at 0% 0%,
        hsl(var(--primary) / 0.18),
        transparent 45%
      ),
      linear-gradient(
        135deg,
        hsl(var(--card)),
        hsl(var(--muted))
      );
  
    border: 1px solid hsl(var(--border));
    box-shadow: 0 20px 60px hsl(var(--foreground) / 0.18);
    transition: transform 0.3s ease;
  }
  
  .kpi-rail-card:hover {
    transform: translateY(-4px);
  }
  
  /* ===== MAIN CONTENT ===== */
  
  .kpi-rail-main {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }
  
  /* Header */
  .kpi-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  
  .kpi-header .day {
    font-size: 14px;
    font-weight: 900;
  }
  
  /* KPI values */
  .kpi-values {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    width: 100%;
    min-width: 0;
  }
  
  .kpi-values span {
    font-size: 10px;
    color: hsl(var(--muted-foreground));
  }
  
  .kpi-values strong {
    font-size: 15px;
    font-weight: 800;
  }
  
  /* Footer */
  .kpi-footer {
    margin-top: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: center;
  }
  
  /* XP pulse */
  .xp-pulse {
    font-weight: 900;
    color: hsl(var(--accent));
    animation: pulseXP 1.6s infinite;
  }
  
  @keyframes pulseXP {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  /* Progress bar */
  .progress-track {
    width: 100%;
    height: 6px;
    background: hsl(var(--muted));
    border-radius: 999px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(
      to right,
      hsl(var(--primary)),
      hsl(var(--accent))
    );
  }
  
  /* ===== RIGHT RAIL (CONTENT END FIX) ===== */
  
  .kpi-rail-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  .kpi-rail-side .trend {
    font-size: 11px;
    font-weight: 900;
    white-space: nowrap;
  }
  
  .trend.up {
    color: hsl(var(--success));
  }
  
  .trend.down {
    color: hsl(var(--destructive));
  }
  
  /* Reward */
  .reward {
    font-size: 16px;
    filter: drop-shadow(0 0 10px hsl(var(--warning)));
  }
  
  /* ===== KPI METRIC SPACING + TARGET ===== */

  .kpi-metric {
    display: flex;
    flex-direction: column;
    gap: 6px; /* space between label and value */
  }
  
  /* Metric name */
  .kpi-label {
    font-size: 11px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    letter-spacing: 0.04em;
  }
  
  /* Value + target row */
  .kpi-value-row {
    display: flex;
    align-items: baseline;
    gap: 8px; /* space between value & target */
  }
  
  /* Main value */
  .kpi-value-row strong {
    font-size: 16px;
    font-weight: 900;
    color: hsl(var(--foreground));
  }
  
  /* Target text */
  .kpi-target {
    font-size: 11px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
  }
  

`}</style>


      {/* Last 5 Days Performance Modal */}
      <AnimatePresence>
        {showLast5DaysModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLast5DaysModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card rounded-2xl border border-border/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Last 5 Days Performance</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your KPI achievements and progress</p>
                </div>
                <button
                  onClick={() => setShowLast5DaysModal(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {last5DaysData?.days && last5DaysData.days.length > 0 ? (
                  <>
                    {last5DaysData.days.map((day, idx) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-border/40 rounded-xl p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-foreground">{day.date}</h3>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">XP Earned</p>
                              <p className="text-lg font-bold text-primary">{day.dailyStats.xpEarned}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Points</p>
                              <p className="text-lg font-bold text-secondary">{day.dailyStats.pointsEarned}</p>
                            </div>
                          </div>
                        </div>

                        {/* KPI Achievements */}
                        <div className="space-y-2">
                          {day.kpiAchievements.map((kpi) => (
                            <div key={kpi.name} className="flex items-center justify-between text-sm bg-background/40 p-2 rounded-lg">
                              <div>
                                <p className="font-medium text-foreground">{kpi.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {kpi.value} / {kpi.target}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full ${kpi.achieved ? 'bg-success' : 'bg-primary'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(kpi.percentage, 100)}%` }}
                                    transition={{ duration: 0.6 }}
                                  />
                                </div>
                                <span className={cn("text-xs font-bold w-8 text-right", kpi.achieved ? 'text-success' : kpi.percentage > 70 ? 'text-warning' : 'text-destructive')}>
                                  {Math.round(kpi.percentage)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}

                    {/* Summary Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4 mt-6"
                    >
                      <h4 className="font-bold text-foreground mb-3">5-Day Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total XP</p>
                          <p className="text-2xl font-bold text-primary">{last5DaysData.aggregatedStats.totalXP}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total Points</p>
                          <p className="text-2xl font-bold text-secondary">{last5DaysData.aggregatedStats.totalPoints}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Avg Daily XP</p>
                          <p className="text-2xl font-bold text-accent">{last5DaysData.aggregatedStats.averageDailyXP}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Days Tracked</p>
                          <p className="text-2xl font-bold text-success">{last5DaysData.aggregatedStats.daysWithCompleteData}</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No historical data available yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentHome;
