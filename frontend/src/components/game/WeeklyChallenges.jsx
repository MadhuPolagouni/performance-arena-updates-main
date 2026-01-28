/**
 * Weekly Challenges Component
 * Gamified challenge system to unlock spin wheel
 * Features: Accept challenge flow, token points system, progress tracking
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Zap,
  TrendingUp,
  Star,
  CheckCircle,
  Lock,
  Timer,
  Gift,
  Sparkles,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/ui/Portal";

const WeeklyChallenges = ({ 
  challenges = [], 
  tokenBalance = 0, 
  tokensNeeded = 100,
  onAcceptChallenge,
  onClaimReward,
  weekRange = "Sun-Sat",
  acceptedChallengesFromParent = [],
}) => {
  const [acceptedChallenges, setAcceptedChallenges] = useState(
    challenges.filter(c => c.accepted).map(c => c.id)
  );
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimFx, setClaimFx] = useState(null);
  const [tokenPulse, setTokenPulse] = useState(0);

  // Update accepted challenges when parent passes new ones
  useEffect(() => {
    if (acceptedChallengesFromParent && acceptedChallengesFromParent.length > 0) {
      setAcceptedChallenges(acceptedChallengesFromParent);
      // Call onAcceptChallenge for each newly accepted challenge
      acceptedChallengesFromParent.forEach(id => {
        onAcceptChallenge?.(id);
      });
    }
  }, [acceptedChallengesFromParent, onAcceptChallenge]);

  useEffect(() => {
    if (!claimFx) return;
    const t = window.setTimeout(() => setClaimFx(null), 1400);
    return () => window.clearTimeout(t);
  }, [claimFx]);

  const defaultChallenges = [
    {
      id: "nrpc-streak",
      title: "NRPC Streak",
      description: "NRPC > $10 for 3 continuous days",
      tokens: 20,
      points: 20,
      icon: TrendingUp,
      metric: "NRPC",
      target: "> $10",
      duration: "3 days streak",
      progress: 67,
      currentValue: "$12.50",
      daysCompleted: 2,
      daysRequired: 3,
      accepted: true,
      completed: false,
    },
    {
      id: "nconv-weekly",
      title: "Conversion Master",
      description: "NConv% > 15% for the week",
      tokens: 30,
      points: 30,
      icon: Target,
      metric: "NConv%",
      target: "> 15%",
      duration: "Weekly",
      progress: 85,
      currentValue: "17.2%",
      accepted: true,
      completed: false,
    },
    {
      id: "nps-weekly",
      title: "Customer Champion",
      description: "NPS > 70 for the week",
      tokens: 20,
      points: 20,
      icon: Star,
      metric: "NPS",
      target: "> 70",
      duration: "Weekly",
      progress: 100,
      currentValue: "78",
      accepted: true,
      completed: true,
    },
    {
      id: "naos-weekly",
      title: "Sales Excellence",
      description: "NAOS > $50 for at least 3 days",
      tokens: 20,
      points: 20,
      icon: TrendingUp,
      metric: "NAOS",
      target: "> $50",
      duration: "3+ days",
      progress: 40,
      currentValue: "$45",
      daysCompleted: 1,
      daysRequired: 3,
      accepted: false,
      completed: false,
    },
    {
      id: "qa-weekly",
      title: "Quality Guardian",
      description: "QA Score > 80% for the week",
      tokens: 10,
      points: 10,
      icon: CheckCircle,
      metric: "QA Score",
      target: "> 80%",
      duration: "Weekly",
      progress: 90,
      currentValue: "92%",
      accepted: true,
      completed: false,
    },
  ];

  const displayChallenges = challenges.length > 0 ? challenges : defaultChallenges;
  const totalTokensEarnable = displayChallenges.reduce((sum, c) => sum + c.tokens, 0);
  const earnedTokens = displayChallenges
    .filter(c => c.completed && acceptedChallenges.includes(c.id))
    .reduce((sum, c) => sum + c.tokens, 0);

  const handleAccept = (challengeId) => {
    if (!acceptedChallenges.includes(challengeId)) {
      setAcceptedChallenges([...acceptedChallenges, challengeId]);
      onAcceptChallenge?.(challengeId);
    }
  };

  const handleClaimReward = (challengeId, tokens) => {
    if (!claimedRewards.includes(challengeId)) {
      setClaimedRewards([...claimedRewards, challengeId]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setTokenPulse((p) => p + 1);
      const c = displayChallenges.find((x) => x.id === challengeId);
      setClaimFx({ tokens, title: c?.title || "Challenge", id: challengeId });
      onClaimReward?.(challengeId, tokens);
    }
  };

  const progressToUnlock = Math.min((tokenBalance / tokensNeeded) * 100, 100);
  const isUnlocked = tokenBalance >= tokensNeeded;

  // Count unaccepted challenges
  const unacceptedChallenges = displayChallenges.filter(c => !acceptedChallenges.includes(c.id));
  const hasUnacceptedChallenges = unacceptedChallenges.length > 0;

  const handleAcceptAll = () => {
    const newAccepted = [...acceptedChallenges];
    displayChallenges.forEach(c => {
      if (!newAccepted.includes(c.id)) {
        newAccepted.push(c.id);
        onAcceptChallenge?.(c.id);
      }
    });
    setAcceptedChallenges(newAccepted);
  };

  return (
    <div className="space-y-4">
      {/* Header with Token Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 font-oxanium tracking-wide">
            <Trophy className="w-4 h-4 text-warning" />
            WEEKLY CHALLENGES
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
            Week: <span className="text-secondary">{weekRange}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Info: Accept from Spin Wheel */}
          {hasUnacceptedChallenges && (
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/40 text-warning text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
              <span>Accept from 🎰 Lucky Spin Wheel</span>
            </motion.div>
          )}
          
          {/* Token Counter */}
         <motion.div
            key={tokenPulse}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-warning/10 border border-warning/30"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 0.35 }}
          >
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <span className="text-xl font-bold text-warning">{tokenBalance}</span>
              <span className="text-warning/60 text-sm">/{tokensNeeded}</span>
            </div>
            <span className="text-[10px] text-warning/70 uppercase tracking-wider">Tokens</span>
          </motion.div>
        </div>
      </div>

      {/* Unlock Progress Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <Gift className="w-4 h-4 text-secondary" />
            Spin Wheel Unlock Progress
          </span>
          <span className="text-sm font-bold text-secondary">
            {isUnlocked ? "UNLOCKED!" : `${Math.round(progressToUnlock)}%`}
          </span>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isUnlocked 
                ? "bg-gradient-to-r from-success via-secondary to-success" 
                : "bg-gradient-to-r from-primary via-secondary to-accent"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressToUnlock}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ boxShadow: isUnlocked ? "0 0 15px hsl(var(--success) / 0.5)" : "0 0 10px hsl(var(--secondary) / 0.4)" }}
          />
        </div>
        {isUnlocked && (
          <motion.p 
            className="text-xs text-success mt-2 flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Sparkles className="w-3 h-3" />
            Congratulations! Your spin wheel is now unlocked!
          </motion.p>
        )}
      </div>

      {/* Challenges Grid - Compact */}
      <div className="grid gap-2">
      {displayChallenges.map((challenge, idx) => {
          const Icon = challenge.icon || Target;
          const isAccepted = acceptedChallenges.includes(challenge.id);
          const isClaimed = claimedRewards.includes(challenge.id);
          const canClaim = challenge.completed && isAccepted && !isClaimed;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative p-4 rounded-xl border transition-all duration-300",
                challenge.completed && isAccepted
                  ? "bg-success/10 border-success/40"
                  : isAccepted
                  ? "bg-card/80 border-primary/30 hover:border-primary/50"
                  : "bg-muted/30 border-border/50 hover:border-secondary/40"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  challenge.completed && isAccepted
                    ? "bg-success/20"
                    : isAccepted
                    ? "bg-primary/20"
                    : "bg-muted/50"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    challenge.completed && isAccepted
                      ? "text-success"
                      : isAccepted
                      ? "text-primary"
                      : "text-muted-foreground"
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground">{challenge.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-bold">
                      +{challenge.points} POINTS
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

                  {/* Progress */}
                  {isAccepted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Current: <span className="text-foreground font-medium">{challenge.currentValue}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Target: <span className="text-secondary font-medium">{challenge.target}</span>
                        </span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            challenge.completed
                              ? "bg-success"
                              : "bg-gradient-to-r from-primary to-secondary"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                        />
                      </div>
                      {challenge.daysRequired && (
                        <p className="text-[10px] text-muted-foreground">
                          Day {challenge.daysCompleted}/{challenge.daysRequired} completed
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {!isAccepted ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      <Lock className="w-4 h-4" />
                      Locked
                    </div>
                  ) : canClaim ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaimReward(challenge.id, challenge.tokens)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-success to-secondary text-success-foreground text-sm font-bold uppercase tracking-wider shadow-lg shadow-success/30"
                    >
                      Claim
                    </motion.button>
                  ) : isClaimed ? (
                    <span className="px-3 py-2 rounded-lg bg-success/20 text-success text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Claimed
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* Completion Checkmark Overlay */}
              {challenge.completed && isAccepted && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Token Earning Sources - Removed per Phase 1 updates */}

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <Portal>
            <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: -20,
                    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
                    opacity: 1,
                  }}
                  animate={{
                    y: (typeof window !== "undefined" ? window.innerHeight : 600) + 50,
                    rotate: Math.random() * 720,
                    opacity: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, delay: Math.random() * 0.3 }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ["hsl(var(--warning))", "hsl(var(--secondary))", "hsl(var(--success))"][i % 3],
                  }}
                />
              ))}
            </div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Claim Reward Cinematic Pop */}
      <AnimatePresence>
        {claimFx && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 18, scale: 0.92, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -18, scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 240 }}
                className="relative px-6 py-5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/60 shadow-[0_0_40px_hsl(var(--primary)/0.15)]"
              >
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: "radial-gradient(circle at 50% 30%, hsl(var(--warning) / 0.25) 0%, transparent 60%)" }}
                />

                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">REWARD CLAIMED</p>
                    <p className="text-base font-bold text-foreground">{claimFx.title}</p>
                    <p className="text-sm font-bold text-warning">+{claimFx.tokens} POINTS</p>
                  </div>
                </div>

                {/* Burst particles */}
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: i % 2 ? "hsl(var(--warning))" : "hsl(var(--secondary))" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                    animate={{
                      x: Math.cos((i / 18) * Math.PI * 2) * (55 + Math.random() * 18),
                      y: Math.sin((i / 18) * Math.PI * 2) * (55 + Math.random() * 18),
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeeklyChallenges;
