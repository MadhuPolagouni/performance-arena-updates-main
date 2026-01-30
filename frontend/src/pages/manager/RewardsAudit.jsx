import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Settings,
  Flag,
  Search,
  Filter,
  Gift,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fetchRewardsAudit } from "./api.js";
import { DashboardSkeleton } from "@/components/ui/PageSkeleton";
import { useAuth } from "@/contexts/AuthContext";

const RewardsAndReports = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [localHistory, setLocalHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await fetchRewardsAudit(user.id);
        if (!mounted) return;
        setData(result);
      } catch (err) {
        console.error('Failed to load rewards audit', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  // Show loading while auth is loading or if user is not authenticated
  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalDistributed = data?.totalDistributed || 0;
  const remainingBudget = data?.remainingBudget || 0;
  const totalBudget = data?.totalBudget || 1;
  const budgetChange = data?.budgetChange || 0;
  // Transform pointsByDepartment to pointsByMetric format for the chart
  const pointsByMetric = (data?.pointsByDepartment || []).map((dept, idx) => ({
    name: dept.department,
    value: Number(dept.points) || 0,
    color: [
      "hsl(280, 100%, 60%)", // primary purple
      "hsl(195, 100%, 50%)", // secondary cyan
      "hsl(145, 70%, 45%)",  // success green
      "hsl(45, 100%, 50%)",  // warning/accent
      "hsl(330, 100%, 60%)", // pink
    ][idx % 5]
  }));
  useEffect(() => {
    const rewardHistory = (data?.rewardHistory || []).map(item => ({
      avatar: item.guideName ? item.guideName.split(' ').map(n => n[0]).join('') : 'N/A',
      agent: item.guideName || 'Unknown',
      reward: item.reward || 'Points',
      points: item.points || 0,
      date: item.date || new Date().toLocaleDateString(),
      status: item.status || 'pending'
    }));
    setLocalHistory(rewardHistory);
  }, [data]);

  const handleMarkDistributed = (idx) => {
    setLocalHistory(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], status: 'distributed' };
      return copy;
    });
  };

  const exportCSV = () => {
    const rows = [
      ['Agent','Reward','Points','Date','Status'],
      ...localHistory.map(r => [r.agent, r.reward, r.points, r.date, r.status])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rewards_audit.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const liveRedemptions = data?.liveRedemptions || [];
  const fairnessAlert = data?.fairnessAlert;

  const budgetUsedPercent = ((totalBudget - remainingBudget) / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            Rewards and Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track distribution fairness and budget allocation for <span className="text-foreground font-medium">Oct 2023</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">This Month</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 100% 50%) 100%)",
            }}
          >
            <Download className="w-4 h-4" />
            Audit Report
          </motion.button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Total Points Distributed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl glass-card border border-border/50"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Points Distributed</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {totalDistributed.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded bg-success/20 text-success text-xs font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {budgetChange}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">vs. last month (127,200)</p>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-secondary rounded-full" style={{ width: "78%" }} />
              </div>
            </motion.div>

            {/* Remaining Reward Budget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl glass-card border border-border/50"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Remaining Reward Budget</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                  ${remainingBudget.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">.00</span>
                <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Low
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Allocated: ${totalBudget.toLocaleString()} Total</p>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-success rounded-full"
                  style={{ width: `${100 - budgetUsedPercent}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* Points by Metric Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl glass-card border border-border/50"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Points Earned by Metric</h3>
                <p className="text-sm text-muted-foreground">Distribution of points across different KPI categories</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4 text-secondary" />
                <span>Revenue drives 40% of total points</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointsByMetric} layout="vertical" barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value.toLocaleString()} pts`, "Points"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {pointsByMetric.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Detailed Reward History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Detailed Reward History</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search agent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-48 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Most Frequent Earners</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl glass-card border border-border/50 overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-muted/30">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward Claimed</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Points Spent</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Date</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</div>
              </div>

              <div className="divide-y divide-border/50">
                {localHistory
                  .filter(item => item.agent.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {item.avatar}
                      </div>
                      <span className="font-medium text-foreground text-sm">{item.agent}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-primary">{item.reward}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="font-mono text-sm text-foreground">{item.points.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                        item.status === "distributed" ? "bg-success/20 text-success" : item.status === "claimed" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      }`}>
                        {item.status}
                      </span>
                      {item.status !== 'distributed' && (
                        <button
                          onClick={() => handleMarkDistributed(idx)}
                          className="ml-2 px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                        >
                          Mark Distributed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Actions & Feed */}
        <div className="space-y-6">
          {/* Audit Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Audit Actions</h3>

            <button className="w-full p-4 rounded-xl glass-card border border-border/50 hover:border-primary/50 transition-colors text-left flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Adjust Point Logic</p>
                <p className="text-xs text-muted-foreground mt-0.5">Modify how points are earned.</p>
              </div>
            </button>

            <button className="w-full p-4 rounded-xl glass-card border border-border/50 hover:border-warning/50 transition-colors text-left flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Review Flags</p>
                <p className="text-xs text-muted-foreground mt-0.5">3 fairness alerts pending.</p>
              </div>
            </button>
          </div>

          {/* Live Redemptions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Redemptions</h3>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="space-y-3">
              {liveRedemptions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {item.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>{" "}
                      {item.value && <span className="text-primary font-medium">{item.value}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fairness Check */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-warning/20 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Fairness Check</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {fairnessAlert || "Top 10% of performers are claiming 60% of rewards. Consider adjusting tiers."}
            </p>
            <button className="w-full py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition-colors">
              Review Tiers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsAndReports;