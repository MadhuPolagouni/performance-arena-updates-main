
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Medal,
  Star,
  Flame,
  Target,
  Trophy,
  Zap,
  Crown,
  Shield,
  Award,
  Lock,
  Sparkles,
  TrendingUp,
  Gift,
  Clock,
  CreditCard,
  Headphones,
  Ticket,
  Gem,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  Unlock,
  Box,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAchievements, useRewardsVault } from "./hooks.jsx";
import { DashboardSkeleton } from "../../components/ui/PageSkeleton";

// Helper function to normalize reward names to simple 9-item list
const normalizeRewardName = (name) => {
  if (!name) return "Unknown Reward";
  
  const lowerName = name.toLowerCase();
  
  // Map variations of reward names to the 9 simple names
  const rewardMap = {
    'sipper': ['sipper', 'sip', 'beverage', 'water bottle'],
    'headset': ['headset', 'earphone', 'audio', 'speaker', 'headphone'],
    'bonus xps': ['bonus xps', 'bonus xp', 'xp boost', 'xps boost'],
    'bonus points': ['bonus points', 'bonus pts', 'points boost', 'pts boost'],
    'coffee mug': ['coffee mug', 'mug', 'cup', 'coffee', 'coffee cup'],
    't-shirt': ['t-shirt', 'tshirt', 'shirt', 'apparel', 'clothing'],
    'cheers': ['cheers', 'celebration', 'congrats', 'toast'],
    'laptop bag': ['laptop bag', 'laptop case', 'laptop', 'bag', 'case'],
    'hoodie': ['hoodie', 'sweatshirt', 'jacket', 'outerwear', 'fleece']
  };
  
  for (const [simpleName, variations] of Object.entries(rewardMap)) {
    if (variations.some(v => lowerName.includes(v))) {
      return simpleName;
    }
  }
  
  // Fallback to first few words if no match
  return name.split(' ').slice(0, 2).join(' ');
};

