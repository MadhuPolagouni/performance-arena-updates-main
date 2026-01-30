import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [pendingOpen, setPendingOpen] = useState(false);

  const pendingActions = [
    { id: 1, title: 'Approve reward distributions', info: '3 items pending approval' },
    { id: 2, title: 'Review flagged claims', info: '2 fairness flags' }
  ];

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
        // populate localHistory immediately from fetched result to avoid
        // any conditional hook ordering issues between renders
        let rewardHistory = (result?.rewardHistory || []).map(item => ({
          avatar: item.guideName ? item.guideName.split(' ').map(n => n[0]).join('') : 'N/A',
          agent: item.guideName || 'Unknown',
          reward: item.reward || 'Points',
          points: item.points || 0,
          date: item.date || new Date().toLocaleDateString(),
          status: item.status || 'pending'
        }));
        // If no remote history, populate with sensible dummy recent rewards
        if (!rewardHistory.length) {
          rewardHistory = [
            { avatar: 'NT', agent: 'Nitha Thatikonda', reward: 'Headset', points: 4709, date: 'just now', status: 'claimed' },
            { avatar: 'RK', agent: 'Ravi Kumar', reward: 'Sipper', points: 150, date: '1d ago', status: 'distributed' },
            { avatar: 'AS', agent: 'Anita Sharma', reward: 'Cheers (5000)', points: 5000, date: '3d ago', status: 'claimed' }
          ];
        }
        setLocalHistory(rewardHistory);
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

      {/* Pending Actions (Premium Design) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 via-card to-secondary/20 border border-primary/30 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Pending Actions</h2>
            <p className="text-sm text-muted-foreground">Review and approve pending reward distributions</p>
          </div>
          <button
            onClick={() => setPendingOpen(p => !p)}
            className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
          >
            {pendingOpen ? '✕ Hide' : '▼ Show'}
          </button>
        </div>
        <AnimatePresence>
          {pendingOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {pendingActions.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{p.info}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Grid */}
      <div className="grid  gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Points by Metric Chart */}
          
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
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/30">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guide</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward Won</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Date</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Contest</div>
              </div>

              <div className="divide-y divide-border/50">
                {(
                  [
                    { avatar: 'NT', agent: 'Nitha Thatikonda', reward: 'Headset', date: '2h ago', context: 'Q1 Drive' },
                    { avatar: 'RK', agent: 'Ravi Kumar', reward: 'Sipper', date: '1d ago', context: 'Daily Spins' },
                    { avatar: 'AS', agent: 'Anita Sharma', reward: 'Cheers', date: '3d ago', context: 'Monthly Sprint' },
                    { avatar: 'PV', agent: 'Priya Verma', reward: 'Coffee Mug', date: '5d ago', context: 'Weekly Challenge' },
                    { avatar: 'MJ', agent: 'Mitesh Joshi', reward: 'T-Shirt', date: '1w ago', context: 'Achievement Badge' },
                    { avatar: 'SK', agent: 'Shweta Kapoor', reward: 'Bonus XPS', date: '1w ago', context: 'Performance Bonus' },
                    { avatar: 'AK', agent: 'Arjun Kumar', reward: 'Laptop Bag', date: '2w ago', context: 'Milestone Reached' },
                    { avatar: 'DM', agent: 'Deepak Malhotra', reward: 'Hoodie', date: '2w ago', context: 'Team Excellence' },
                    { avatar: 'NP', agent: 'Neha Patel', reward: 'Bonus Points', date: '2w ago', context: 'Sales Target' },
                    { avatar: 'RJ', agent: 'Rajesh Jadhav', reward: 'Sipper', date: '3w ago', context: 'Customer Feedback' },
                    { avatar: 'VP', agent: 'Vidya Prakash', reward: 'Headset', date: '3w ago', context: 'Quality Score' },
                    { avatar: 'HS', agent: 'Harsh Singh', reward: 'Coffee Mug', date: '1m ago', context: 'Leadership Award' },
                    { avatar: 'SA', agent: 'Shreya Agarwal', reward: 'Cheers', date: '1m ago', context: 'Innovation' },
                    { avatar: 'KD', agent: 'Kapil Desai', reward: 'T-Shirt', date: '1m ago', context: 'Performance Excellence' },
                    { avatar: 'MP', agent: 'Meera Prabhu', reward: 'Bonus XPS', date: '1m ago', context: 'Consistency Award' }
                  ]
                )
                  .filter(item => item.agent.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {item.avatar}
                      </div>
                      <span className="font-medium text-foreground text-sm">{item.agent}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-primary font-medium">{item.reward}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">{item.context}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        
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

        </div>

        
      </div>
    </div>
  );
};

export default RewardsAndReports;
