
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

const RewardsAndAchievements = () => {
  const { data: achievementsData, loading: achievementsLoading } = useAchievements();
  const { data: rewardsData, loading: rewardsLoading, actions } = useRewardsVault();
  const [animatedXP, setAnimatedXP] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [wishlist, setWishlist] = useState([1, 5]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [revealingCard, setRevealingCard] = useState(null);
  const carouselRef = useRef(null);

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

  const earnedBadges = achievementsData.badges.filter(b => b.earned);
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
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-3xl font-display font-bold text-white">
                {achievementsData.title}
              </h2>
              <span className={cn("px-3 py-1 rounded-full bg-gradient-to-r text-sm font-medium border", tier.color, tier.bgColor, tier.borderColor)}>
                {tier.name} - {tier.label}
              </span>
            </div>
            
            <p className="text-purple-400/80 mb-2 font-mono text-sm">
              {(achievementsData.nextLevelXP - animatedXP).toLocaleString()} XP to Level {achievementsData.level + 1}
            </p>
            
            <p className={cn("mb-6 font-mono text-sm italic", tier.textColor)}>
              "{tier.motivationalQuote}"
            </p>

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-cyan-400 font-display font-bold">
                  {animatedXP.toLocaleString()} XP
                </span>
                <span className="text-purple-400/60 font-mono">
                  {achievementsData.nextLevelXP.toLocaleString()} XP
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_hsla(280,100%,60%,0.6)]"
                  style={{ width: `${achievementsData.levelProgress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-800/50 border border-purple-500/20 text-center">
                <p className="text-3xl font-display font-bold text-amber-400">{earnedBadges.length}</p>
                <p className="text-xs text-purple-400/60 font-mono mt-2">BADGES</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-800/50 border border-purple-500/20 text-center">
                <p className="text-3xl font-display font-bold text-cyan-400">12</p>
                <p className="text-xs text-purple-400/60 font-mono mt-2">STREAK</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-800/50 border border-purple-500/20 text-center">
                <p className="text-3xl font-display font-bold text-emerald-400">98%</p>
                <p className="text-xs text-purple-400/60 font-mono mt-2">COMPLETE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Earned Badges - Unlocked Relics */}
       <div>
        <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          BADGES EARNED
          <span className="text-sm text-purple-400/60 font-mono">({earnedBadges.length})</span>
        </h2>
        
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
          <div className="relative flex justify-center">
            <span className="px-4 bg-background text-muted-foreground text-xs uppercase tracking-widest font-oxanium flex items-center gap-2">
              <Gift className="w-4 h-4 text-accent" />
              REWARDS VAULT
            </span>
          </div>
        </div>

        {/* Vault Rank Progress */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="arena-panel p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground font-oxanium tracking-wider">
                VAULT RANK: <span className="text-accent font-bold">{rewardsData.userRank}</span>
              </span>
            </div>
            <span className="text-xs text-secondary font-mono">
              {rewardsData.userBalance.toLocaleString()} / {rewardsData.nextRankPoints.toLocaleString()} CR
            </span>
          </div>
          <div className="energy-meter h-2">
            <motion.div 
              className="energy-meter-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(rewardsData.userBalance / rewardsData.nextRankPoints) * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            {(rewardsData.nextRankPoints - rewardsData.userBalance).toLocaleString()} CR → {rewardsData.nextRank}
          </p>
        </motion.section>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-oxanium tracking-wider transition-all border",
                activeCategory === cat.id
                  ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_hsla(320,100%,55%,0.2)]"
                  : "bg-muted/20 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Swipeable Loot Cards - Mobile */}
        <div className="lg:hidden relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-oxanium text-sm font-bold text-foreground tracking-wider">AVAILABLE LOOT</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollCarousel('prev')}
                className="p-2 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button 
                onClick={() => scrollCarousel('next')}
                className="p-2 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredRewards.map((reward, index) => {
              const rarity = rarityConfig[reward.rarity] || rarityConfig.common;
              
              return (
                <motion.div 
                  key={reward.id}
                  className={cn(
                    "flex-shrink-0 w-64 snap-center arena-panel overflow-hidden",
                    rarity.border,
                    reward.status === "locked" && "opacity-60"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Rarity Bar */}
                  <div className={cn("h-1 w-full bg-gradient-to-r", rarity.gradient)} />

                  <div className="p-4">
                    {/* Rarity Label */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-[9px] font-oxanium tracking-widest", rarity.labelColor)}>
                        {rarity.label}
                      </span>
                      <button 
                        onClick={() => toggleWishlist(reward.id)}
                        className="p-1.5 rounded bg-background/80 border border-border/50"
                      >
                        <Heart className={cn(
                          "w-3 h-3 transition-colors",
                          wishlist.includes(reward.id) ? "text-pink-500 fill-pink-500" : "text-muted-foreground"
                        )} />
                      </button>
                    </div>

                    {/* Reward Image */}
                    <div className={cn(
                      "flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 text-4xl",
                      rarity.glow
                    )}>
                      {reward.image}
                    </div>

                    {/* Title & Description */}
                    <h4 className="font-oxanium font-bold text-foreground text-center text-sm mb-1 tracking-wide">{reward.title}</h4>
                    <p className="text-[10px] text-muted-foreground text-center mb-3 line-clamp-2 font-mono">{reward.description}</p>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="font-display font-bold text-accent">{reward.points ? reward.points.toLocaleString() : '0'}</span>
                      </div>

                      {reward.status === "locked" ? (
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-mono">
                          <Lock className="w-3 h-3" />
                          <span>{reward.requiredRank}</span>
                        </div>
                      ) : (
                        <button className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-oxanium tracking-wider border transition-colors",
                          reward.status === "limited"
                            ? "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30"
                            : "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                        )}>
                          {reward.status === "limited" ? `${reward.stock} LEFT` : "CLAIM"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRewards.map((reward, index) => {
            const rarity = rarityConfig[reward.rarity] || rarityConfig.common;
            
            return (
              <motion.div 
                key={reward.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={cn(
                  "arena-panel overflow-hidden cursor-pointer transition-all",
                  rarity.border,
                  reward.status === "locked" && "opacity-60 hover:opacity-80"
                )}
              >
                {/* Rarity Bar */}
                <div className={cn("h-1 w-full bg-gradient-to-r", rarity.gradient)} />

                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(reward.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-background/80 border border-border/50 hover:border-primary/40 transition-colors"
                >
                  <Heart className={cn(
                    "w-3 h-3 transition-colors",
                    wishlist.includes(reward.id) ? "text-pink-500 fill-pink-500" : "text-muted-foreground"
                  )} />
                </button>

                <div className="p-4">
                  {/* Rarity Label */}
                  <div className="flex justify-center mb-3">
                    <span className={cn("text-[9px] font-oxanium tracking-widest", rarity.labelColor)}>
                      {rarity.label}
                    </span>
                  </div>

                  {/* Reward Image */}
                  <div className={cn(
                    "flex items-center justify-center w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 text-3xl transition-all",
                    rarity.glow
                  )}>
                    {reward.image}
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-oxanium font-bold text-foreground text-center text-sm mb-1 tracking-wide">{reward.title}</h4>
                  <p className="text-[10px] text-muted-foreground text-center mb-3 line-clamp-2 font-mono">{reward.description}</p>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent" />
                      <span className="font-display font-bold text-accent">{reward.points ? reward.points.toLocaleString() : '0'}</span>
                    </div>

                    {reward.status === "locked" ? (
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-mono">
                        <Lock className="w-3 h-3" />
                        <span>{reward.requiredRank}</span>
                      </div>
                    ) : (
                      <button className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-oxanium tracking-wider border transition-colors",
                        reward.status === "limited"
                          ? "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30"
                          : "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                      )}>
                        {reward.status === "limited" ? `${reward.stock} LEFT` : "CLAIM"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Claim History section removed per Phase 3 updates */}
      </div>
    </div>
  );
};

export default RewardsAndAchievements;
