/**
 * Enhanced 3D Spin Wheel Component
 * Features: Advanced 3D effects, depth shadows, particle system, premium animations
 * Used as modal popup in PlayZone page
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Zap, Crown, Box, Star, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Scene3D from "./Scene3D";
import FloatingBalloons from "./FloatingBalloons";
import { createPortal } from "react-dom";

/**
 * Backend Spin Wheel Prizes Configuration
 * Maps backend rewards to visual wheel segments with colors and icons
 */
const PRIZE_CONFIG = [
  { label: "+500", sublabel: "PTS", icon: Star, color: "#ff4d4d", points: 500, xp: 0, tone: "primary" },
  { label: "+100", sublabel: "XP", icon: Zap, color: "#4da6ff", points: 0, xp: 100, tone: "secondary" },
  { label: "x2", sublabel: "Multiplier", icon: Crown, color: "#ffcc00", points: 200, xp: 50, tone: "primary" },
  { label: "+250", sublabel: "PTS", icon: Star, color: "#ff66ff", points: 250, xp: 0, tone: "primary" },
  { label: "Mystery", sublabel: "Box", icon: Box, color: "#66ff66", points: 300, xp: 75, tone: "secondary" },
  { label: "x3", sublabel: "Multiplier", icon: Crown, color: "#ff9933", points: 400, xp: 100, tone: "primary" },
  { label: "+50", sublabel: "XP", icon: Zap, color: "#9b59fb", points: 0, xp: 50, tone: "secondary" },
  { label: "Elite", sublabel: "Gift", icon: Gift, color: "#2afcd5", points: 1000, xp: 200, tone: "accent" },
];

/**
 * Particle System Component for ambient effects
 */
