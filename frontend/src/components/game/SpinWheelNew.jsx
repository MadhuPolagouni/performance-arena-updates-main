/**
 * Enhanced Spin Wheel Component
 * Features: 3D background, animated balloons, token-based spinning, backend integration
 * Used as modal popup in PlayZone page
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Zap, Crown, Box, Star, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Scene3D from "./Scene3D";
import FloatingBalloons from "./FloatingBalloons";
import { createPortal } from "react-dom";

/**
 * Spin Wheel Prizes Configuration
 */
const PRIZE_CONFIG = [
  { label: "Cheers", value: "cheers", icon: Gift, color: "#ff4d4d", points: 500, xp: 25 },
  { label: "Headset", value: "headset", icon: Sparkles, color: "#4da6ff", points: 1000, xp: 50 },
  { label: "Coffee Mug", value: "coffee", icon: Star, color: "#ffcc00", points: 300, xp: 15 },
  { label: "WFH Perks", value: "wfh", icon: Crown, color: "#ff66ff", points: 750, xp: 35 },
  { label: "GD T-Shirt", value: "tshirt", icon: Box, color: "#66ff66", points: 250, xp: 10 },
  { label: "Sipper", value: "sipper", icon: Gift, color: "#ff9933", points: 400, xp: 20 },
  { label: "Lucky Dip", value: "lucky", icon: Trophy, color: "#9b59fb", points: 600, xp: 30 },
  { label: "Shopping Voucher", value: "voucher", icon: Zap, color: "#2afcd5", points: 800, xp: 40 },
];

/**
 * WheelPrize Component - Individual prize segment display
 */
