
import React,{ useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { 
  Search, 
  Clock, 
  Trophy, 
  Users, 
  Building, 
  TrendingUp, 
  TrendingDown,
  Star,
  Zap,
  Crown,
  Shield,
  Gift,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  Award,
  Flame,
  Target,
  Swords,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useLeaderboard } from "./hooks.jsx";
import { TableSkeleton } from "../../components/ui/PageSkeleton";

const Leaderboard = () => {
  const [viewType, setViewType] = useState("individual");
  const [timeRange, setTimeRange] = useState("current-team"); // Start with current team view
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showRules, setShowRules] = useState(false);
  const [mobileView, setMobileView] = useState("myRank"); // myRank | global
  const [showAllRankings, setShowAllRankings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { data, loading, error } = useLeaderboard({ 
    viewType, 
    timeRange,
    department: selectedDepartment || undefined
  });

  // Get current user's department from data
  const currentUserDepartment = data?.currentUser?.department || data?.leaderboard?.[0]?.department || "";
  const departments = data?.allDepartments || [];

  // Filter data based on selections
  const filteredData = React.useMemo(() => {
    if (!data?.leaderboard) return [];
    
    // Backend now handles filtering, so just return the data
    return data.leaderboard;
  }, [data]);

  // Recalculate current user rank in filtered data
  const currentUserRank = React.useMemo(() => {
    if (!data?.currentUser || !filteredData.length) return data?.currentUser?.rank || 0;
    const userIndex = filteredData.findIndex(item => item.name === data.currentUser.name);
    return userIndex >= 0 ? userIndex + 1 : data.currentUser.rank;
  }, [filteredData, data]);

  if (loading) {
    return <TableSkeleton rows={7} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading leaderboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Level tiers with cyberpunk styling
  const levelTiers = data.levelTiers || [
    { name: "Master", minXP: 1500, color: "from-amber-400 to-orange-500", glow: "shadow-[0_0_30px_hsla(45,100%,50%,0.4)]", icon: "👑" },
    { name: "Elite", minXP: 1200, color: "from-primary to-pink-500", glow: "shadow-[0_0_25px_hsla(320,100%,55%,0.4)]", icon: "💎" },
    { name: "Expert", minXP: 900, color: "from-secondary to-blue-500", glow: "shadow-[0_0_20px_hsla(195,100%,50%,0.3)]", icon: "⚡" },
    { name: "Intermediate", minXP: 500, color: "from-emerald-400 to-green-500", glow: "shadow-[0_0_15px_hsla(160,100%,40%,0.3)]", icon: "🌟" },
    { name: "Beginner", minXP: 0, color: "from-slate-400 to-slate-600", glow: "", icon: "🔰" },
  ];

  const weeklyRewards = data.weeklyRewards || {
    top3: { points: 500, scratchCards: 3 },
    top10: { points: 250, scratchCards: 2 },
    top25Percent: { points: 100, scratchCards: 1 },
  };

  const getUserLevel = (xp) => {
    for (const tier of levelTiers) {
      if (xp >= tier.minXP) return tier;
    }
    return levelTiers[levelTiers.length - 1];
  };

  const pointsToXP = (points) => Math.floor(points / 10);

  const filteredLeaderboard = levelFilter === "all"
    ? filteredData
    : filteredData.filter(p => getUserLevel(p.xp || pointsToXP(p.points)).name === levelFilter);

  // Pagination logic - show top 10 first, then paginate remaining
  const top10 = filteredLeaderboard.slice(0, 10);
  const remaining = filteredLeaderboard.slice(10);
  const totalPages = Math.ceil(remaining.length / ITEMS_PER_PAGE);
  const paginatedRemaining = remaining.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // What to display in the table
  const displayedRankings = showAllRankings 
    ? [...top10, ...paginatedRemaining]
    : top10;

  const currentUserLevel = getUserLevel(data.currentUser.xp || pointsToXP(data.currentUser.points));

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] bg-primary/5" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] bg-accent/5" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] bg-secondary/5" />
        
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      <div className="relative z-10 space-y-5 animate-fade-in">
        {/* Header - Arena Hall */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent via-warning to-accent flex items-center justify-center shadow-[0_0_30px_hsla(45,100%,50%,0.4)]">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-lg bg-gradient-to-r from-accent to-warning opacity-30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-display text-foreground tracking-wider">
                ARENA RANKINGS
              </h1>
              <div className="flex items-center gap-2 text-xs font-oxanium text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Updated: {data.lastUpdated}</span>
                <span className="text-primary">•</span>
                <span className="text-secondary">10 PTS = 1 XP</span>
              </div>
            </div>
          </div>

          {/* Your Rank Card - Only show when viewing current team, all departments, or user's own department */}
          {(timeRange === 'current-team' || timeRange === 'all-departments' || 
            (timeRange === 'departments' && (!selectedDepartment || selectedDepartment === currentUserDepartment))) && (
            <motion.div 
              className="arena-panel-hero px-5 py-3 border-2 border-primary/40"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-lg bg-gradient-to-br flex items-center justify-center font-display text-2xl font-bold text-white",
                  currentUserLevel.color,
                  currentUserLevel.glow
                )}>
                  #{currentUserRank}
                </div>
                <div>
                  <p className="text-[9px] text-primary uppercase tracking-widest font-oxanium">YOUR POSITION</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl text-foreground">{data.currentUser.xp || pointsToXP(data.currentUser.points)} XP</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r text-white",
                      currentUserLevel.color
                    )}>
                      {currentUserLevel.icon} {currentUserLevel.name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* Mobile View Toggle */}
        <div className="lg:hidden flex items-center gap-2 p-1 rounded-lg bg-muted/30 border border-border/50">
          <button
            onClick={() => setMobileView("myRank")}
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-oxanium text-sm transition-all",
              mobileView === "myRank"
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsla(320,100%,55%,0.3)]"
                : "text-muted-foreground"
            )}
          >
            <Target className="w-4 h-4 inline mr-2" />
            My Rank
          </button>
          <button
            onClick={() => setMobileView("global")}
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-oxanium text-sm transition-all",
              mobileView === "global"
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsla(320,100%,55%,0.3)]"
                : "text-muted-foreground"
            )}
          >
            <Swords className="w-4 h-4 inline mr-2" />
            Global
          </button>
        </div>

        {/* Weekly Loot Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="arena-panel p-4 border border-accent/30 bg-gradient-to-r from-accent/5 via-transparent to-warning/5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-warning flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-oxanium font-bold text-foreground tracking-wide">WEEKLY LOOT POOL</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {data.currentWeek || "Jan 19 - Jan 25"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:gap-6">
              {[
                { label: "Top 3", pts: weeklyRewards.top3.points, cards: weeklyRewards.top3.scratchCards, color: "accent" },
                { label: "Top 10", pts: weeklyRewards.top10.points, cards: weeklyRewards.top10.scratchCards, color: "secondary" },
                { label: "Top 25%", pts: weeklyRewards.top25Percent.points, cards: weeklyRewards.top25Percent.scratchCards, color: "muted" },
              ].map((tier, idx) => (
                <div key={idx} className={cn(
                  "text-center px-3 py-2 rounded-lg border",
                  tier.color === "accent" ? "bg-accent/10 border-accent/30" :
                  tier.color === "secondary" ? "bg-secondary/10 border-secondary/30" :
                  "bg-muted/20 border-border/50"
                )}>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{tier.label}</p>
                  <p className={cn(
                    "font-display text-sm font-bold",
                    tier.color === "accent" ? "text-accent" :
                    tier.color === "secondary" ? "text-secondary" :
                    "text-foreground"
                  )}>
                    {tier.pts} <span className="text-[10px]">+</span> {tier.cards}🎫
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Rules Accordion */}
        <div className="arena-panel overflow-hidden">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-secondary" />
              <span className="font-oxanium text-sm text-foreground tracking-wide">ARENA RULES & ZONES</span>
            </div>
            <motion.div animate={{ rotate: showRules ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/50"
              >
                <div className="p-4 grid md:grid-cols-3 gap-3">
                  {[
                    { icon: TrendingUp, title: "PROMOTION", desc: "Top 20 ascend next tier", color: "success" },
                    { icon: Shield, title: "SAFE ZONE", desc: "Next 25% maintain rank", color: "secondary" },
                    { icon: TrendingDown, title: "DEMOTION", desc: "Bottom tier faces descent", color: "destructive" },
                  ].map((zone, idx) => (
                    <div key={idx} className={cn(
                      "p-3 rounded-lg border",
                      zone.color === "success" ? "bg-success/5 border-success/30" :
                      zone.color === "secondary" ? "bg-secondary/5 border-secondary/30" :
                      "bg-destructive/5 border-destructive/30"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <zone.icon className={cn(
                          "w-4 h-4",
                          zone.color === "success" ? "text-success" :
                          zone.color === "secondary" ? "text-secondary" :
                          "text-destructive"
                        )} />
                        <h4 className={cn(
                          "font-oxanium text-xs font-bold tracking-wider",
                          zone.color === "success" ? "text-success" :
                          zone.color === "secondary" ? "text-secondary" :
                          "text-destructive"
                        )}>{zone.title}</h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{zone.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time Range */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
              {["Current Team", "Departments", "All Departments"].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    const newRange = range.toLowerCase().replace(' ', '-');
                    setTimeRange(newRange);
                    // Set default department when switching to departments view
                    if (newRange === 'departments' && !selectedDepartment && currentUserDepartment) {
                      setSelectedDepartment(currentUserDepartment);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-oxanium tracking-wider transition-all",
                    timeRange === range.toLowerCase().replace(' ', '-')
                      ? "bg-secondary text-secondary-foreground shadow-[0_0_10px_hsla(195,100%,50%,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Department Select for Departments */}
            {timeRange === 'departments' && (
              <select
                value={selectedDepartment || currentUserDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 rounded-md text-xs font-oxanium bg-muted/30 border border-border/50"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}

            {/* Level Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
              <button
                onClick={() => setLevelFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-oxanium tracking-wider transition-all",
                  levelFilter === "all"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ALL
              </button>
              {levelTiers.slice(0, 3).map((tier) => (
                <button
                  key={tier.name}
                  onClick={() => setLevelFilter(tier.name)}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-xs transition-all flex items-center gap-1",
                    levelFilter === tier.name
                      ? `bg-gradient-to-r ${tier.color} text-white`
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{tier.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search warriors..."
              className="w-48 lg:w-56 pl-9 pr-4 py-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* LEGENDARY PODIUM - Top 3 */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "arena-panel-hero p-6 lg:p-8",
            mobileView === "myRank" && "hidden lg:block"
          )}
        >
          <div className="text-center mb-6">
            <h2 className="font-display text-lg text-accent tracking-widest">⚔️ LEGENDS OF THE ARENA ⚔️</h2>
          </div>

          <div className="flex items-end justify-center gap-3 lg:gap-6">
            {/* 2nd Place */}
            {data.topThree[1] && (
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative mb-3">
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 opacity-20 blur-md"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-xl lg:text-2xl font-bold text-white border-2 border-slate-300 shadow-lg relative z-10">
                    {data.topThree[1].avatar}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-500 rounded text-[9px] font-bold text-white">
                    #{data.topThree[1].rank}
                  </div>
                </div>
                <h4 className="font-oxanium font-bold text-foreground text-sm lg:text-base">{data.topThree[1].name}</h4>
                <p className="font-display text-lg text-secondary">{data.topThree[1].xp || pointsToXP(data.topThree[1].points)} XP</p>
                <div className={cn(
                  "mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r text-white",
                  getUserLevel(data.topThree[1].xp || pointsToXP(data.topThree[1].points)).color
                )}>
                  {getUserLevel(data.topThree[1].xp || pointsToXP(data.topThree[1].points)).icon}
                </div>
                <div className="w-20 lg:w-24 h-20 lg:h-24 mt-3 rounded-t-lg bg-gradient-to-b from-slate-400/20 to-slate-600/30 flex items-center justify-center font-display text-4xl lg:text-5xl font-bold text-slate-400 border-t border-x border-slate-500/30">
                  2
                </div>
              </motion.div>
            )}

            {/* 1st Place - CHAMPION */}
            {data.topThree[0] && (
              <motion.div 
                className="flex flex-col items-center -mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl mb-1"
                >
                  👑
                </motion.div>
                <div className="relative mb-3">
                  <motion.div
                    className="absolute -inset-4 rounded-full bg-gradient-to-r from-accent via-warning to-accent opacity-30 blur-xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-accent via-yellow-500 to-warning flex items-center justify-center text-2xl lg:text-3xl font-bold text-white border-3 border-accent shadow-[0_0_40px_hsla(45,100%,50%,0.5)] relative z-10"
                    animate={{ boxShadow: ["0 0 40px hsla(45,100%,50%,0.5)", "0 0 60px hsla(45,100%,50%,0.7)", "0 0 40px hsla(45,100%,50%,0.5)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {data.topThree[0].avatar}
                  </motion.div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-accent to-warning rounded text-[10px] font-bold text-white shadow-lg">
                    CHAMPION
                  </div>
                </div>
                <h4 className="font-display text-accent text-lg lg:text-xl tracking-wide">{data.topThree[0].name}</h4>
                <p className="font-display text-2xl text-warning">{data.topThree[0].xp || pointsToXP(data.topThree[0].points)} XP</p>
                <div className={cn(
                  "mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r text-white",
                  getUserLevel(data.topThree[0].xp || pointsToXP(data.topThree[0].points)).color
                )}>
                  {getUserLevel(data.topThree[0].xp || pointsToXP(data.topThree[0].points)).icon} {getUserLevel(data.topThree[0].xp || pointsToXP(data.topThree[0].points)).name}
                </div>
                <div className="w-24 lg:w-32 h-28 lg:h-36 mt-3 rounded-t-lg bg-gradient-to-b from-accent/20 to-warning/30 flex items-center justify-center font-display text-5xl lg:text-6xl font-bold text-accent border-t border-x border-accent/40 shadow-[0_0_30px_hsla(45,100%,50%,0.2)]">
                  1
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {data.topThree[2] && (
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative mb-3">
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 opacity-20 blur-md"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl lg:text-2xl font-bold text-white border-2 border-amber-500 shadow-lg relative z-10">
                    {data.topThree[2].avatar}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-600 rounded text-[10px] font-bold text-white">
                    3RD PLACE
                  </div>
                </div>
                <h4 className="font-display text-amber-500 text-base lg:text-lg tracking-wide">{data.topThree[2].name}</h4>
                <p className="font-display text-xl lg:text-2xl text-amber-400">{data.topThree[2].xp || pointsToXP(data.topThree[2].points)} XP</p>
                <div className={cn(
                  "mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r text-white",
                  getUserLevel(data.topThree[2].xp || pointsToXP(data.topThree[2].points)).color
                )}>
                  {getUserLevel(data.topThree[2].xp || pointsToXP(data.topThree[2].points)).icon} {getUserLevel(data.topThree[2].xp || pointsToXP(data.topThree[2].points)).name}
                </div>
                <div className="w-24 lg:w-32 h-28 lg:h-36 mt-3 rounded-t-lg bg-gradient-to-b from-amber-600/20 to-amber-800/30 flex items-center justify-center font-display text-5xl lg:text-6xl font-bold text-amber-500 border-t border-x border-amber-600/30 shadow-[0_0_30px_hsla(35,100%,50%,0.2)]">
                  3
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Rankings Table */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "arena-panel overflow-hidden",
            mobileView === "myRank" && "hidden lg:block"
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10">
                  <th className="text-left p-3 lg:p-4 text-[10px] font-oxanium text-muted-foreground uppercase tracking-widest w-16">RANK</th>
                  <th className="text-left p-3 lg:p-4 text-[10px] font-oxanium text-muted-foreground uppercase tracking-widest">WARRIOR</th>
                  <th className="text-left p-3 lg:p-4 text-[10px] font-oxanium text-muted-foreground uppercase tracking-widest hidden md:table-cell">TIER</th>
                  <th className="text-right p-3 lg:p-4 text-[10px] font-oxanium text-muted-foreground uppercase tracking-widest">POWER</th>
                  <th className="text-right p-3 lg:p-4 text-[10px] font-oxanium text-muted-foreground uppercase tracking-widest hidden sm:table-cell">GAP</th>
                </tr>
              </thead>
              <tbody>
                {displayedRankings.map((player, idx) => {
                  const level = getUserLevel(player.xp || pointsToXP(player.points));
                  const isTopTen = player.rank <= 10;
                  
                  return (
                    <motion.tr 
                      key={player.rank} 
                      className={cn(
                        "border-b border-border/20 transition-all",
                        isTopTen ? "bg-primary/3 hover:bg-primary/5" : "hover:bg-muted/10",
                        player.rank > 10 && "opacity-80 hover:opacity-100"
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.02 }}
                    >
                      <td className="p-3 lg:p-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-display font-bold text-lg",
                            isTopTen ? "text-accent" : "text-foreground"
                          )}>
                            {player.rank}
                          </span>
                          {player.trend === "up" && <TrendingUp className="w-3 h-3 text-success" />}
                          {player.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm",
                            level.color,
                            isTopTen && level.glow
                          )}>
                            {player.avatar}
                          </div>
                          <div>
                            <span className="font-oxanium font-medium text-foreground text-sm">{player.name}</span>
                            <p className="text-[10px] text-muted-foreground">{player.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4 hidden md:table-cell">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-gradient-to-r text-white",
                          level.color
                        )}>
                          {level.icon} {player.level || level.name}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4 text-right">
                        <span className={cn(
                          "font-display font-bold",
                          isTopTen ? "text-secondary" : "text-foreground"
                        )}>
                          {player.xp || pointsToXP(player.points)} XP
                        </span>
                      </td>
                      <td className="p-3 lg:p-4 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-warning font-mono">-{player.gap}</span>
                          {/* Power Distance Bar */}
                          <div className="w-12 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-warning to-destructive rounded-full"
                              style={{ width: `${Math.min((player.gap / 200) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {/* Separator */}
                <tr>
                  <td colSpan={5} className="py-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-8 h-px bg-border/50" />
                      <span className="text-xs font-oxanium tracking-widest">YOUR POSITION</span>
                      <div className="w-8 h-px bg-border/50" />
                    </div>
                  </td>
                </tr>

                {/* Current User - Highlighted */}
                <motion.tr 
                  className="border-2 border-primary/50 bg-primary/10"
                  animate={{ boxShadow: ["inset 0 0 20px hsla(320,100%,55%,0.1)", "inset 0 0 30px hsla(320,100%,55%,0.2)", "inset 0 0 20px hsla(320,100%,55%,0.1)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <td className="p-3 lg:p-4">
                    <span className="font-display font-bold text-primary text-lg">#{currentUserRank}</span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold",
                        currentUserLevel.color,
                        "shadow-[0_0_20px_hsla(320,100%,55%,0.4)]"
                      )}>
                        {data.currentUser.avatar}
                      </div>
                      <div>
                        <span className="font-oxanium font-bold text-primary">{data.currentUser.name}</span>
                        <p className="text-[10px] text-primary/70 font-mono">KEEP FIGHTING 💪</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 lg:p-4 hidden md:table-cell">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-gradient-to-r text-white",
                      currentUserLevel.color
                    )}>
                      {currentUserLevel.icon} {data.currentUser.level || currentUserLevel.name}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4 text-right">
                    <span className="font-display font-bold text-primary text-lg">{data.currentUser.xp || pointsToXP(data.currentUser.points)} XP</span>
                  </td>
                  <td className="p-3 lg:p-4 text-right hidden sm:table-cell">
                    <span className="text-xs text-secondary font-mono">-{data.currentUser.gap} XP</span>
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-border/30">
            {!showAllRankings ? (
              <div className="text-center">
                <motion.button 
                  onClick={() => setShowAllRankings(true)}
                  className="px-6 py-3 rounded-lg bg-primary/20 text-primary font-oxanium text-sm tracking-wider border border-primary/30 hover:bg-primary/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  SHOW MORE WARRIORS ({remaining.length} more) ↓
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground font-mono">
                  Showing {top10.length + Math.min(currentPage * ITEMS_PER_PAGE, remaining.length)} of {filteredLeaderboard.length} warriors
                </p>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        currentPage === 1
                          ? "border-border/30 text-muted-foreground/50 cursor-not-allowed"
                          : "border-primary/30 text-primary hover:bg-primary/20"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                              currentPage === pageNum
                                ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsla(320,100%,55%,0.3)]"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        currentPage === totalPages
                          ? "border-border/30 text-muted-foreground/50 cursor-not-allowed"
                          : "border-primary/30 text-primary hover:bg-primary/20"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowAllRankings(false);
                    setCurrentPage(1);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-oxanium tracking-wider transition-colors"
                >
                  COLLAPSE ↑
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Mobile: My Rank Detail View */}
        <AnimatePresence>
          {mobileView === "myRank" && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden arena-panel-hero p-5"
            >
              <div className="text-center mb-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">YOUR ARENA STATUS</p>
                <div className={cn(
                  "w-24 h-24 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center font-display text-4xl font-bold text-white mb-4",
                  currentUserLevel.color,
                  currentUserLevel.glow
                )}>
                  #{currentUserRank}
                </div>
                <h3 className="font-display text-xl text-foreground">{data.currentUser.name}</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="arena-panel p-3 text-center">
                  <p className="font-display text-2xl text-secondary">{data.currentUser.xp || pointsToXP(data.currentUser.points)}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">XP</p>
                </div>
                <div className="arena-panel p-3 text-center">
                  <p className="font-display text-2xl text-accent">{currentUserLevel.icon}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{currentUserLevel.name}</p>
                </div>
                <div className="arena-panel p-3 text-center">
                  <p className="font-display text-2xl text-warning">-{data.currentUser.gap}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Gap</p>
                </div>
              </div>

              <button
                onClick={() => setMobileView("global")}
                className="w-full py-3 rounded-lg bg-primary/20 text-primary font-oxanium text-sm tracking-wider border border-primary/30 hover:bg-primary/30 transition-colors"
              >
                VIEW GLOBAL RANKINGS →
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Leaderboard;
