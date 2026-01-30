import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Target, Award } from 'lucide-react';

const ProductionReport = ({ mandays = 0, guidesProcessed = 0, period = 'This Month' }) => {
  const mantdaysPercentage = Math.min((mandays / 100) * 100, 100);
  const guidesPercentage = Math.min((guidesProcessed / 100) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl group"
    >
      {/* Complex Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-950 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 opacity-40" />
      
      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_25%,rgba(68,68,68,.2)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.2)_75%,rgba(68,68,68,.2))] bg-[length:60px_60px] animate-pulse" />
      </div>

      {/* Glow blur effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/20 to-secondary/30 rounded-2xl blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10" />

      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl border border-gradient-to-r from-primary/40 via-purple-400/20 to-secondary/40 pointer-events-none" />
      
      {/* Top accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 group-hover:via-primary/80 transition-all" />

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <BarChart3 className="w-5 h-5 text-primary" />
              </motion.div>
              <p className="text-xs text-primary/80 font-bold uppercase tracking-widest">Production Report</p>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-primary/80 to-secondary/80 bg-clip-text text-transparent">
              {period}
            </h2>
          </div>

          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-success/40 to-emerald-500/40 rounded-xl blur-lg" />
            <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/15 border border-success/40 hover:border-success/60 transition-colors backdrop-blur">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-success" />
              </motion.div>
              <span className="text-sm font-bold text-success">Excellent</span>
            </div>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mandays Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group/card"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="relative p-6 rounded-xl border border-primary/30 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/60 transition-all duration-300 overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-xl" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground/70 uppercase tracking-widest font-semibold">Mandays Completed</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-black text-primary">{mandays}</span>
                      <span className="text-lg text-muted-foreground font-bold">md</span>
                    </div>
                  </div>
                  <motion.div
                    className="p-4 rounded-lg bg-primary/20 border border-primary/40"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <Target className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>

                {/* Progress bar with animation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-bold text-primary">{Math.round(mantdaysPercentage)}%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-primary/20">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary via-primary/80 to-secondary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${mantdaysPercentage}%` }}
                      transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Mini stats */}
                <div className="flex gap-2 pt-2 border-t border-primary/20">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground/60">Target</p>
                    <p className="text-sm font-bold text-primary/80">100 md</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground/60">Remaining</p>
                    <p className="text-sm font-bold text-warning">{Math.max(0, 100 - mandays)} md</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guides Processed Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group/card"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="relative p-6 rounded-xl border border-secondary/30 backdrop-blur-xl bg-gradient-to-br from-secondary/10 to-secondary/5 hover:border-secondary/60 transition-all duration-300 overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-xl" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground/70 uppercase tracking-widest font-semibold">Guides Processed</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-black text-secondary">{guidesProcessed}</span>
                      <span className="text-lg text-muted-foreground font-bold">docs</span>
                    </div>
                  </div>
                  <motion.div
                    className="p-4 rounded-lg bg-secondary/20 border border-secondary/40"
                    whileHover={{ rotate: -10, scale: 1.1 }}
                  >
                    <Award className="w-6 h-6 text-secondary" />
                  </motion.div>
                </div>

                {/* Progress bar with animation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-bold text-secondary">{Math.round(guidesPercentage)}%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-secondary/20">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-secondary via-secondary/80 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(var(--secondary-rgb),0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${guidesPercentage}%` }}
                      transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Mini stats */}
                <div className="flex gap-2 pt-2 border-t border-secondary/20">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground/60">Target</p>
                    <p className="text-sm font-bold text-secondary/80">100 docs</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground/60">Remaining</p>
                    <p className="text-sm font-bold text-warning">{Math.max(0, 100 - guidesProcessed)} docs</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer with insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Production Insights</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your manday-based metrics guide resource allocation and performance benchmarking. Current trajectory shows strong progress toward monthly targets.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductionReport;