const WheelPrize = ({ index, totalSegments, isSpinning, rotation, onSegmentHover }) => {
  const prize = PRIZE_CONFIG[index];
  const segmentAngle = 360 / totalSegments;
  const segmentRotation = index * segmentAngle;
  
  return (
    <motion.div
      className="absolute w-full h-full"
      style={{
        transform: `rotate(${segmentRotation}deg)`,
      }}
      onMouseEnter={() => onSegmentHover?.(index)}
    >
      <div className="absolute w-full h-full flex items-center justify-center" style={{
        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((Math.PI * segmentAngle) / 180)}% ${50 - 50 * Math.sin((Math.PI * segmentAngle) / 180)}%)`
      }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{
          background: `linear-gradient(135deg, ${prize.color}dd 0%, ${prize.color}99 100%)`,
          borderRadius: "50%",
        }}>
          <div className="text-white text-center font-bold text-xs" style={{
            transform: `rotate(-${segmentRotation}deg)`,
            filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"
          }}>
            <div className="text-lg mb-1">🎁</div>
            <div className="text-[10px] font-bold">{prize.label}</div>
            <div className="text-[8px] opacity-80">{prize.points}pts</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Main Spin Wheel Component
 */
export const SpinWheelComponent = ({ 
  isOpen, 
  onClose, 
  onSpin, 
  onClaimReward,
  tokenBalance = 0,
  tokenCost = 250,
  currentPoints = 0,
  onClaimSuccess = () => {},
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const wheelRef = useRef(null);
  const spinAudioRef = useRef(null);

  const canSpin = tokenBalance >= tokenCost && !isSpinning;
  const segmentCount = PRIZE_CONFIG.length;
  const segmentAngle = 360 / segmentCount;

  // Confetti effect
  const createConfetti = useCallback((count = 50) => {
    if (typeof window === 'undefined') return;
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = PRIZE_CONFIG[Math.floor(Math.random() * segmentCount)].color;
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      document.body.appendChild(confetti);
      
      const fall = () => {
        let top = parseFloat(confetti.style.top);
        top += Math.random() * 3 + 1;
        confetti.style.top = top + 'px';
        
        if (top < window.innerHeight) {
          requestAnimationFrame(fall);
        } else {
          confetti.remove();
        }
      };
      fall();
    }
  }, [segmentCount]);

  // Handle spin
  const handleSpin = useCallback(async () => {
    if (!canSpin) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    setError(null);

    try {
      // Call backend to spin
      const spinResult = await onSpin(tokenCost);
      
      if (!spinResult?.success) {
        throw new Error(spinResult?.error?.message || 'Spin failed');
      }

      // Get winning segment index
      const winningIndex = spinResult.segmentIndex ?? Math.floor(Math.random() * segmentCount);
      const baseSpin = 5 + Math.floor(Math.random() * 3); // 5-8 full rotations
      const finalRotation = baseSpin * 360 + (segmentCount - winningIndex) * segmentAngle;

      setRotation(prevRotation => prevRotation + finalRotation);
      setSelectedIndex(winningIndex);

      // Play sound effect if available
      if (spinAudioRef.current) {
        spinAudioRef.current.currentTime = 0;
        spinAudioRef.current.play().catch(() => {}); // Ignore audio errors
      }

      // Wait for spin animation to complete
      setTimeout(() => {
        const prize = PRIZE_CONFIG[winningIndex];
        setResult({
          ...spinResult,
          prize,
          winningIndex,
        });
        setShowResult(true);
        createConfetti(100);
      }, 3500); // Match spin duration

    } catch (err) {
      setError(err.message);
      setIsSpinning(false);
    }
  }, [canSpin, tokenCost, segmentCount, segmentAngle, onSpin, createConfetti]);

  // Handle claim reward
  const handleClaimReward = useCallback(async () => {
    if (!result || !result.prize) return;

    try {
      const claimResult = await onClaimReward(result.prize);
      if (claimResult?.success) {
        onClaimSuccess?.();
        // Reset for next spin
        setTimeout(() => {
          setShowResult(false);
          setResult(null);
          setIsSpinning(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [result, onClaimReward, onClaimSuccess]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-2xl mx-auto p-6 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3D Background */}
            <Scene3D />
            <FloatingBalloons side="left" />
            <FloatingBalloons side="right" />

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center py-8">
              {/* Title */}
              <motion.h1
                className="text-4xl font-bold text-white mb-2 text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                🎡 Whirl of Wins
              </motion.h1>
              <p className="text-white/80 mb-6 text-center">Spin to win amazing rewards! Cost: {tokenCost} Points</p>

              {/* Wheel Container */}
              <div className="relative w-80 h-80 mb-8">
                {/* Decorative Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/30 shadow-2xl" />
                <div className="absolute inset-2 rounded-full border-2 border-white/20" />

                {/* Spin Pointer */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <motion.div
                    className="w-6 h-6 bg-gradient-to-b from-white to-yellow-300 rounded-full shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    }}
                  />
                </div>

                {/* Wheel */}
                <motion.div
                  ref={wheelRef}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(" + 
                      PRIZE_CONFIG.map((p, i) => `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(", ") + 
                      ")",
                    filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))"
                  }}
                  animate={{ rotate: rotation }}
                  transition={{
                    duration: isSpinning ? 3.5 : 0,
                    ease: isSpinning ? "easeOut" : "linear",
                  }}
                >
                  {/* Segments with labels */}
                  {PRIZE_CONFIG.map((prize, index) => {
                    const angle = (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
                    const radius = 110;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <motion.div
                        key={index}
                        className="absolute text-center"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${index * segmentAngle}deg)`,
                          width: "80px",
                        }}
                      >
                        <div className="text-white font-bold text-xs drop-shadow-lg">
                          <div className="text-lg">🎁</div>
                          <div>{prize.label}</div>
                          <div className="text-[10px] opacity-90">{prize.points}pts</div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Center Circle */}
                  <motion.div
                    className="absolute inset-1/3 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 shadow-lg border-4 border-white/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🏆</div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Token Info */}
              <div className="flex gap-4 mb-6 justify-center">
                <motion.div
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="font-bold">{tokenBalance}</span> / {tokenCost} Points
                </motion.div>
                <motion.div
                  className="px-4 py-2 rounded-lg bg-success/20 border border-success/40 text-white text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  Total: <span className="font-bold">{currentPoints}</span>
                </motion.div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mb-4 px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Spin Button */}
              <motion.button
                onClick={handleSpin}
                disabled={!canSpin || isSpinning}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold text-lg transition-all",
                  canSpin && !isSpinning
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                )}
                whileHover={canSpin && !isSpinning ? { scale: 1.05 } : {}}
                whileTap={canSpin && !isSpinning ? { scale: 0.95 } : {}}
              >
                {isSpinning ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, linear: true }}
                      className="inline-block mr-2"
                    >
                      ⚡
                    </motion.span>
                    SPINNING...
                  </>
                ) : canSpin ? (
                  `SPIN NOW (${tokenCost} pts)`
                ) : (
                  `NOT ENOUGH POINTS`
                )}
              </motion.button>

              {/* Result Modal */}
              <AnimatePresence>
                {showResult && result && (
                  <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="relative p-8 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50"
                      style={{
                        background: "linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                      }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <motion.div
                        className="text-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <h2 className="text-4xl font-bold text-white mb-4">🎉 Congratulations!</h2>
                        <div className="text-6xl mb-4">{result.prize.icon === Gift ? '🎁' : '⭐'}</div>
                        <h3 className="text-3xl font-bold text-yellow-400 mb-2">{result.prize.label}</h3>
                        <p className="text-white/80 mb-6">You won {result.prize.points} points!</p>
                        
                        <motion.button
                          onClick={handleClaimReward}
                          className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          CLAIM REWARD
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SpinWheelComponent;
