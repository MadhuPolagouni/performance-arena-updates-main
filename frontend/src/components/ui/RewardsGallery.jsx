import React from 'react';

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
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {rewards.map((r) => (
        <div key={r.id} className="flex flex-col items-center p-3 rounded-lg bg-slate-900/30 border border-slate-700/20">
          <div className="w-20 h-20 mb-2 rounded-md bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center overflow-hidden">
            {images[r.key] ? (
              <img src={images[r.key]} alt={r.name} className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-muted-foreground">{r.name}</div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{r.name}</div>
        </div>
      ))}
    </div>
  );
};

export default RewardsGallery;
