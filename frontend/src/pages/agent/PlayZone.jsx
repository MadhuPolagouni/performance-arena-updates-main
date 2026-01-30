
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Star,
  Sparkles,
  Gift,
  Zap,
  Trophy,
  TrendingUp,
  Flame,
  CheckCircle,
  X,
  Clock,
  Target,
  ChevronRight,
  Shield,
  Crosshair,
  Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";
import EliteSpinWheel from "../../components/game/EliteSpinWheel";
import SpinWheelModal from "../../components/game/SpinWheelModal";
import SpinWheelNew from "../../components/game/SpinWheelNew";
import ScratchCardRevealModal from "../../components/game/ScratchCardRevealModal";
import SpinWheelBanner from "../../components/game/SpinWheelBanner";
import WeeklyChallenges from "../../components/game/WeeklyChallenges";
import ScratchCardShowcase from "../../components/game/ScratchCardShowcase";
import { usePlayzone } from "./hooks.jsx";
import { PlayzoneSkeleton } from "@/components/ui/PageSkeleton";
import ScratchRewardsPanel from "../../components/game/ScratchRewardsPanel";

const PlayZone = () => {
  const { data, loading, actions, refetch } = usePlayzone();
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 23, seconds: 15 });
  const [wheelUnlocked, setWheelUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [activeScratchCard, setActiveScratchCard] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const scratchCardRef = useRef(null);

  useEffect(() => {
    if (data) {
      setWheelUnlocked(data.wheelUnlocked || false);
      setTokenBalance(data.tokenBalance || data.totalPoints || 65);
      setCurrentPoints(data.totalPoints || 0);
      if (data.countdown) setCountdown(data.countdown);
    }
  }, [data]);

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

  const formatTime = (num) => String(num).padStart(2, "0");

  const handleScratchReveal = useCallback(async () => {
    setScratchRevealed(true);
    setShowConfetti(true);
    // Don't call claimScratch here - wait for user to click claim button
    setTimeout(() => setShowConfetti(false), 3500);
  }, []);

  // Handle claiming scratch card reward with backend integration
  const handleClaimScratchReward = useCallback(async (rewardData) => {
    try {
      const result = await actions.claimScratchReward(rewardData);
      if (result?.newBalance) {
        setCurrentPoints(result.newBalance);
        setTokenBalance(result.newBalance);
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } catch (error) {
      console.error('Failed to claim scratch reward:', error);
    }
  }, [actions]);

  const handleOpenWheel = useCallback(() => {
    const tokensNeeded = data?.tokensNeeded || 250; // Updated to 250 points for spin wheel unlock
    // Open wheel modal if user has enough tokens
    if (tokenBalance >= tokensNeeded || wheelUnlocked) {
      setShowWheelModal(true);
    }
  }, [tokenBalance, wheelUnlocked, data?.tokensNeeded]);

  // Spin wheel with token deduction
  const handleSpinWheel = useCallback(async (tokenCost) => {
    try {
      const result = await actions.spin(tokenCost);
      if (result?.success) {
        // Update local token balance
        if (result.newTokenBalance !== undefined) {
          setTokenBalance(result.newTokenBalance);
        }
      }
      return result;
    } catch (error) {
      console.error('Failed to spin wheel:', error);
      throw error;
    }
  }, [actions]);

  // Claim spin wheel reward
  const handleClaimSpinReward = useCallback(async (rewardData) => {
    try {
      const result = await actions.claimSpinReward(rewardData);
      if (result?.newBalance) {
        setCurrentPoints(result.newBalance);
        setTokenBalance(result.newBalance);
      }
      await refetch(); // Refresh all data
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      return result;
    } catch (error) {
      console.error('Failed to claim spin reward:', error);
      throw error;
    }
  }, [actions, refetch]);

  const [acceptedChallengeIds, setAcceptedChallengeIds] = useState([]);

  const handleAcceptChallenge = useCallback((challengeId) => {
    console.log("Challenge accepted:", challengeId);
    setAcceptedChallengeIds(prev => {
      if (!prev.includes(challengeId)) {
        return [...prev, challengeId];
      }
      return prev;
    });
  }, []);

  const handleAcceptAllChallenges = useCallback(() => {
    // Accept all weekly challenges at once
    if (data?.weeklyChallenges && data.weeklyChallenges.length > 0) {
      const allChallengeIds = data.weeklyChallenges.map(c => c.id);
      setAcceptedChallengeIds(allChallengeIds);
      
      // Trigger onAcceptChallenge for each challenge
      allChallengeIds.forEach(id => {
        console.log("Accepting challenge:", id);
      });
      
      console.log("All challenges accepted:", allChallengeIds);
    }
  }, [data?.weeklyChallenges]);

  const handleClaimChallengeReward = useCallback((challengeId, tokens) => {
    setTokenBalance(prev => prev + tokens);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  if (loading) return <PlayzoneSkeleton />;

  const activeStreak = data?.streak || 7;
  const totalPoints = data?.totalPoints || 0;
  const totalXPS = data?.totalXPS || 0;
  const scratchReward = data?.scratchReward || "+500 PTS";
  const tokensNeeded = data?.tokensNeeded || 250; // Updated to 250 points for spin wheel unlock
  const weeklyChallenges = data?.weeklyChallenges || [];
  const transformedWeeklyChallenges = weeklyChallenges.map(challenge => ({
    id: challenge.id,
    title: challenge.title,
    description: challenge.value !== undefined && challenge.target !== undefined 
      ? `${challenge.title}: ${challenge.value} / ${challenge.target}`
      : "Challenge Locked",
    tokens: challenge.reward,
    icon: Target, // or based on type
    metric: challenge.title.split(' ')[0], // e.g., "NRPC"
    target: challenge.target,
    duration: "Weekly",
    progress: challenge.progress,
    currentValue: challenge.value,
    accepted: challenge.accepted || false, // Use data from backend, default to false
    completed: challenge.progress >= 100,
  }));
  const scratchCards = data?.scratchCards || [];
  const todaysPerformance = data?.todaysPerformance || { meetsThreshold: true, metric: { name: "Revenue", value: "$520", target: "$500" } };
  const dailyPerformanceScore = data?.dailyPerformanceScore || { score: 88, grade: "A", metrics: [] };
  const weekRange = data?.weekRange || "Sun Jan 19 - Sat Jan 25";

  return (
    <div className="relative pb-4">
      {/* Background - Simplified */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[150px] bg-primary/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[120px] bg-secondary/3" />
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), rotate: 0, opacity: 1 }}
                animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50, rotate: Math.random() * 720, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.3 }}
                className="absolute rounded-sm"
                style={{
                  width: Math.random() * 6 + 4,
                  height: Math.random() * 6 + 4,
                  backgroundColor: ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--success))"][Math.floor(Math.random() * 4)],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 space-y-4">
        {/* Header - Battle Console */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <Crosshair className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div>
                  <h1 className="text-lg lg:text-xl font-display text-foreground tracking-wider">
                    BATTLE CONSOLE
                  </h1>
                  <p className="text-[10px] font-oxanium text-muted-foreground tracking-wider">
                    <span className="text-secondary">&gt;</span> Execute missions. Claim rewards.
                  </p>
                </div>
                
                {/* Synced XP and Points beside Title */}
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-display text-primary">{Math.round(totalXPS).toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-display text-accent">{Math.round(totalPoints).toLocaleString()} PTS</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Status Bar */}
          <div className="flex items-center gap-2">
            <div className="arena-panel px-2 py-1.5 flex items-center gap-1.5 border border-warning/40">
              <Flame className="w-3.5 h-3.5 text-warning" />
              <span className="font-display text-base text-warning">{activeStreak}</span>
              <span className="text-[8px] text-warning/70 uppercase">Day</span>
            </div>

            <div className="arena-panel px-2 py-1.5 text-center">
              <p className="font-display text-xs text-secondary">
                {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
              </p>
            </div>

            <div className="arena-panel px-3 py-1.5 flex items-center gap-1.5 border border-accent/40">
            <Star className="w-4 h-4 text-accent" />
              <span className="font-display text-lg text-accent">{Math.round(totalPoints).toLocaleString()}</span>
            </div>

            <div className="arena-panel px-3 py-1.5 flex items-center gap-1.5 border border-primary/40">
            <Zap className="w-4 h-4 text-primary" />
              <span className="font-display text-lg text-primary">{Math.round(totalXPS).toLocaleString()}</span>
              <span className="text-[8px] text-primary/70 uppercase">XPS</span>
            </div>
          </div>
        </motion.header>

        

        {/* Spin Wheel Banner - Compact */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SpinWheelBanner
            isUnlocked={wheelUnlocked}
            pointsEarned={tokenBalance}
            pointsNeeded={tokensNeeded}
            nextSpinIn={wheelUnlocked ? `${formatTime(countdown.hours)}:${formatTime(countdown.minutes)}` : null}
            onOpenWheel={handleOpenWheel}
            onViewChallenges={() => document.querySelector('[data-scroll-to="challenges"]')?.scrollIntoView({ behavior: 'smooth' })}
            onAcceptAllChallenges={handleAcceptAllChallenges}
          />
        </motion.section>

        {/* Main Grid - Stacked layout for better content flow */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Weekly Challenges - Takes 2 columns on XL */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="xl:col-span-2"
            data-scroll-to="challenges"
          >
            <div className="arena-panel p-5 border border-secondary/20">
              <WeeklyChallenges
                challenges={transformedWeeklyChallenges}
                tokenBalance={tokenBalance}
                tokensNeeded={tokensNeeded}
                weekRange={weekRange}
                onAcceptChallenge={handleAcceptChallenge}
                onClaimReward={handleClaimChallengeReward}
                acceptedChallengesFromParent={acceptedChallengeIds}
              />
            </div>
          </motion.div>

          {/* Scratch Cards - Takes 1 column on XL */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="arena-panel p-4 border border-accent/20 h-full">
              <ScratchCardShowcase
                cards={scratchCards}
                meetsThreshold={todaysPerformance.meetsThreshold}
                todaysMetric={todaysPerformance.metric}
                onScratchCard={setActiveScratchCard}
              />
            </div>
          </motion.div>
        </div>

        {/* Daily Missions - Removed per Phase 1 updates */}

        {/* Earning History - Removed per Phase 1 updates */}
      </div>

      {/* Full-Screen Scratch Card Reveal Modal */}
      <ScratchCardRevealModal
        isOpen={activeScratchCard !== null && todaysPerformance.meetsThreshold}
        onClose={() => {
          setActiveScratchCard(null);
          setScratchRevealed(false);
        }}
        reward={scratchReward}
        rewardType="points"
        onReveal={handleScratchReveal}
        onClaimReward={handleClaimScratchReward}
        currentBalance={currentPoints}
      />

      {/* Spin Wheel Modal with Token Deduction - New Enhanced Wheel */}
      <SpinWheelNew
        isOpen={showWheelModal}
        onClose={() => setShowWheelModal(false)}
        onSpin={handleSpinWheel}
        onClaimReward={handleClaimSpinReward}
        tokenBalance={tokenBalance}
        tokenCost={tokensNeeded}
        currentPoints={currentPoints}
        onClaimSuccess={() => refetch()}
      />
    </div>
  );
};

export default PlayZone;