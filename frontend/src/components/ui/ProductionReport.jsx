import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';

const ProductionReport = ({ mandays = 0, guidesProcessed = 0, period = 'This Month' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 via-slate-900/50 to-slate-950/40 border border-slate-700/40 group"
    >
      {/* Animated gradient overlay background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">PRODUCTION REPORT</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{period}</p>
          </div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20"
          >
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs font-semibold text-success">On Track</span>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Mandays Metric */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Mandays</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">{mandays}</span>
              <span className="text-xs text-muted-foreground">md</span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((mandays / 100) * 100, 100)}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>
          </motion.div>

          {/* Guides Processed Metric */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-3 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-colors"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Guides Processed</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-secondary">{guidesProcessed}</span>
              <span className="text-xs text-muted-foreground">docs</span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-secondary to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((guidesProcessed / 100) * 100, 100)}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Footer Description */}
        <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/20">
          Mandays-based production metrics guide staffing decisions and performance evaluations. Monitor trends to optimize resource allocation.
        </p>
      </div>
    </motion.div>
  );
};

export default ProductionReport;
