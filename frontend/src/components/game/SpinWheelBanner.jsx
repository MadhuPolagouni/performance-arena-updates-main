/**
 * Spin Wheel Banner Component
 * Top banner for lucky spin wheel with unlock progress and CTA
 */

import { motion } from "framer-motion";
import {
  Star,
  Zap,
  Lock,
  Gift,
  Trophy,
  Sparkles,
  ChevronRight,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SpinWheelBanner = ({ 
  isUnlocked = false,
  pointsEarned = 65,
  pointsNeeded = 100,
  nextSpinIn = null,
  onOpenWheel,
  onViewChallenges,
}) => {
  const progress = Math.min((pointsEarned / pointsNeeded) * 100, 100);
  const canUnlock = pointsEarned >= pointsNeeded;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl border overflow-hidden",
        isUnlocked
          ? "bg-gradient-to-r from-warning/20 via-accent/20 to-secondary/20 border-warning/40"
          : canUnlock
          ? "bg-gradient-to-r from-success/20 via-secondary/20 to-accent/20 border-success/40"
          : "bg-gradient-to-r from-primary/15 via-card to-secondary/15 border-primary/30"
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-24 h-24 rounded-full blur-3xl",
              isUnlocked ? "bg-warning/10" : "bg-primary/10"
            )}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 * i}%`,
              top: `${30 + 10 * (i % 3)}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Icon & Title */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "relative w-14 h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center",
              isUnlocked
                ? "bg-gradient-to-br from-warning to-accent shadow-lg shadow-warning/30"
                : canUnlock
                ? "bg-gradient-to-br from-success to-secondary shadow-lg shadow-success/30"
                : "bg-gradient-to-br from-primary/50 to-secondary/50"
            )}>
              {isUnlocked ? (
                <Star className="w-7 h-7 lg:w-8 lg:h-8 text-warning-foreground" />
              ) : canUnlock ? (
                <Zap className="w-7 h-7 lg:w-8 lg:h-8 text-success-foreground" />
              ) : (
                <Lock className="w-6 h-6 lg:w-7 lg:h-7 text-primary-foreground/70" />
              )}
              
              {/* Animated ring for unlocked state */}
              {isUnlocked && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-warning"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            <div>
              <h3 className="text-lg lg:text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                🎰 Lucky Spin Wheel
                {isUnlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-bold">
                    READY!
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isUnlocked
                  ? "Your wheel is ready! Spin to win amazing rewards!"
                  : canUnlock
                  ? "You've earned enough points! Unlock now!"
                  : `Earn ${pointsNeeded - pointsEarned} more points to unlock`
                }
              </p>
            </div>
          </div>

          {/* Center: Progress or Timer */}
          <div className="flex-1 max-w-xs hidden lg:block">
            {!isUnlocked && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-warning" />
                    Points Progress
                  </span>
                  <span className={cn(
                    "font-bold",
                    canUnlock ? "text-success" : "text-secondary"
                  )}>
                    {pointsEarned}/{pointsNeeded}
                  </span>
                </div>
                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      canUnlock
                        ? "bg-gradient-to-r from-success to-secondary"
                        : "bg-gradient-to-r from-primary to-secondary"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                    style={{
                      boxShadow: canUnlock
                        ? "0 0 10px hsl(var(--success) / 0.5)"
                        : "0 0 8px hsl(var(--primary) / 0.4)",
                    }}
                  />
                </div>
              </div>
            )}

            {isUnlocked && nextSpinIn && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border/50">
                <Timer className="w-4 h-4 text-secondary" />
                <span className="text-sm text-muted-foreground">Next spin in:</span>
                <span className="font-bold text-secondary">{nextSpinIn}</span>
              </div>
            )}
          </div>

          {/* Right: CTA Buttons */}
          <div className="flex items-center gap-3">
            {!isUnlocked && (
              <button
                onClick={onViewChallenges}
                className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View Challenges
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenWheel}
              disabled={!isUnlocked && !canUnlock}
              className={cn(
                "px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all",
                isUnlocked
                  ? "bg-gradient-to-r from-warning via-accent to-warning text-warning-foreground shadow-lg shadow-warning/30"
                  : canUnlock
                  ? "bg-gradient-to-r from-success to-secondary text-success-foreground shadow-lg shadow-success/30"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              )}
              style={isUnlocked || canUnlock ? {
                boxShadow: isUnlocked
                  ? "0 4px 20px hsl(var(--warning) / 0.4)"
                  : "0 4px 20px hsl(var(--success) / 0.4)",
              } : undefined}
            >
              {isUnlocked ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Spin Now!
                </>
              ) : canUnlock ? (
                <>
                  <Zap className="w-4 h-4" />
                  Unlock Wheel
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Locked
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        {!isUnlocked && (
          <div className="mt-4 lg:hidden">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                <Zap className="w-3 h-3 inline text-warning mr-1" />
                {pointsEarned}/{pointsNeeded} points
              </span>
              <span className={canUnlock ? "text-success font-bold" : "text-muted-foreground"}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  canUnlock
                    ? "bg-gradient-to-r from-success to-secondary"
                    : "bg-gradient-to-r from-primary to-secondary"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SpinWheelBanner;
