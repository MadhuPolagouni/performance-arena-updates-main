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
  Sparkles
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
  const { data, loading, error } = useAgentPerformance();
  const [timeFilter, setTimeFilter] = useState("this-week");
  const [activeMetricFilter, setActiveMetricFilter] = useState("All");

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
            { label: "Total Points", value: Math.round(data.totalPoints)?.toLocaleString() || "0", icon: Star, color: "accent", trend: "+15%" },
            { label: "Current Streak", value: `${data.currentStreak || 0} Days`, icon: Flame, color: "warning", trend: "Personal Best!" },
            { label: "Total Points Earned", value: `${data.totalPointsEarned || 0}`, icon: Target, color: "success", trend: "+5%" },
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
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel glow glowColor="secondary">
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                      Weekly Point Trajectory
                    </h3>
                    <p className="text-sm text-muted-foreground">Points vs. team average</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary" />
                    <span className="text-muted-foreground">Your Points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary/50" />
                    <span className="text-muted-foreground">Team Avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-muted border-t border-dashed border-muted-foreground/50" />
                    <span className="text-muted-foreground">Target</span>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weeklyData}>
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTeam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(var(--muted-foreground) / 0.4)"
                      strokeWidth={2}
                      strokeDasharray="8 8"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="team"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      fill="url(#colorTeam)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="points"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#colorPoints)"
                      dot={{ 
                        fill: 'hsl(var(--primary))', 
                        stroke: 'hsl(var(--background))', 
                        strokeWidth: 2, 
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        fill: 'hsl(var(--background))',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Weekly Breakdown Charts - 4 Weeks */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Generate 4 weekly charts */}
            {[1, 2, 3, 4].map((week) => {
              // Sample data - in production, this would come from data.weeklyBreakdowns[week]
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
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Points Activity Log
                  </h3>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/50">
                  {["All", "QA", "Revenue", "AHT", "NPS"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveMetricFilter(filter)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        activeMetricFilter === filter
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all hover:border-primary/30",
                      "bg-muted/20 border-border/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        log.type === 'positive' 
                          ? 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]' 
                          : 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]'
                      )} />
                      <span className="font-medium text-foreground">{log.metric}</span>
                      <span className="px-2 py-0.5 rounded bg-muted/50 text-muted-foreground text-xs border border-border/50">
                        {log.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className={cn(
                        "font-bold text-lg",
                        log.type === 'positive' ? 'text-success' : 'text-destructive'
                      )}>
                        {log.points} PTS
                      </span>
                      <span className="text-sm text-muted-foreground min-w-[90px] text-right">
                        {log.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
};

export default Performance;