import React from 'react';

const ProductionReport = ({ mandays = 0, guidesProcessed = 0, period = 'This Month' }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/30">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground font-semibold">PRODUCTION REPORT</p>
          <p className="text-2xl font-bold text-foreground">{period}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-primary">{mandays} md</p>
          <p className="text-sm text-muted-foreground">{guidesProcessed} guides</p>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Mandays basis production metrics for guides. Use this to plan staffing and performance reviews.</div>
    </div>
  );
};

export default ProductionReport;
