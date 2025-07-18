'use client';

import Image from "next/image";
import HeroSection from "@/components/landing/HeroSection";
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';
import nextDynamic from "next/dynamic";

const BenefitsSection = nextDynamic(() => import('@/components/landing/BenefitsSection'), { ssr: false });

export default function Home() {
  return (
    <UnauthenticatedLayout>
      <main className="flex flex-col items-center justify-between min-h-screen">
        <HeroSection />
        <div className="container mx-auto px-4 py-8 w-full">
           <BenefitsSection />
        </div>
      </main>
    </UnauthenticatedLayout>
  );
}
