import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Gift,
  Target,
  AlertTriangle,
  Trophy,
  Zap,
  MessageSquare,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useManagerOverview } from "./hooks.jsx";
import { DashboardSkeleton } from "../../components/ui/PageSkeleton";
import { useAuth } from "../../contexts/AuthContext";

const ManagerOverview = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = useManagerOverview(user?.id);
  const [timeRange, setTimeRange] = useState("7d");

  // Show loading while auth is loading or if user is not authenticated
  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading overview</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            Strategic Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoring performance metrics for <span className="text-foreground font-medium">{data.teamName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Last updated: {data.lastUpdated}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Team XPS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-xl glass-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Team XPS</span>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {((typeof data.teamXps !== 'undefined' && data.teamXps !== null)
                      ? Math.round(data.teamXps).toLocaleString()
                      : (typeof data.teamHealthScore !== 'undefined' && data.teamHealthScore !== null ? Math.round(data.teamHealthScore) : 0).toLocaleString()
                    )}
                  </span>
                </div>
            </motion.div>

            {/* Participation Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl glass-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Participation Rate</span>
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-secondary" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>{data.participationRate}</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {data.participationChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-sm ${data.participationChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {data.participationChange >= 0 ? '+' : ''}{data.participationChange}%
                </span>
                <span className="text-xs text-muted-foreground">vs. previous period</span>
              </div>
            </motion.div>
          </div>

          {/* Productivity Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl glass-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Productivity Trend</h3>
                <p className="text-sm text-muted-foreground">Weekly performance output vs targets</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Previous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0 border-t-2 border-dashed border-muted-foreground" />
                  <span className="text-muted-foreground">Target</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyData}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="5 5"
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorCurrent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bottom Cards Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Performers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-xl glass-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground uppercase text-sm tracking-wide">Top Performers</span>
                </div>
                <button className="text-xs text-primary hover:underline">View Leaderboard</button>
              </div>
              <div className="space-y-3">
                {data.topPerformers.map((performer) => (
                  <div key={performer.name} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {performer.avatar}
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground">
                        #{performer.rank}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{performer.name}</p>
                      <p className="text-xs text-muted-foreground">{performer.dept}</p>
                    </div>
                    <div className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-bold">
                      {(performer.xp / 1000).toFixed(0)}K XP
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Attention Needed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-xl glass-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-foreground uppercase text-sm tracking-wide">Attention Needed</span>
                </div>
                <button className="text-xs text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {data.attentionNeeded.map((agent, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                      {agent.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{agent.name}</p>
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        {agent.issue}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors capitalize">
                      {agent.type}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Actions & Feed */}
        <div className="space-y-6">
          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Feed</h3>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="space-y-3">
              {(data.teamRewards && data.teamRewards.length ? data.teamRewards : data.liveFeed).map((item, idx) => {
                const rewardsList = ['Sipper', 'Headset', 'Bonus XPS', 'Bonus Points', 'Coffee Mug', 'T-Shirt', 'Cheers', 'Laptop Bag', 'Hoodie'];
                const displayReward = rewardsList[idx % rewardsList.length];
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {item.name ? item.name[0] : (item.agent || 'G')[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{item.name || item.agent}</span>{" "}
                        <span className="text-muted-foreground">won</span>{" "}
                        <span className="text-primary font-medium">{displayReward}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time || item.date || 'just now'} • {item.context || item.dept || 'Team'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

            {/* Team Rewards Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team Rewards</h3>
                <button className="text-xs text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {((data.teamRewards && data.teamRewards.length) ? data.teamRewards : [
                  { name: 'Nitha Thatikonda', reward: 'Headset', time: '2h ago', context: 'Q1 Drive' },
                  { name: 'Ravi Kumar', reward: 'Sipper', time: '1d ago', context: 'Daily Spins' },
                  { name: 'Anita Sharma', reward: 'Cheers', time: '3d ago', context: 'Monthly Sprint' }
                ]).map((r, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {r.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground"><span className="font-medium">{r.name}</span> <span className="text-muted-foreground">won</span> <span className="text-primary font-semibold">{r.reward}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.time} • {r.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          {/* Manager Insight */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Manager Insight</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {data.insight}
            </p>
            <button className="w-full py-2 rounded-lg bg-card/50 border border-border text-sm font-medium text-foreground hover:bg-card transition-colors">
              View Coaching Queues
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ManagerOverview;
