import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Heart, 
  Activity, 
  ChevronRight, 
  BarChart3,
  Zap,
  Target,
  Award,
  Flame,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Gift
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Line, CartesianGrid, BarChart, Bar } from "recharts";
import { cn } from "../../lib/utils";
import { useAgentPerformance } from "./hooks.jsx";
import { DashboardSkeleton } from "../../components/ui/PageSkeleton";

const GlassPanel = ({ children, className, glow = false, glowColor = "primary" }) => (
  <motion.div
    className={cn(
      "relative rounded-xl overflow-hidden border border-border/50",
      glow && glowColor === "primary" && "shadow-[0_0_30px_hsl(var(--primary)/0.1)]",
      glow && glowColor === "secondary" && "shadow-[0_0_30px_hsl(var(--secondary)/0.1)]",
      glow && glowColor === "accent" && "shadow-[0_0_30px_hsl(var(--accent)/0.12)]",
      className
    )}
    style={{
      background: "hsl(var(--card) / 0.6)",
      backdropFilter: "blur(12px)",
    }}
  >
    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-secondary/40 rounded-bl-lg" />
    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-secondary/40 rounded-br-lg" />
    {children}
  </motion.div>
);

const Performance = () => {
  const [timeFilter, setTimeFilter] = useState("this-week");
  const [activeMetricFilter, setActiveMetricFilter] = useState("All");
  const { data, loading, error } = useAgentPerformance(null, { timeFilter });

  const statusStyles = {
    excellent: { 
      bg: "bg-success/15", 
      text: "text-success", 
      border: "border-success/30", 
      gradient: "from-success/20 to-success/5",
      iconBg: "bg-success/20"
    },
    "on-track": { 
      bg: "bg-secondary/15", 
      text: "text-secondary", 
      border: "border-secondary/30", 
      gradient: "from-secondary/20 to-secondary/5",
      iconBg: "bg-secondary/20"
    },
    "at-risk": { 
      bg: "bg-warning/15", 
      text: "text-warning", 
      border: "border-warning/30", 
      gradient: "from-warning/20 to-warning/5",
      iconBg: "bg-warning/20"
    },
    critical: { 
      bg: "bg-destructive/15", 
      text: "text-destructive", 
      border: "border-destructive/30", 
      gradient: "from-destructive/20 to-destructive/5",
      iconBg: "bg-destructive/20"
    },
  };

  const getIcon = (key) => {
    const icons = {
      qa: CheckCircle,
      revenue: DollarSign,
      aht: Clock,
      nps: Heart,
    };
    return icons[key] || Activity;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading performance data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const filteredLogs = activeMetricFilter === "All" 
    ? data.pointsLog 
    : data.pointsLog.filter(log => log.category === activeMetricFilter);

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] bg-primary/5" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] bg-secondary/4" />
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            animate={{ y: [0, -80, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
            style={{ left: `${Math.random() * 100}%`, top: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/30">
                {data.agent.avatar}
              </div>
              <motion.div 
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm">💎</span>
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                {data.agent.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm font-medium border border-primary/30">
                  {data.agent.rank}
                </span>
                <span className="text-muted-foreground text-sm font-mono">{data.agent.team}</span>
                <span className="flex items-center gap-1 text-success text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Top {100 - data.agent.percentile}%
                </span>
              </div>
            </div>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/50">
            {["This Week", "This Month"].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter.toLowerCase().replace(/ /g, "-"))}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  timeFilter === filter.toLowerCase().replace(/ /g, "-")
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total XPS", value: Math.round(data.totalXPEarned)?.toLocaleString() || "0", icon: Star, color: "accent", trend: "+15%" },
            { label: "Current Streak", value: `${data.currentStreak || 0} Days`, icon: Flame, color: "warning", trend: "Personal Best!" },
            { label: "Total Points Earned", value: `${data.totalPoints || 0}`, icon: Target, color: "success", trend: "+5%" },
            { label: "Rank", value: `#${data.rank || 0}`, icon: Award, color: "primary", trend: "↑2 spots" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <GlassPanel glow glowColor={stat.color}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      stat.color === "accent" ? "bg-accent/20" :
                      stat.color === "warning" ? "bg-warning/20" :
                      stat.color === "success" ? "bg-success/20" :
                      "bg-primary/20"
                    )}>
                      <stat.icon className={cn(
                        "w-5 h-5",
                        stat.color === "accent" ? "text-accent" :
                        stat.color === "warning" ? "text-warning" :
                        stat.color === "success" ? "text-success" :
                        "text-primary"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      stat.color === "accent" ? "bg-accent/20 text-accent" :
                      stat.color === "warning" ? "bg-warning/20 text-warning" :
                      stat.color === "success" ? "bg-success/20 text-success" :
                      "bg-primary/20 text-primary"
                    )}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        {/* PERFORMANCE REVIEW Section - Line Graph */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative py-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-display font-bold text-white tracking-wider">
              PERFORMANCE REVIEW
            </h2>
            <span className="text-xs text-purple-400/60 font-mono ml-auto">Last 30 days</span>
          </div>

          <div className="glass-card-hero p-8 relative overflow-hidden">
            {/* Background grid effect */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" className="text-purple-400">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Metrics Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-400/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-emerald-400 font-mono tracking-wider">POINTS GAINED</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-display font-bold text-emerald-400">
                    +{data?.totalPointsGained || 0}
                  </p>
                  <p className="text-xs text-emerald-400/60 mt-1">+15% vs last week</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.27 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-cyan-900/40 to-cyan-900/20 border border-cyan-400/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-cyan-400 font-mono tracking-wider">XP EARNED</span>
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-display font-bold text-cyan-400">
                    +{data?.totalXPEarned || 0}
                  </p>
                  <p className="text-xs text-cyan-400/60 mt-1">Level {data?.currentLevel || 1} Progress</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-violet-900/40 to-violet-900/20 border border-violet-400/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-violet-400 font-mono tracking-wider">XPS EARNED</span>
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <p className="text-3xl font-display font-bold text-violet-400">
                    +{data?.totalXPSEarned || 0}
                  </p>
                  <p className="text-xs text-violet-400/60 mt-1">Experience Score</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.29 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-amber-900/40 to-amber-900/20 border border-amber-400/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-amber-400 font-mono tracking-wider">REWARDS CLAIMED</span>
                    <Gift className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-3xl font-display font-bold text-amber-400">
                    {data?.rewardsClaimed || 0}
                  </p>
                  <p className="text-xs text-amber-400/60 mt-1">This month</p>
                </motion.div>
              </div>

              {/* Simplified Line Graph */}
              <div className="relative h-64 bg-gradient-to-b from-transparent to-slate-900/30 rounded-xl border border-purple-500/20 p-4 overflow-hidden">
                <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Background grid lines */}
                  <line x1="0" y1="50" x2="800" y2="50" stroke="hsla(280, 30%, 40%, 0.2)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="hsla(280, 30%, 40%, 0.2)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="hsla(280, 30%, 40%, 0.2)" strokeWidth="1" strokeDasharray="5,5" />
                  
                  {/* Gradient fill under line */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(280, 100%, 60%)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="hsl(280, 100%, 60%)" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>

                  {/* Performance line with curve */}
                  <polyline
                    points="50,120 110,95 170,80 230,90 290,65 350,55 410,70 470,45 530,35 590,60 650,40 710,50 760,30"
                    fill="none"
                    stroke="url(#chartGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Filled area under line */}
                  <polygon
                    points="50,120 110,95 170,80 230,90 290,65 350,55 410,70 470,45 530,35 590,60 650,40 710,50 760,30 760,200 50,200"
                    fill="url(#chartGradient)"
                  />

                  {/* Data points with glow */}
                  {[
                    { x: 50, y: 120 },
                    { x: 110, y: 95 },
                    { x: 170, y: 80 },
                    { x: 230, y: 90 },
                    { x: 290, y: 65 },
                    { x: 350, y: 55 },
                    { x: 410, y: 70 },
                    { x: 470, y: 45 },
                    { x: 530, y: 35 },
                    { x: 590, y: 60 },
                    { x: 650, y: 40 },
                    { x: 710, y: 50 },
                    { x: 760, y: 30 },
                  ].map((point, idx) => (
                    <g key={idx}>
                      <circle cx={point.x} cy={point.y} r="4" fill="hsl(280, 100%, 60%)" opacity="0.5" />
                      <circle cx={point.x} cy={point.y} r="2.5" fill="hsl(280, 100%, 70%)" />
                    </g>
                  ))}

                  {/* X-axis labels */}
                  <text x="50" y="190" fontSize="12" textAnchor="middle" fill="hsla(280, 30%, 50%, 0.6)">Day 1</text>
                  <text x="760" y="190" fontSize="12" textAnchor="middle" fill="hsla(280, 30%, 50%, 0.6)">Day 30</text>
                </svg>
              </div>

              {/* Trajectory Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-400/20">
                  <p className="text-xs text-purple-400/60 font-mono mb-1">PEAK PERFORMANCE</p>
                  <p className="text-lg font-display font-bold text-purple-300">{data?.peakDay || 'Day 30'} • {data?.peakPoints || '2,800'} pts</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-400/20">
                  <p className="text-xs text-purple-400/60 font-mono mb-1">AVG. DAILY GAIN</p>
                  <p className="text-lg font-display font-bold text-purple-300">+{data?.avgDailyGain || '120'} pts/day</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Weekly Breakdown Charts - 4 Weeks - COMMENTED OUT */}
        {/* 
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((week) => {
              const weekData = data.weeklyBreakdowns?.[week - 1] || {
                week: `Week ${week}`,
                points: Math.floor(Math.random() * 1500) + 500,
                trend: week % 2 === 0 ? '+12%' : '-5%',
                days: [
                  { day: 'Mon', points: 200 },
                  { day: 'Tue', points: 250 },
                  { day: 'Wed', points: 180 },
                  { day: 'Thu', points: 300 },
                  { day: 'Fri', points: 280 },
                  { day: 'Sat', points: 150 },
                  { day: 'Sun', points: 220 },
                ]
              };
              
              return (
                <motion.div
                  key={week}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + week * 0.08 }}
                >
                  <GlassPanel className="h-full">
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-foreground">{weekData.week}</h4>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          weekData.trend.startsWith('+') ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        )}>
                          {weekData.trend}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-2xl font-bold text-foreground">{weekData.points}</span>
                        <span className="text-xs text-muted-foreground ml-1">points</span>
                      </div>
                      
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weekData.days} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                            <XAxis 
                              dataKey="day" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                              height={20}
                            />
                            <Tooltip
                              contentStyle={{
                                background: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                                color: 'hsl(var(--foreground))',
                                fontSize: '11px',
                              }}
                            />
                            <Bar 
                              dataKey="points" 
                              fill="hsl(var(--primary))" 
                              radius={[4, 4, 0, 0]}
                              isAnimationActive={true}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        */}

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.metrics.map((metric, index) => {
            const Icon = getIcon(metric.key);
            const styles = statusStyles[metric.status];
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              >
                <GlassPanel className="h-full">
                  <div className={cn("h-full p-4 bg-gradient-to-br", styles.gradient)}>
                    {/* Top bar indicator */}
                    <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-xl", styles.bg)} />
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", styles.iconBg, styles.border)}>
                        <Icon className={cn("w-5 h-5", styles.text)} />
                      </div>
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border",
                        styles.bg, styles.text, styles.border
                      )}>
                        {metric.statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">{metric.title}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-foreground">
                        {metric.prefix}{metric.value}{metric.suffix}
                      </span>
                      {metric.change && (
                        <span className={cn(
                          "text-sm font-medium flex items-center gap-0.5",
                          metric.change.startsWith('+') ? 'text-success' : 'text-destructive'
                        )}>
                          {metric.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {metric.change}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className={cn("h-full rounded-full", styles.bg)}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(metric.progress, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        style={{ background: `linear-gradient(90deg, hsl(var(--${metric.status === 'excellent' ? 'success' : metric.status === 'on-track' ? 'secondary' : metric.status === 'at-risk' ? 'warning' : 'destructive'})), hsl(var(--${metric.status === 'excellent' ? 'success' : metric.status === 'on-track' ? 'secondary' : metric.status === 'at-risk' ? 'warning' : 'destructive'}) / 0.6))` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.target}</p>
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>

        {/* Points Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassPanel>
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Points Activity Log
                  </h3>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/50">
                  {["Week", "Month"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter.toLowerCase())}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        timeFilter === filter.toLowerCase()
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Graphs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* New Revenue */}
                <div className="bg-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <h4 className="font-semibold text-sm text-foreground">New Revenue</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data.kpiData?.newRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* AHT */}
                <div className="bg-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm text-foreground">Average Handle Time</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data.kpiData?.aht || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* QA Score */}
                <div className="bg-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <h4 className="font-semibold text-sm text-foreground">QA Score</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data.kpiData?.qaScore || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--success))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* NRPC */}
                <div className="bg-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <h4 className="font-semibold text-sm text-foreground">NRPC</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data.kpiData?.nrpc || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--secondary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* New Conversion % */}
                <div className="bg-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-warning" />
                    <h4 className="font-semibold text-sm text-foreground">New Conversion %</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data.kpiData?.newConversionPct || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--warning))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* NPS */}
                <div className="bg-muted/20 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-destructive" />
                    <h4 className="font-semibold text-sm text-foreground">Net Promoter Score</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data.kpiData?.nps || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
};

export default Performance;