const ParticleSystem = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 2 + Math.random() * 4,
    startX: Math.random() * 100,
    opacity: 0.3 + Math.random() * 0.4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.startX}%`,
            top: "-10px",
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, Math.random() * 100 - 50],
            opacity: [0, particle.opacity, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
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
  const [glowIntensity, setGlowIntensity] = useState(1);
  const wheelRef = useRef(null);
  const spinAudioRef = useRef(null);

  const canSpin = tokenBalance >= tokenCost && !isSpinning;
  const segmentCount = PRIZE_CONFIG.length;
  const segmentAngle = 360 / segmentCount;

  // Pulsing glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev === 1 ? 1.3 : 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Enhanced confetti effect with 3D particles
  const createConfetti = useCallback((count = 80) => {
    if (typeof window === 'undefined') return;
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      const size = 8 + Math.random() * 8;
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-20px';
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
      confetti.style.backgroundColor = color;
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.boxShadow = `0 0 ${size}px ${color}`;
      document.body.appendChild(confetti);
      
      const velocity = {
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
      };
      
      const fall = () => {
        let top = parseFloat(confetti.style.top);
        let left = parseFloat(confetti.style.left);
        
        top += velocity.y;
        left += velocity.x;
        velocity.y += 0.2; // gravity
        velocity.rotation += 5;
        
        confetti.style.top = top + 'px';
        confetti.style.left = left + 'px';
        confetti.style.transform = `rotate(${velocity.rotation}deg)`;
        confetti.style.opacity = Math.max(0, 1 - top / window.innerHeight);
        
        if (top < window.innerHeight) {
          requestAnimationFrame(fall);
        } else {
          confetti.remove();
        }
      };
      fall();
    }
  }, []);

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

      // Get winning segment index from backend
      const winningIndex = spinResult.segmentIndex ?? 0;
      
      // Validate segment index is within bounds
      if (winningIndex < 0 || winningIndex >= segmentCount) {
        throw new Error('Invalid segment index from server');
      }

      // Calculate rotation to land on winning segment
      const baseSpin = 6 + Math.floor(Math.random() * 3); // 6-9 full rotations
      const finalRotation = baseSpin * 360 + (segmentCount - 1 - winningIndex) * segmentAngle + segmentAngle / 2;

      setRotation(prevRotation => prevRotation + finalRotation);
      setSelectedIndex(winningIndex);

      // Play sound effect if available
      if (spinAudioRef.current) {
        spinAudioRef.current.currentTime = 0;
        spinAudioRef.current.play().catch(() => {}); // Ignore audio errors
      }

      // Wait for spin animation to complete (4 seconds)
      setTimeout(() => {
        // Map backend reward to visual prize config
        const backendReward = spinResult.reward;
        const visualPrize = PRIZE_CONFIG[winningIndex];
        
        // Merge backend reward data with visual prize data
        const mergedResult = {
          ...spinResult,
          prize: {
            ...visualPrize,
            // Override with backend data if available
            ...(backendReward && {
              label: backendReward.label,
              sublabel: backendReward.sublabel || '',
              points: backendReward.points || 0,
              xp: backendReward.xp || 0,
            })
          },
          winningIndex,
          backendRewardData: backendReward,
        };
        
        setResult(mergedResult);
        setShowResult(true);
        createConfetti(120);
      }, 4000); // Match spin duration

    } catch (err) {
      console.error('Spin error:', err);
      setError(err.message || 'Failed to spin wheel');
      setIsSpinning(false);
    }
  }, [canSpin, tokenCost, segmentCount, segmentAngle, onSpin, createConfetti]);

  // Handle claim reward
  const handleClaimReward = useCallback(async () => {
    if (!result || !result.prize) return;

    try {
      // Send the backend reward data for claiming
      const rewardData = result.backendRewardData || result.prize;
      const claimResult = await onClaimReward(rewardData);
      
      if (claimResult?.success) {
        onClaimSuccess?.();
        // Reset for next spin after a short delay to show success
        setTimeout(() => {
          setShowResult(false);
          setResult(null);
          setIsSpinning(false);
        }, 1500);
      } else {
        throw new Error(claimResult?.error?.message || 'Failed to claim reward');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim reward');
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
          {/* Enhanced Backdrop with particles */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ParticleSystem />
          </motion.div>

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-xl mx-4 p-6 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 100px rgba(147, 51, 234, 0.3)"
            }}
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3D Background */}
            <Scene3D />
            <FloatingBalloons side="left" />
            <FloatingBalloons side="right" />

            {/* Ambient glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center py-4">
              {/* Title with enhanced effects */}
              <motion.div className="text-center mb-4">
                <motion.h1
                  className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-2"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ 
                    fontFamily: "'Sora', sans-serif",
                    backgroundSize: '200% 200%',
                  }}
                >
                  ✨ Wheel of Fortune ✨
                </motion.h1>
                <motion.p 
                  className="text-white/90 text-sm md:text-base font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Spin to win amazing rewards! Cost: {tokenCost} Points
                </motion.p>
              </motion.div>

              {/* Enhanced Wheel Container with 3D perspective */}
              <div className="relative w-[320px] h-[320px] mb-6" style={{ perspective: '1000px' }}>
                
                {/* Outer glow ring */}
                <motion.div 
                  className="absolute -inset-8 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Decorative Rings with 3D effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-yellow-400/40 shadow-2xl"
                  style={{
                    boxShadow: '0 0 60px rgba(234, 179, 8, 0.6), inset 0 0 60px rgba(234, 179, 8, 0.2)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 60px rgba(234, 179, 8, 0.6), inset 0 0 60px rgba(234, 179, 8, 0.2)',
                      '0 0 80px rgba(234, 179, 8, 0.8), inset 0 0 80px rgba(234, 179, 8, 0.3)',
                      '0 0 60px rgba(234, 179, 8, 0.6), inset 0 0 60px rgba(234, 179, 8, 0.2)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute inset-3 rounded-full border-2 border-white/30 backdrop-blur-sm" />
                <div className="absolute inset-6 rounded-full border border-white/20" />

                {/* Enhanced Spin Pointer with 3D effect */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
                  <motion.div
                    className="relative"
                    animate={{ 
                      y: [0, -8, 0],
                      filter: [
                        'drop-shadow(0 4px 12px rgba(234, 179, 8, 0.8))',
                        'drop-shadow(0 8px 20px rgba(234, 179, 8, 1))',
                        'drop-shadow(0 4px 12px rgba(234, 179, 8, 0.8))',
                      ]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <div
                      className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400"
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.8))',
                      }}
                    />
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                </div>

                {/* Wheel Base Shadow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/50 blur-xl transform translate-y-8" />

                {/* Main Wheel with enhanced 3D effect */}
                <motion.div
                  ref={wheelRef}
                  className="absolute inset-0 rounded-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(0)',
                    boxShadow: `
                      0 30px 60px rgba(0,0,0,0.5),
                      inset 0 0 80px rgba(255,255,255,0.1),
                      0 0 100px rgba(147, 51, 234, 0.4)
                    `,
                  }}
                  animate={{ 
                    rotate: rotation,
                  }}
                  transition={{
                    duration: isSpinning ? 4 : 0,
                    ease: isSpinning ? [0.34, 1.56, 0.64, 1] : "linear",
                  }}
                >
                  {/* Wheel segments background */}
                  <div 
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{
                      background: `conic-gradient(${PRIZE_CONFIG.map((p, i) => 
                        `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
                      ).join(", ")})`,
                    }}
                  >
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 rounded-full shadow-inner" style={{
                      boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)',
                    }} />
                  </div>

                  {/* Segment dividers with glow */}
                  {PRIZE_CONFIG.map((_, index) => (
                    <div
                      key={`divider-${index}`}
                      className="absolute w-full h-full"
                      style={{
                        transform: `rotate(${index * segmentAngle}deg)`,
                      }}
                    >
                      <div className="absolute left-1/2 top-0 w-1 h-full bg-white/30 transform -translate-x-1/2" 
                           style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} 
                      />
                    </div>
                  ))}

                  {/* Prize labels with enhanced styling */}
                  {PRIZE_CONFIG.map((prize, index) => {
                    const angle = (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
                    const radius = 105;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const PrizeIcon = prize.icon;
                    
                    return (
                      <motion.div
                        key={index}
                        className="absolute"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${index * segmentAngle + 90}deg)`,
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="text-center">
                          <motion.div
                            className="text-white font-bold drop-shadow-lg"
                            animate={isSpinning ? {} : { scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                          >
                            <PrizeIcon className="w-5 h-5 mx-auto mb-0.5" style={{
                              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))',
                            }} />
                            <div className="text-xs font-black" style={{
                              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(255,255,255,0.3)',
                            }}>
                              {prize.label}
                            </div>
                            <div className="text-[8px] font-semibold opacity-90">
                              {prize.sublabel}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Enhanced Center Circle with 3D effect */}
                  <motion.div
                    className="absolute inset-[35%] rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 border-4 border-white/50"
                    style={{
                      boxShadow: `
                        0 10px 40px rgba(0,0,0,0.5),
                        inset 0 -5px 20px rgba(0,0,0,0.3),
                        inset 0 5px 20px rgba(255,255,255,0.5),
                        0 0 40px rgba(234, 179, 8, 0.6)
                      `,
                    }}
                    animate={{ 
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        '0 10px 40px rgba(0,0,0,0.5), inset 0 -5px 20px rgba(0,0,0,0.3), inset 0 5px 20px rgba(255,255,255,0.5), 0 0 40px rgba(234, 179, 8, 0.6)',
                        '0 10px 40px rgba(0,0,0,0.5), inset 0 -5px 20px rgba(0,0,0,0.3), inset 0 5px 20px rgba(255,255,255,0.5), 0 0 60px rgba(234, 179, 8, 0.9)',
                        '0 10px 40px rgba(0,0,0,0.5), inset 0 -5px 20px rgba(0,0,0,0.3), inset 0 5px 20px rgba(255,255,255,0.5), 0 0 40px rgba(234, 179, 8, 0.6)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Trophy className="w-8 h-8 text-white" style={{
                          filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))',
                        }} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Decorative dots around center */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const dotAngle = (i * 45) * (Math.PI / 180);
                    const dotRadius = 70;
                    const dotX = Math.cos(dotAngle) * dotRadius;
                    const dotY = Math.sin(dotAngle) * dotRadius;
                    
                    return (
                      <motion.div
                        key={`dot-${i}`}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))`,
                          boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    );
                  })}
                </motion.div>
              </div>

              {/* Enhanced Token Info */}
              <div className="flex gap-3 mb-6 justify-center flex-wrap">
                <motion.div
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400/40 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.8)' }}
                  style={{
                    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-white/70 text-[10px] font-medium mb-0.5">Available Balance</div>
                  <div className="text-white text-base font-bold">
                    <Sparkles className="inline w-4 h-4 mr-1 text-yellow-400" />
                    {tokenBalance} <span className="text-xs text-white/60">/ {tokenCost} pts</span>
                  </div>
                </motion.div>
                <motion.div
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.8)' }}
                  style={{
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-white/70 text-[10px] font-medium mb-0.5">Total Points</div>
                  <div className="text-white text-base font-bold">
                    <Star className="inline w-4 h-4 mr-1 text-yellow-400" />
                    {currentPoints}
                  </div>
                </motion.div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-4 px-4 py-2 rounded-xl bg-red-500/20 border-2 border-red-400/40 text-red-200 text-xs backdrop-blur-sm max-w-md"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Spin Button */}
              <motion.button
                onClick={handleSpin}
                disabled={!canSpin || isSpinning}
                className={cn(
                  "relative px-8 py-3 rounded-2xl font-bold text-base transition-all overflow-hidden",
                  canSpin && !isSpinning
                    ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl"
                    : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                )}
                style={canSpin && !isSpinning ? {
                  boxShadow: '0 10px 40px rgba(234, 179, 8, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
                } : {}}
                whileHover={canSpin && !isSpinning ? { 
                  scale: 1.05,
                  boxShadow: '0 15px 50px rgba(234, 179, 8, 0.8), inset 0 1px 0 rgba(255,255,255,0.3)',
                } : {}}
                whileTap={canSpin && !isSpinning ? { scale: 0.98 } : {}}
              >
                {/* Button glow effect */}
                {canSpin && !isSpinning && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-2">
                  {isSpinning ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.span>
                      SPINNING...
                    </>
                  ) : canSpin ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      SPIN NOW ({tokenCost} pts)
                    </>
                  ) : (
                    <>NOT ENOUGH POINTS</>
                  )}
                </span>
              </motion.button>

              {/* Result Modal with enhanced effects */}
              <AnimatePresence>
                {showResult && result && result.prize && (
                  <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Result backdrop */}
                    <motion.div
                      className="absolute inset-0 bg-black/80 backdrop-blur-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />

                    {/* Result card */}
                    <motion.div
                      className="relative p-6 rounded-3xl border-4 max-w-sm mx-4"
                      style={{
                        background: "linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)",
                        borderImage: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700) 1',
                        boxShadow: `
                          0 30px 90px rgba(0,0,0,0.6),
                          inset 0 1px 0 rgba(255,255,255,0.2),
                          0 0 100px rgba(255, 215, 0, 0.5)
                        `,
                      }}
                      initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                      exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                      transition={{ type: "spring", damping: 15 }}
                    >
                      {/* Celebratory particles */}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: [0, (Math.cos(i * 30 * Math.PI / 180) * 120)],
                            y: [0, (Math.sin(i * 30 * Math.PI / 180) * 120)],
                            opacity: [1, 0],
                            scale: [1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}

                      <motion.div
                        className="text-center relative z-10"
                      >
                        <motion.h2 
                          className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-4"
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🎉 CONGRATULATIONS! 🎉
                        </motion.h2>
                        
                        <motion.div 
                          className="mb-4"
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        >
                          {React.createElement(result.prize.icon, { 
                            className: "w-16 h-16 mx-auto",
                            style: { filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))' }
                          })}
                        </motion.div>
                        
                        <motion.h3 
                          className="text-2xl md:text-3xl font-black text-white mb-3"
                          style={{
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 8px rgba(0,0,0,0.5)',
                          }}
                        >
                          {result.prize.label} {result.prize.sublabel}
                        </motion.h3>
                        
                        <div className="text-white/90 mb-6 text-sm space-y-1">
                          {result.prize.points > 0 && (
                            <motion.p
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="font-bold"
                            >
                              <Star className="inline w-5 h-5 text-yellow-400 mr-2" />
                              + {result.prize.points} Points
                            </motion.p>
                          )}
                          {result.prize.xp > 0 && (
                            <motion.p
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="font-bold"
                            >
                              <Zap className="inline w-5 h-5 text-blue-400 mr-2" />
                              + {result.prize.xp} XP
                            </motion.p>
                          )}
                        </div>
                        
                        <motion.button
                          onClick={handleClaimReward}
                          className="px-8 py-3 rounded-2xl font-bold text-base bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl relative overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            boxShadow: '0 10px 40px rgba(234, 179, 8, 0.6)',
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="relative z-10 flex items-center gap-2">
                            <Gift className="w-5 h-5" />
                            CLAIM REWARD
                          </span>
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