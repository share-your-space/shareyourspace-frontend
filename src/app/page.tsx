'use client';

import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';
import Hero from '@/components/landing-v2/Hero';
import ExploreNearby from '@/components/landing-v2/ExploreNearby';
import ANewWayToWork from '@/components/landing-v2/ANewWayToWork';
import JoinAThrivingEcosystem from '@/components/landing-v2/JoinAThrivingEcosystem';
import PageFooter from '@/components/landing-v2/PageFooter';
import ForPartners from '@/components/landing-v2/ForPartners';
import HowItWorks from '@/components/landing-v2/HowItWorks';
import PilotPartners from '@/components/landing-v2/PilotPartners';

export default function NewLandingPage() {
  return (
    <UnauthenticatedLayout>
      <main>
        <Hero />
        <PilotPartners />
        <ExploreNearby />
        <ANewWayToWork />
        <HowItWorks />
        <ForPartners />
        <JoinAThrivingEcosystem />
        <PageFooter />
      </main>
    </UnauthenticatedLayout>
  );
}
