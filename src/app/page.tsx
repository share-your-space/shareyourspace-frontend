'use client';

import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';
import Hero from '@/components/landing-v2/Hero';
import ExploreNearby from '@/components/landing-v2/ExploreNearby';
import LiveAnywhere from '@/components/landing-v2/LiveAnywhere';
import DiscoverThingsToDo from '@/components/landing-v2/DiscoverThingsToDo';
import PageFooter from '@/components/landing-v2/PageFooter';

export default function NewLandingPage() {
  return (
    <UnauthenticatedLayout>
      <main>
        <Hero />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ExploreNearby />
          <LiveAnywhere />
          <DiscoverThingsToDo />
        </div>
        <PageFooter />
      </main>
    </UnauthenticatedLayout>
  );
}
