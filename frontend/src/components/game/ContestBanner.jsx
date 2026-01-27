/**
 * Contest Banner Component
 * Displays active contests as a popup/banner for agents
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Calendar, Clock, Users, ChevronRight, Zap, Star, Flame, Target, Rocket, Crown, Medal } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  flame: Flame,
  target: Target,
  rocket: Rocket,
  crown: Crown,
  medal: Medal,
};

const ContestBanner = ({ contest, onDismiss, autoHideDuration = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Calculate time remaining
  useEffect(() => {
    if (!contest?.endDate) return;

    const calculateTime = () => {
      const end = new Date(contest.endDate);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [contest?.endDate]);

  // Auto-hide after duration
  useEffect(() => {
    if (autoHideDuration > 0) {
      const timeout = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);
      return () => clearTimeout(timeout);
    }
  }, [autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (!contest) return null;

  const Icon = ICON_MAP[contest.contestIcon] || Trophy;
  const theme = contest.theme || {
    primary: "#8B5CF6",
    secondary: "#A855F7",
    accent: "#EC4899",
    backgroundColor: "#1a1a2e",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden border shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.primary}20 50%, ${theme.secondary}20 100%)`,
            borderColor: `${theme.primary}50`,
            boxShadow: `0 0 40px ${theme.primary}30`,
          }}
        >
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.primary} 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Animated Glow */}
          <motion.div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: theme.primary }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-5 flex items-center gap-5">
            {/* Icon */}
            <motion.div
              className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 0 20px ${theme.primary}50`,
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${theme.accent}30`,
                    color: theme.accent,
                  }}
                >
                  Live Contest
                </span>
              </div>

              <h3 className="text-lg font-bold text-white truncate mb-1">
                {contest.name}
              </h3>

              {contest.bannerText && (
                <p className="text-sm text-white/70 truncate mb-2">
                  {contest.bannerText}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Clock className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  <span>{timeRemaining}</span>
                </div>
                {contest.metrics?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Target className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
                    <span>{contest.metrics.length} Metrics</span>
                  </div>
                )}
                {contest.rewards?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Trophy className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                    <span>{contest.rewards.length} Prizes</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link to="/agent/play">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: "white",
                  boxShadow: `0 0 20px ${theme.primary}40`,
                }}
              >
                Join Now
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Progress Bar (if applicable) */}
          {contest.progress !== undefined && (
            <div className="relative z-10 px-5 pb-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${contest.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContestBanner;
