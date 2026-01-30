import React from 'react';
import RewardsGallery from '@/components/ui/RewardsGallery';

const RewardsGalleryPage = () => {
  return (
    <div className="min-h-screen p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rewards Gallery</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse available rewards and images.</p>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border">
        <RewardsGallery />
      </div>
    </div>
  );
};

export default RewardsGalleryPage;
