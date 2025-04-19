'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the R3F component to avoid SSR issues
const HeroBackgroundAnimation = dynamic(() => import('@/components/landing/HeroBackgroundAnimation'), {
  ssr: false,
});

export default function HeroSection() {
  return (
    // Use min-h-screen, remove py padding, add flex for vertical centering
    <section className="relative w-full min-h-screen flex flex-col justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white">
      {/* Add the background animation component (now at z-index 0) */}
      <HeroBackgroundAnimation />

      {/* Content container (already centered horizontally with mx-auto) */}
      <div className="relative container mx-auto px-4 md:px-6 text-center z-10">
        <div className="max-w-3xl mx-auto">
          {/* Restore original text colors */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            Share Your Space, Spark Innovation.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Connect visionary corporates with dynamic startups & freelancers in curated, high-performance spaces. Unlock potential through meaningful collaboration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Restore original button styles */}
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Get Started</Link>
            </Button>
            {/* Apply hover state styles directly */}
            <Button asChild variant="outline" size="lg" className="border-white text-white bg-white/10">
              <Link href="#benefits">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}