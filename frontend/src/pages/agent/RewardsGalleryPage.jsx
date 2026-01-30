import React from 'react';
import RewardsGallery from '@/components/ui/RewardsGallery';

import cheersPoints from '@/assets/rewardsimgs/cheers-points.png';
import coffeeMug from '@/assets/rewardsimgs/coffee-mug.png';
import headset from '@/assets/rewardsimgs/headset.png';
import hoodie from '@/assets/rewardsimgs/hoodie.png';
import laptopBag from '@/assets/rewardsimgs/laptop-bag.png';
import points from '@/assets/rewardsimgs/points.png';
import tShirt from '@/assets/rewardsimgs/t-shirt.png';
import xps from '@/assets/rewardsimgs/xps.png';

const sampleRewards = [
  { id: 'sipper', name: 'Sipper', key: 'sipper' },
  { id: 'headset', name: 'Headset', key: 'headset' },
  { id: 'bonus-xps', name: 'Bonus XPS', key: 'bonus-xps' },
  { id: 'bonus-points', name: 'Bonus Points', key: 'bonus-points' },
  { id: 'coffee-mug', name: 'Coffee Mug', key: 'coffee-mug' },
  { id: 't-shirt', name: 'T-Shirt', key: 't-shirt' },
  { id: 'cheers', name: 'Cheers', key: 'cheers' },
  { id: 'laptop-bag', name: 'Laptop Bag', key: 'laptop-bag' },
  { id: 'hoodie', name: 'Hoodie', key: 'hoodie' }
];

const images = {
  'sipper': coffeeMug,
  'headset': headset,
  'bonus-xps': xps,
  'bonus-points': points,
  'coffee-mug': coffeeMug,
  't-shirt': tShirt,
  'cheers': cheersPoints,
  'laptop-bag': laptopBag,
  'hoodie': hoodie,
};

const RewardsGalleryPage = () => {
  return (
    <div className="min-h-screen p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rewards Gallery</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse available rewards and images.</p>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border">
        <RewardsGallery rewards={sampleRewards} images={images} />
      </div>
    </div>
  );
};

export default RewardsGalleryPage;
