import React from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { PromoBanner } from '../components/home/PromoBanner';
import { CollectionGrid } from '../components/home/CollectionGrid';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { LensShowcase } from '../components/home/LensShowcase';
import { EditorialStory } from '../components/home/EditorialStory';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <PromoBanner />
      <CollectionGrid />
      <FeaturedProducts />
      <LensShowcase />
      <EditorialStory />
    </div>
  );
};
