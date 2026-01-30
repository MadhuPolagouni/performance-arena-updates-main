
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, Shield, Gift, Zap, Star, Crown, Sparkles, Users, Target, Play, ChevronRight, Flame, Sword, Gamepad2, Medal, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GamifiedBackground from "@/components/effects/GamifiedBackground";
import vrGamerHero from "@/assets/vr-gamer-hero.png";
import warriorKnight3d from "@/assets/warrior-knight-3d.png";
import goldenTrophy3d from "@/assets/golden-trophy-3d.png";
import genpactLogo from "@/assets/genpact-logo.svg";
import godaddyLogo from "@/assets/godaddy-logo.svg";
import ProductionReport from '@/components/ui/ProductionReport';
import RewardsGallery from '@/components/ui/RewardsGallery';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 12, seconds: 45 });
  const [activeFeature, setActiveFeature] = useState(0);

  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 900], [0, -70]);
  const ranksParallaxY = useTransform(scrollY, [500, 1700], [0, -90]);

  const handleEnterArena = () => {
    if (loading) return;
    
    if (isAuthenticated) {
      const roleRoutes = {
        admin: '/admin',
        leadership: '/leadership',
        manager: '/manager',
        agent: '/agent'
      };
      navigate(roleRoutes[user.role] || '/login');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (num) => String(num).padStart(2, "0");

  const stats = [
    { value: "250K+", label: "WARRIORS", icon: Users },
    { value: "148K", label: "REWARDS", icon: Gift },
    { value: "500+", label: "BATTLES", icon: Sword },
    { value: "$2.5M", label: "PRIZES", icon: Crown },
  ];

  const features = [
    {
      icon: Trophy,
      title: "COMPETE & CONQUER",
      description: "Battle in daily tournaments and claim your throne on the global leaderboard.",
      color: "from-amber-500 to-orange-600",
      glow: "hsla(35,100%,50%,0.4)",
    },
    {
      icon: Zap,
      title: "POWER UP",
      description: "Complete missions, crush targets, and supercharge your XP to unlock elite tiers.",
      color: "from-purple-500 to-pink-600",
      glow: "hsla(280,100%,60%,0.4)",
    },
    {
      icon: Gift,
      title: "LOOT DROPS",
      description: "Spin legendary wheels, scratch mystery cards, and discover rare rewards.",
      color: "from-cyan-500 to-blue-600",
      glow: "hsla(195,100%,50%,0.4)",
    },
    {
      icon: Shield,
      title: "RANK UP",
      description: "Rise through the ranks from Rookie to Legend and earn exclusive badges.",
      color: "from-emerald-500 to-teal-600",
      glow: "hsla(160,100%,40%,0.4)",
    },
  ];

  const ranks = [
    { name: "LEGEND", color: "from-amber-400 to-yellow-500", players: "1%" },
    { name: "DIAMOND", color: "from-cyan-400 to-blue-500", players: "5%" },
    { name: "PLATINUM", color: "from-purple-400 to-pink-500", players: "15%" },
    { name: "GOLD", color: "from-yellow-500 to-amber-600", players: "30%" },
  ];

  // Top 3 players for compact leaderboard
  const topPlayers = [
    { rank: 1, name: "Sarah K.", xp: "32K", avatar: "👑" },
    { rank: 2, name: "Alex R.", xp: "28K", avatar: "🔥" },
    { rank: 3, name: "Mike T.", xp: "25K", avatar: "⚡" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      {/* Shared Gamified Background */}
      <GamifiedBackground
        variant="default"
        showGrid={true}
        showOrbs={true}
        showParticles={true}
        showDataStreams={false}
        primaryColor="280, 100%, 60%"
        secondaryColor="195, 100%, 50%"
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 py-3 sm:py-4 border-b border-border/20 backdrop-blur-sm">
        <motion.div 
          className="flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_25px_hsla(280,100%,60%,0.5)]">
            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <motion.div 
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: 'blur(8px)' }}
            />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl text-foreground tracking-wide">
            ga<span className="text-primary">ME</span>trix
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          <button onClick={() => navigate('/login')} className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
          <button onClick={() => navigate('/login')} className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Gift className="w-4 h-4" /> Rewards
          </button>
          <button onClick={() => navigate('/login')} className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Target className="w-4 h-4" /> Contests
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:block px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Log In
          </button>
          <motion.button
            onClick={handleEnterArena}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary to-pink-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_hsla(320,100%,55%,0.4)] hover:shadow-[0_0_35px_hsla(320,100%,55%,0.6)] transition-shadow"
          >
            PLAY NOW
          </motion.button>
        </div>
      </nav>

      {/* Partner Logos */}
      <div className="relative z-40 container mx-auto px-4 sm:px-6 lg:px-12 mt-3 mb-2 flex items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          <img src={genpactLogo} alt="Genpact" className="h-8 opacity-95" />
          <img src={godaddyLogo} alt="GoDaddy" className="h-8 opacity-95" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] sm:min-h-[85vh] flex items-center">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Live badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-success/20 border border-success/40 mb-4 sm:mb-6"
              >
                <motion.span 
                  className="w-2 h-2 rounded-full bg-success"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs sm:text-sm font-semibold text-success">🔥 12 LIVE BATTLES</span>
              </motion.div>

              {/* Main headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-foreground leading-[1.1] mb-4 sm:mb-6">
                  <span className="block">ENTER THE</span>
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-pink-500 to-secondary bg-clip-text text-transparent">
                      ARENA
                    </span>
                    <motion.span 
                      className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />
                  </span>
                </h1>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl"
              >
                Compete in epic tournaments, earn legendary rewards, and rise to the top of the global leaderboard. Your journey to greatness starts here.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
              >
                <motion.button
                  onClick={handleEnterArena}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 60px hsla(320, 100%, 55%, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-primary via-pink-600 to-primary bg-[length:200%_auto] text-white font-bold text-base sm:text-lg tracking-wide shadow-[0_0_40px_hsla(320,100%,55%,0.4)] hover:bg-right transition-all duration-500"
                >
                  <Flame className="w-5 h-5" />
                  <span>START PLAYING</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-5 sm:mt-8 inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 rounded-xl bg-warning/10 border border-warning/30"
              >
                <Flame className="w-5 h-5 text-warning animate-pulse" />
                <div>
                  <p className="text-[10px] sm:text-xs text-warning/70 uppercase tracking-wider font-semibold">MEGA EVENT STARTS IN</p>
                  <p className="font-display text-xl sm:text-2xl font-black text-warning tracking-wider">
                    {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
                  </p>
                </div>
              </motion.div>
              </motion.div>

              {/* Timer */}
              
            </div>

            {/* Right Side - VR Gamer Hero with Battle Effects */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:flex items-center justify-center relative"
              style={{ y: heroParallaxY }}
            >
              <div className="relative w-full max-w-xl h-[520px] flex items-center justify-center">
                {/* Animated Battle Scene Background */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  {/* Explosion bursts */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`explosion-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: 20 + Math.random() * 40,
                        height: 20 + Math.random() * 40,
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                        background: `radial-gradient(circle, ${['hsla(45, 100%, 60%, 0.6)', 'hsla(320, 100%, 55%, 0.5)', 'hsla(30, 100%, 50%, 0.5)'][i % 3]} 0%, transparent 70%)`,
                      }}
                      animate={{
                        scale: [0, 2, 0],
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                  
                  {/* Spark streaks */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`spark-${i}`}
                      className="absolute w-1 h-8 rounded-full"
                      style={{
                        background: `linear-gradient(to bottom, ${['hsl(45, 100%, 60%)', 'hsl(320, 100%, 55%)', 'hsl(195, 100%, 50%)'][i % 3]}, transparent)`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.2, 0.5],
                        y: [0, -30, 0],
                      }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>

                {/* Energy beam effects */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 400">
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="80"
                    fill="none"
                    stroke="url(#energyGradient)"
                    strokeWidth="2"
                    animate={{ r: [80, 100, 80], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="120"
                    fill="none"
                    stroke="url(#energyGradient2)"
                    strokeWidth="1"
                    animate={{ r: [120, 150, 120], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(320, 100%, 55%)" />
                      <stop offset="100%" stopColor="hsl(280, 100%, 60%)" />
                    </linearGradient>
                    <linearGradient id="energyGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(195, 100%, 50%)" />
                      <stop offset="100%" stopColor="hsl(320, 100%, 55%)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Background glow effects */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/30 via-pink-500/20 to-secondary/30 blur-3xl"
                />

                {/* VR Gamer Hero Image */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-20"
                >
                  <img 
                    src={vrGamerHero} 
                    alt="VR Gamer" 
                    className="w-full max-w-lg h-auto rounded-2xl drop-shadow-[0_0_80px_hsla(280,100%,60%,0.5)]"
                  />
                  {/* Glow effect under image */}
                  <motion.div
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-16 bg-gradient-to-r from-primary/40 via-pink-500/50 to-secondary/40 blur-2xl rounded-full"
                  />
                </motion.div>

                {/* Floating magic particles */}
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full z-30"
                    style={{
                      width: 2 + Math.random() * 6,
                      height: 2 + Math.random() * 6,
                      background: ['hsl(var(--primary))', 'hsl(45, 100%, 60%)', 'hsl(195, 100%, 60%)', 'hsl(320, 100%, 60%)'][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -80 - Math.random() * 50, 0],
                      x: [0, (Math.random() - 0.5) * 40, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 2, 0.5],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Production Report */}
      <section className="relative z-20 mx-4 sm:mx-6 lg:mx-12 mb-8">
        <div className="container mx-auto">
          <ProductionReport mandays={124} guidesProcessed={42} period="This Week" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 -mt-8 sm:-mt-12 mx-4 sm:mx-6 lg:mx-12 mb-8 sm:mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-[0_0_60px_hsla(280,100%,60%,0.1)]"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <p className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-foreground mb-0.5">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-black text-foreground mb-3 sm:mb-4">
              POWER UP YOUR{" "}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                GAME
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to dominate the competition and claim victory
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                onHoverStart={() => setActiveFeature(index)}
                className={`group relative p-5 sm:p-6 lg:p-8 rounded-2xl bg-card/50 border backdrop-blur-md overflow-hidden transition-all duration-300 cursor-pointer ${
                  activeFeature === index 
                    ? 'border-primary/50 shadow-[0_0_40px_hsla(320,100%,55%,0.15)]' 
                    : 'border-border/50 hover:border-primary/30'
                }`}
              >
                {/* Glow effect */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300`}
                  animate={{ opacity: activeFeature === index ? 0.05 : 0 }}
                />
                
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                  style={{ boxShadow: activeFeature === index ? `0 0 30px ${feature.glow}` : 'none' }}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <h3 className="text-base sm:text-lg lg:text-xl font-display font-bold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                <motion.div 
                  className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: activeFeature === index ? 1 : 0, x: activeFeature === index ? 0 : -10 }}
                >
                  <span>Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Gallery */}
      <section className="relative z-10 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-4 text-center">
            <h3 className="text-lg sm:text-2xl font-display font-bold text-foreground">Rewards Gallery</h3>
            <p className="text-sm text-muted-foreground">Popular rewards available for guides</p>
          </div>
          <RewardsGallery />
        </div>
      </section>

      {/* Compact Leaderboard Preview */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24 border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">LIVE RANKINGS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-black text-foreground mb-3 sm:mb-4">
              TOP{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                WARRIORS
              </span>
            </h2>
          </motion.div>

          {/* Compact Top 3 Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-4 sm:p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50">
              {/* Top 3 Row */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
                {topPlayers.map((player, index) => (
                  <motion.div
                    key={player.rank}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex flex-col items-center ${index === 0 ? 'scale-110' : ''}`}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2 + index * 0.5, repeat: Infinity }}
                      className="relative"
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-amber-300' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 border-2 border-slate-300' :
                        'bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-300'
                      }`}>
                        {player.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-amber-500' :
                        index === 1 ? 'bg-slate-500' :
                        'bg-orange-500'
                      }`}>
                        {player.rank}
                      </div>
                    </motion.div>
                    <p className="mt-2 font-display font-bold text-foreground text-xs sm:text-sm">{player.name}</p>
                    <p className="text-[10px] text-muted-foreground">{player.xp} XP</p>
                  </motion.div>
                ))}
              </div>

              {/* View Full Leaderboard Button */}
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/20 to-pink-600/20 border border-primary/30 text-primary font-semibold hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                View Full Leaderboard
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ranks Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24 border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-foreground mb-4 sm:mb-6">
                CLIMB THE{" "}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  RANKS
                </span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                Progress through competitive tiers, earn exclusive badges, and prove your worth among the elite. Only the top 1% reach Legend status.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {ranks.map((rank, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-lg`}>
                      <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm sm:text-base font-display font-bold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>
                        {rank.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Top {rank.players} of players</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-success" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 3D Warrior Knight with Rotating Trophy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[350px] sm:h-[450px] flex items-center justify-center"
              style={{ y: ranksParallaxY }}
            >
              {/* Battle scene background effects */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Explosion effects */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`rank-explosion-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: 30 + Math.random() * 50,
                      height: 30 + Math.random() * 50,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      background: `radial-gradient(circle, ${['hsla(45, 100%, 60%, 0.4)', 'hsla(280, 100%, 55%, 0.3)', 'hsla(30, 100%, 50%, 0.4)'][i % 3]} 0%, transparent 70%)`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: i * 1.2,
                    }}
                  />
                ))}
                
                {/* Energy sparks */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={`spark-rank-${i}`}
                    className="absolute w-1 h-6 rounded-full"
                    style={{
                      background: `linear-gradient(to bottom, ${['hsl(45, 100%, 60%)', 'hsl(280, 100%, 60%)'][i % 2]}, transparent)`,
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </div>

              {/* Rotating 3D Trophy */}
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  y: [0, -8, 0]
                }}
                transition={{ 
                  rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 z-30"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img 
                  src={goldenTrophy3d} 
                  alt="Trophy" 
                  className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_0_40px_hsla(45,100%,50%,0.6)]"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-amber-500/50 blur-xl rounded-full"
                />
              </motion.div>

              {/* 3D Warrior Knight */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative z-20 mt-12"
              >
                <img 
                  src={warriorKnight3d} 
                  alt="Legend Warrior Knight" 
                  className="h-72 sm:h-80 w-auto drop-shadow-[0_0_60px_hsla(45,100%,50%,0.5)]"
                />
                {/* Ground glow */}
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-56 h-12 bg-gradient-to-r from-primary/40 via-amber-500/60 to-primary/40 blur-2xl rounded-full"
                />
              </motion.div>

              {/* Floating particles around warrior */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`warrior-particle-${i}`}
                  className="absolute rounded-full z-10"
                  style={{
                    width: 3 + Math.random() * 5,
                    height: 3 + Math.random() * 5,
                    background: ['hsl(45, 100%, 60%)', 'hsl(280, 100%, 60%)', 'hsl(320, 100%, 60%)'][i % 3],
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -50 - Math.random() * 30, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto p-8 sm:p-12 lg:p-16 rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-pink-900/30 to-secondary/20 border border-primary/30 rounded-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
            
            <div className="relative z-10 text-center">
              <motion.div 
                className="flex items-center justify-center gap-2 mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-warning fill-warning" />
                <span className="text-xs sm:text-sm font-bold text-warning uppercase tracking-wider">JOIN 250,000+ WARRIORS</span>
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-warning fill-warning" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-black text-foreground mb-4 sm:mb-6">
                YOUR LEGEND AWAITS
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Don't miss the action. Join the arena, compete in tournaments, and claim your rewards. The battle for glory starts now.
              </p>
              
              <motion.button
                onClick={handleEnterArena}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 sm:px-12 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-primary via-pink-600 to-primary bg-[length:200%_auto] text-white font-bold text-base sm:text-lg tracking-wide shadow-[0_0_50px_hsla(320,100%,55%,0.5)] hover:shadow-[0_0_80px_hsla(320,100%,55%,0.7)] hover:bg-right transition-all duration-500"
              >
                <span className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ENTER THE ARENA
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 sm:py-8 border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-foreground">gaMEtrix</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 2,847 Online</span>
              <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> 12 Live</span>
              <span className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> $45K Prizes</span>
            </div>
            <p className="text-xs text-muted-foreground/60">© 2026 gaMEtrix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
