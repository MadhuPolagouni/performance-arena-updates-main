import React from 'react';
import RewardsGallery from '@/components/ui/RewardsGallery';

import cup from '@/assets/cup.png';
import cup1 from '@/assets/cup1.png';
import mysterybox from '@/assets/mysterybox.png';
import mysterybox1 from '@/assets/mysterybox1.png';
import techOrb from '@/assets/tech-data-orb.png';
import avatar1 from '@/assets/warrior-avatar-1.png';
import avatar2 from '@/assets/warrior-avatar-2.png';
import shield from '@/assets/shield.png';

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
  'sipper': cup1,
  'headset': avatar2,
  'bonus-xps': mysterybox,
  'bonus-points': techOrb,
  'coffee-mug': cup,
  't-shirt': avatar1,
  'cheers': mysterybox1,
  'laptop-bag': mysterybox,
  'hoodie': shield,
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