const RewardsAndAchievements = () => {
  const { data: achievementsData, loading: achievementsLoading } = useAchievements();
  const { data: rewardsData, loading: rewardsLoading, actions } = useRewardsVault();
  const [animatedXP, setAnimatedXP] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [wishlist, setWishlist] = useState([1, 5]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [revealingCard, setRevealingCard] = useState(null);
  const [relicsType, setRelicsType] = useState("scratch"); // "scratch" or "wheel"
  const [scratchCatalogRewards, setScratchCatalogRewards] = useState([]);
  const [wheelCatalogRewards, setWheelCatalogRewards] = useState([]);
  const carouselRef = useRef(null);

  // Split catalog rewards equally between scratch and wheel
  useEffect(() => {
    if (rewardsData?.rewards && rewardsData.rewards.length > 0) {
      const allRewards = rewardsData.rewards;
      const midpoint = Math.ceil(allRewards.length / 2);
      setScratchCatalogRewards(allRewards.slice(0, midpoint));
      setWheelCatalogRewards(allRewards.slice(midpoint));
    }
  }, [rewardsData?.rewards]);

  // Helper function to calculate tier based on percentile
  const calculateTier = (percentile) => {
    if (percentile <= 25) {
      return {
        name: "ELITE",
        label: "Top 1-25%",
        color: "from-accent via-yellow-500 to-warning",
        textColor: "text-accent",
        bgColor: "bg-accent/20",
        borderColor: "border-accent/30",
        motivationalQuote: "You're among the very best! Keep pushing."
      };
    } else if (percentile <= 50) {
      return {
        name: "DIAMOND",
        label: "Top 26-50%",
        color: "from-primary to-pink-600",
        textColor: "text-primary",
        bgColor: "bg-primary/20",
        borderColor: "border-primary/30",
        motivationalQuote: "You're in the top half - aim higher!"
      };
    } else if (percentile <= 75) {
      return {
        name: "ACHIEVER",
        label: "Top 51-75%",
        color: "from-secondary to-blue-600",
        textColor: "text-secondary",
        bgColor: "bg-secondary/20",
        borderColor: "border-secondary/30",
        motivationalQuote: "Great progress! You're on the right track."
      };
    } else {
      return {
        name: "RISING STAR",
        label: "Top 76-100%",
        color: "from-success to-emerald-600",
        textColor: "text-success",
        bgColor: "bg-success/20",
        borderColor: "border-success/30",
        motivationalQuote: "You're just starting - every day counts!"
      };
    }
  };

  // Get percentile from data or default to 50
  const percentile = achievementsData?.percentile || 50;
  const tier = calculateTier(percentile);

  useEffect(() => {
    if (!achievementsData) return;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedXP(prev => {
          if (prev >= achievementsData.currentXP) {
            clearInterval(interval);
            return achievementsData.currentXP;
          }
          return prev + Math.ceil(achievementsData.currentXP / 30);
        });
      }, 30);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [achievementsData]);

  const getIcon = (iconName) => {
    const icons = {
      flame: Flame,
      target: Target,
      trophy: Trophy,
      star: Star,
      zap: Zap,
      crown: Crown,
      shield: Shield,
      award: Award,
    };
    return icons[iconName] || Star;
  };

  const categories = [
    { id: "all", label: "All Relics", icon: Gem },
    { id: "gift-cards", label: "Credits", icon: CreditCard },
    { id: "time-off", label: "Time Off", icon: Clock },
    { id: "tech", label: "Tech Gear", icon: Headphones },
    { id: "experiences", label: "XP Boosts", icon: Ticket },
  ];

  
  const rarityConfig = {
    common: { 
      gradient: "from-slate-400 to-slate-600", 
      glow: "",
      border: "border-slate-500/30",
      label: "COMMON",
      labelColor: "text-slate-400"
    },
    rare: { 
      gradient: "from-secondary to-blue-600", 
      glow: "shadow-[0_0_20px_hsla(195,100%,50%,0.3)]",
      border: "border-secondary/40",
      label: "RARE",
      labelColor: "text-secondary"
    },
    epic: { 
      gradient: "from-primary to-pink-600", 
      glow: "shadow-[0_0_25px_hsla(320,100%,55%,0.4)]",
      border: "border-primary/40",
      label: "EPIC",
      labelColor: "text-primary"
    },
    legendary: { 
      gradient: "from-accent via-yellow-500 to-warning", 
      glow: "shadow-[0_0_30px_hsla(45,100%,50%,0.5)]",
      border: "border-accent/50",
      label: "LEGENDARY",
      labelColor: "text-accent"
    },
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRevealCard = (id) => {
    setRevealingCard(id);
    setTimeout(() => setRevealingCard(null), 1500);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 280;
      carouselRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (achievementsLoading || rewardsLoading) {
    return <DashboardSkeleton />;
  }

  if (!achievementsData || !rewardsData) return null;

  // Filter badges by tier and relics type
  const earnedBadges = achievementsData.badges.filter(b => {
    if (!b.earned) return false;
    // Filter by tier - show badges that match current tier
    const badgeTier = b.tier || "all"; // Default to "all" if no tier specified
    if (badgeTier !== "all" && badgeTier !== tier.name.toLowerCase()) return false;
    // Filter by relics type (scratch vs wheel achievements)
    if (relicsType === "scratch" && b.type !== "scratch") return false;
    if (relicsType === "wheel" && b.type !== "wheel") return false;
    return true;
  });
  const inProgressBadges = achievementsData.badges.filter(b => !b.earned);

  // SVG ring values
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (achievementsData.levelProgress / 100) * circumference;

  const filteredRewards = activeCategory === "all" 
    ? rewardsData.rewards 
    : rewardsData.rewards.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] bg-primary/5" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] bg-accent/5" />
        
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent/30"
            animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
            style={{ left: `${Math.random() * 100}%`, top: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_25px_hsla(320,100%,55%,0.3)]">
                <Box className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-display text-foreground tracking-wider">
                ARMORY & RELICS
              </h1>
              <p className="text-xs font-oxanium text-muted-foreground tracking-wider">
                <span className="text-primary">&gt;</span> Unlock relics. Claim power.
              </p>
            </div>
          </div>

          
         </motion.header>.
          <div className="glass-card-hero p-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Level Ring */}
          <div className="relative flex-shrink-0">
            <svg width="280" height="280" viewBox="0 0 200 200" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="hsla(260, 30%, 20%, 0.5)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="url(#levelGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_25px_hsla(280,100%,60%,0.8)]"
              />
              <defs>
                <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(280, 100%, 60%)" />
                  <stop offset="50%" stopColor="hsl(320, 100%, 60%)" />
                  <stop offset="100%" stopColor="hsl(45, 100%, 55%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-purple-400/60 font-mono uppercase tracking-widest">Level</span>
              <span className="text-6xl font-display font-black text-white">
                {achievementsData.level}
              </span>
              <span className="text-xs text-cyan-400 font-mono mt-2">{tier.name}</span>
            </div>
          </div>

          {/* Level Info & Stats */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-display font-bold text-white">
                {achievementsData.title}
              </h2>
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "px-4 py-2 rounded-full bg-gradient-to-r text-sm font-bold border shadow-lg",
                  tier.color, 
                  tier.bgColor, 
                  tier.borderColor,
                  "shadow-[0_0_20px_hsla(280,100%,60%,0.3)]"
                )}
              >
                {tier.name}
              </motion.span>
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="px-3 py-2 rounded-lg bg-slate-800/50 border border-purple-500/20 text-xs font-mono text-purple-400"
              >
                {tier.label}
              </motion.span>
            </div>
            
            <p className="text-purple-400/80 mb-3 font-mono text-sm">
              {(achievementsData.nextLevelXP - animatedXP).toLocaleString()} XP to Level {achievementsData.level + 1}
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "mb-6 p-4 rounded-lg border-2 italic text-center",
                tier.bgColor,
                tier.borderColor
              )}
            >
              <p className={cn(tier.textColor, "font-semibold")}>
                "{tier.motivationalQuote}"
              </p>
            </motion.div>

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-cyan-400 font-display font-bold">
                  {animatedXP.toLocaleString()} XP
                </span>
                <span className="text-purple-400/60 font-mono">
                  {achievementsData.nextLevelXP.toLocaleString()} XP
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-purple-500/20">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_hsla(280,100%,60%,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievementsData.levelProgress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/30 text-center hover:border-amber-400/60 transition-all hover:shadow-[0_0_20px_hsla(45,100%,50%,0.2)]"
              >
                <p className="text-3xl font-display font-bold text-amber-400">{earnedBadges.length}</p>
                <p className="text-xs text-purple-400/60 font-mono mt-2">BADGES</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-400/30 text-center hover:border-cyan-400/60 transition-all hover:shadow-[0_0_20px_hsla(180,100%,50%,0.2)]"
              >
                <p className="text-3xl font-display font-bold text-cyan-400">12</p>
                <p className="text-xs text-purple-400/60 font-mono mt-2">STREAK</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-400/30 text-center hover:border-emerald-400/60 transition-all hover:shadow-[0_0_20px_hsla(120,100%,50%,0.2)]"
              >
                <p className="text-3xl font-display font-bold text-emerald-400">98%</p>
                <p className="text-xs text-purple-400/60 font-mono mt-2">COMPLETE</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

        {/* Earned Badges - Unlocked Relics */}
       <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            BADGES EARNED
            <span className="text-sm text-purple-400/60 font-mono">({earnedBadges.length})</span>
          </h2>
          {/* Relics Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg border border-purple-500/20 p-1">
            {/* <button
              onClick={() => setRelicsType("scratch")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                relicsType === "scratch" 
                  ? "bg-gradient-to-r from-accent to-yellow-500 text-black shadow-lg" 
                  : "text-purple-400/60 hover:text-purple-400"
              )}
            >
              Scratch Card
            </button> */}
            {/* <button
              onClick={() => setRelicsType("wheel")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                relicsType === "wheel" 
                  ? "bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg" 
                  : "text-purple-400/60 hover:text-purple-400"
              )}
            >
              Wheel Wins
            </button> */}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {earnedBadges.map((badge, index) => (
            <div 
              key={index} 
              className={cn(
                "group glass-card p-5 text-center relative overflow-hidden hover:scale-105 transition-all duration-300",
                "hover:shadow-xl",
                badge.glow && `hover:${badge.glow}`
              )}
            >
              {/* Glow effect on hover */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
                badge.color,
                "opacity-5"
              )} />
              
              <div className={cn(
                "w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center relative",
                "bg-gradient-to-br shadow-lg",
                badge.color
              )}>
                <badge.icon className="w-8 h-8 text-white" />
                {/* Sparkle effect */}
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 opacity-80" />
              </div>
              <h4 className="font-display font-bold text-white mb-1 text-sm">
                {badge.title}
              </h4>
              <p className="text-xs text-purple-400/60 mb-2 line-clamp-2">
                {badge.description}
              </p>
              <p className="text-xs text-emerald-400 font-mono">
                ✓ {badge.date}
              </p>
            </div>
          ))}
        </div>
      </div>

        {/* In Progress - Locked Relics (Mysterious) */}
        {inProgressBadges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-secondary" />
              <h2 className="font-oxanium text-sm font-bold text-foreground tracking-wider">LOCKED RELICS</h2>
              <span className="text-xs text-muted-foreground font-mono">({inProgressBadges.length})</span>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressBadges.map((badge, index) => {
                const Icon = getIcon(badge.icon);
                
                return (
                  <motion.div 
                    key={index} 
                    className="arena-panel p-4 relative overflow-hidden group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleRevealCard(badge.title)}
                  >
                    {/* Mystery overlay */}
                    <AnimatePresence>
                      {revealingCard !== badge.title && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-muted/80 to-background/90 backdrop-blur-sm z-10 flex items-center justify-center"
                          exit={{ opacity: 0 }}
                        >
                          <div className="text-center">
                            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">TAP TO REVEAL</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center">
                          <Icon className="w-7 h-7 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-oxanium font-bold text-foreground text-base tracking-wide mb-1">{badge.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3 font-mono">{badge.description}</p>
                        
                        {/* Ancient Tech Progress Bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden relative">
                            <motion.div 
                              className={cn("h-full rounded-full bg-gradient-to-r", badge.color)}
                              initial={{ width: 0 }}
                              animate={{ width: `${badge.progress}%` }}
                              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                            />
                            {/* Scan line effect */}
                            <motion.div
                              className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ["-100%", "400%"] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            />
                          </div>
                          <span className="text-sm text-secondary font-display">{badge.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="flex items-center justify-between pt-10">

          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            Rewards Vault
           
          </h2>
          </div>
        </div>

        {/* COLLECTED REWARDS Section - Google Pay Style */}
        {/* <div className="relative py-4 mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-background text-muted-foreground text-xs uppercase tracking-widest font-oxanium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              COLLECTED REWARDS
            </span>
          </div>
        </div> */}

        {/* Vault Rank Progress - Inside Collected Rewards */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="arena-panel p-2 mb-4"
        >
          {/* <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground font-oxanium tracking-wider">
                VAULT RANK: <span className="text-accent font-bold">Level {rewardsData?.userRank || 1}</span>
              </span>
            </div>
            <span className="text-xs text-secondary font-mono">
              {(rewardsData?.userBalance || 0).toLocaleString()} / {(rewardsData?.nextRankPoints || 100).toLocaleString()} CR
            </span>
          </div> */}
          <div className="energy-meter h-2">
            <motion.div 
              className="energy-meter-fill"
              initial={{ width: 0 }}
              animate={{ width: `${((rewardsData?.userBalance || 0) / (rewardsData?.nextRankPoints || 100)) * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          {/* <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            {(((rewardsData?.nextRankPoints || 100) - (rewardsData?.userBalance || 0))).toLocaleString()} CR → Level {(rewardsData?.userRank || 1) + 1}
          </p> */}
        </motion.section>

        {/* Toggle between Scratch Cards, Spin Wins, and Catalog */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setRelicsType("scratch")}
              className={cn(
                "px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border",
                relicsType === "scratch"
                  ? "bg-secondary/20 border-secondary/50 text-secondary shadow-lg"
                  : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                SCRATCH CARDS
              </div>
            </button>
            <button
              onClick={() => setRelicsType("wheel")}
              className={cn(
                "px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border",
                relicsType === "wheel"
                  ? "bg-primary/20 border-primary/50 text-primary shadow-lg"
                  : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4" />
                WHEEL WINS
              </div>
            </button>
            
          </div>

          {/* Rewards Grid - Google Pay Style Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relicsType === "scratch" && (
              <>
                {/* Scratch Cards Display - Split Catalog Rewards */}
                {scratchCatalogRewards.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-sm text-muted-foreground">No scratch cards available</p>
                  </div>
                ) : (
                  scratchCatalogRewards.map((reward, idx) => {
                    const rarity = rarityConfig[reward.rarity] || rarityConfig.common;
                    return (
                      <motion.div 
                        key={reward.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className={cn(
                          "relative h-48 rounded-2xl border overflow-hidden transition-all cursor-pointer group",
                          "bg-gradient-to-br shadow-xl hover:shadow-2xl",
                          "from-secondary/30 to-blue-500/30 border-secondary/40"
                        )}
                      >
                        {/* Animated Background Gradient */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Corner Accent Glow */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all" />

                        {/* Content Container */}
                        <div className="relative z-10 h-full flex flex-col p-5 items-center justify-center text-center">
                          {/* Reward Icon */}
                          <div className="text-4xl mb-3">{reward.image || '🎁'}</div>
                          
                          {/* Title */}
                          <h4 className="font-bold text-white text-base mb-2">{normalizeRewardName(reward.title)}</h4>
                          
                          {/* Points */}
                          <div className="flex items-center gap-1 text-accent mb-2">
                            <Star className="w-4 h-4" />
                            <span className="font-bold">{reward.points?.toLocaleString() || 0} pts</span>
                          </div>
                          
                          {/* Rarity Badge */}
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn("text-[9px] font-bold px-2 py-1 rounded-full", rarity.labelColor, rarity.bgColor)}
                          >
                            {rarity.label}
                          </motion.span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </>
            )}

            {relicsType === "wheel" && (
              <>
                {/* Spin Wheel Wins Display - Split Catalog Rewards */}
                {wheelCatalogRewards.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Target className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-sm text-muted-foreground">No wheel rewards available</p>
                  </div>
                ) : (
                  wheelCatalogRewards.map((reward, idx) => {
                    const rarity = rarityConfig[reward.rarity] || rarityConfig.common;
                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={cn(
                          "relative h-48 rounded-2xl border overflow-hidden transition-all cursor-pointer group",
                          "bg-gradient-to-br shadow-xl hover:shadow-2xl",
                          "from-primary/30 to-purple-500/30 border-primary/40"
                        )}
                      >
                        {/* Animated Background Gradient */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Corner Accent Glow */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all" />

                        {/* Content Container */}
                        <div className="relative z-10 h-full flex flex-col p-5 items-center justify-center text-center">
                          {/* Reward Icon */}
                          <motion.div
                            className="text-4xl mb-3"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            {reward.image || '🎯'}
                          </motion.div>
                          
                          {/* Title */}
                          <h4 className="font-bold text-white text-base mb-2">{normalizeRewardName(reward.title)}</h4>
                          
                          {/* Points */}
                          <div className="flex items-center gap-1 text-primary mb-2">
                            <Star className="w-4 h-4" />
                            <span className="font-bold">{reward.points?.toLocaleString() || 0} pts</span>
                          </div>
                          
                          {/* Rarity Badge */}
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn("text-[9px] font-bold px-2 py-1 rounded-full", rarity.labelColor, rarity.bgColor)}
                          >
                            {rarity.label}
                          </motion.span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </>
            )}

            
            
          </div>
        </motion.section>


        {/* SCRATCH REWARDS PENDING Section - Redesigned */}
        {((rewardsData?.scratchCards || []).filter(c => c.status === "pending").length > 0 || 
          (achievementsData?.badges || []).filter(b => !b.earned && b.type === "scratch").length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-display font-bold text-white tracking-wider">
                SCRATCH REWARDS PENDING
              </h2>
              <span className="text-xs text-purple-400/60 font-mono">
                {((rewardsData?.scratchCards || []).filter(c => c.status === "pending").length)} awaiting
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(rewardsData?.scratchCards || []).filter(c => c.status === "pending").map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.55 + idx * 0.06 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="relative h-52 rounded-2xl border border-amber-400/40 overflow-hidden cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, rgba(217, 119, 6, 0.4) 0%, rgba(146, 39, 141, 0.3) 100%)",
                  }}
                >
                  {/* Animated Glow Border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{ boxShadow: [
                      "inset 0 0 20px rgba(217, 119, 6, 0.5), 0 0 40px rgba(217, 119, 6, 0.3)",
                      "inset 0 0 30px rgba(217, 119, 6, 0.7), 0 0 60px rgba(217, 119, 6, 0.5)",
                      "inset 0 0 20px rgba(217, 119, 6, 0.5), 0 0 40px rgba(217, 119, 6, 0.3)",
                    ]}}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}
                  />

                  {/* Lock Icon Floating */}
                  <motion.div
                    className="absolute top-4 right-4 z-20"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                  >
                    <div className="relative">
                      <Lock className="w-6 h-6 text-amber-300" />
                      <motion.div
                        className="absolute -inset-3 rounded-full border border-amber-300/50"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col p-5">
                    {/* Icon */}
                    <motion.div
                      className="text-5xl mb-2 opacity-80"
                      animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      {card.cardDesign?.icon || "🎁"}
                    </motion.div>

                    {/* Details */}
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1 tracking-wide">{card.name}</h4>
                      <p className="text-xs text-white/70">{card.cardDesign?.hint || "Surprise reward"}</p>
                    </div>

                    {/* Expiry + CTA */}
                    <div className="flex items-end justify-between pt-3">
                      <motion.span
                        className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-amber-500/50 text-white border border-amber-300/50 backdrop-blur-sm"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {card.expiresIn || "Expires soon"}
                      </motion.span>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-lg font-bold text-white"
                      >
                        SCRATCH →
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CARD HISTORY Section - Mini Cards */}
        {((rewardsData?.scratchCards || []).filter(c => c.status !== "pending").length > 0 ||
          (rewardsData?.spinWins || []).length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-display font-bold text-white tracking-wider">
                REWARD HISTORY
              </h2>
              <span className="text-xs text-purple-400/60 font-mono">
                {((rewardsData?.scratchCards || []).filter(c => c.status !== "pending").length + (rewardsData?.spinWins || []).length)} claimed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">normalizeRewardName(card.name)
              {/* Scratch Card History */}
              {(rewardsData?.scratchCards || []).filter(c => c.status !== "pending").map((card, idx) => (
                <motion.div
                  key={`scratch-${card.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative h-32 rounded-xl border border-cyan-400/30 overflow-hidden cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ boxShadow: [
                      "inset 0 0 15px rgba(34, 197, 94, 0.3), 0 0 25px rgba(34, 197, 94, 0.2)",
                      "inset 0 0 20px rgba(34, 197, 94, 0.5), 0 0 35px rgba(34, 197, 94, 0.3)",
                    ]}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <div className="relative z-10 h-full flex flex-col p-3 justify-between">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{card.cardDesign?.icon || "🎁"}</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1 line-clamp-1">{card.name}</p>
                      <p className="text-[10px] text-cyan-400 font-mono">{card.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Spin Wheel Wins History */}
              {(rewardsData?.spinWins || []).map((win, idx) => (
                <motion.div
                  key={`spin-${win.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.03 }}
                  whileHover={{ scale: 1.05 }}normalizeRewardName(win.reward)
                  className="relative h-32 rounded-xl border border-purple-400/30 overflow-hidden cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ boxShadow: [
                      "inset 0 0 15px rgba(168, 85, 247, 0.3), 0 0 25px rgba(168, 85, 247, 0.2)",
                      "inset 0 0 20px rgba(168, 85, 247, 0.5), 0 0 35px rgba(168, 85, 247, 0.3)",
                    ]}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <div className="relative z-10 h-full flex flex-col p-3 justify-between">
                    <div className="flex items-start justify-between">
                      <motion.span
                        className="text-2xl"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      >
                        {win.type === "points" ? "⚡" : win.type === "spin" ? "🎪" : "🎁"}
                      </motion.span>
                      {win.points > 0 && (
                        <span className="text-xs font-bold text-primary">+{win.points}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1 line-clamp-1">{win.reward}</p>
                      <p className="text-[10px] text-purple-400 font-mono">{win.claimedAt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default RewardsAndAchievements;
