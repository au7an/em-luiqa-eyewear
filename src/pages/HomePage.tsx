import React, { useEffect } from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { PromoBanner } from '../components/home/PromoBanner';
import { CollectionGrid } from '../components/home/CollectionGrid';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { LensShowcase } from '../components/home/LensShowcase';
import { EditorialStory } from '../components/home/EditorialStory';
import { useHomepageLayoutStore } from '../store/useHomepageLayoutStore';
import { HomeSectionId } from '../types/database';

export const HomePage: React.FC = () => {
  const { layout, loadLayout } = useHomepageLayoutStore();

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const renderSection = (id: HomeSectionId) => {
    switch (id) {
      case 'promo_banner':
        return <PromoBanner key="promo_banner" />;
      case 'collection_grid':
        return <CollectionGrid key="collection_grid" />;
      case 'featured_products':
        return <FeaturedProducts key="featured_products" />;
      case 'lens_showcase':
        return <LensShowcase key="lens_showcase" />;
      case 'editorial_story':
        return <EditorialStory key="editorial_story" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Pinned Hero Carousel */}
      {layout.hero_enabled && <HeroCarousel />}

      {/* Dynamically Ordered and Toggled Sections */}
      {layout.sections
        .filter((section) => section.enabled)
        .map((section) => renderSection(section.id))}
    </div>
  );
};
