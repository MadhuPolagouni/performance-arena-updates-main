import React from 'react';
import { motion } from 'framer-motion';

const defaultRewards = [
  { id: 1, name: 'Sipper', key: 'sipper' },
  { id: 2, name: 'Headset', key: 'headset' },
  { id: 3, name: 'Bonus XPS', key: 'bonus-xps' },
  { id: 4, name: 'Bonus Points', key: 'bonus-points' },
  { id: 5, name: 'Coffee Mug', key: 'coffee-mug' },
  { id: 6, name: 'T-Shirt', key: 't-shirt' },
  { id: 7, name: 'Cheers', key: 'cheers' },
  { id: 8, name: 'Laptop Bag', key: 'laptop-bag' },
  { id: 9, name: 'Hoodie', key: 'hoodie' }
];

const RewardsGallery = ({ rewards = defaultRewards, images = {} }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
      {rewards.map((r, idx) => (
        <motion.div 
          key={r.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex flex-col items-center group"
        >
          {/* Image Container with rounded border */}
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative mb-6 rounded-2xl overflow-hidden border-2 border-primary/40 hover:border-primary/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-2"
          >
            {images[r.key] ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-900/30 h-full flex items-center justify-center min-h-[320px] w-[280px]">
                <img 
                  src={images[r.key]} 
                  alt={r.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg" 
                />
              </div>
            ) : (
              <div className="h-80 w-72 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground text-center px-4">{r.name}</span>
              </div>
            )}
            
            {/* Premium badge */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
              Premium
            </div>
          </motion.div>

          {/* Text label below image */}
          <motion.div 
            className="text-center"
            whileHover={{ y: -2 }}
          >
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
              {r.name}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                <span className="text-xs font-semibold text-primary">Reward Item</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default RewardsGallery;
