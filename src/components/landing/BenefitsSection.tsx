'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Users, Building, Lightbulb } from 'lucide-react'; // Remove lucide imports
import Lottie from 'lottie-react';

// --- IMPORTANT --- 
// Ensure these files exist in the /public/animations/ directory.
// Using relative paths from src/components/landing to root/public/
import corporateAnimation from '../../../public/animations/corporate.json';
import usersAnimation from '../../../public/animations/users.json';
import ideaAnimation from '../../../public/animations/idea.json';
// --- IMPORTANT --- 

const benefitsData = [
  {
    title: "For Corporates / Space Providers",
    // icon: Building,
    lottieJson: corporateAnimation,
    points: [
      "Monetize underutilized office space.",
      "Gain access to innovative startups and talent.",
      "Foster a dynamic ecosystem within your walls.",
      "Enhance your corporate image as an innovation hub."
    ]
  },
  {
    title: "For Startups & Freelancers",
    // icon: Users,
    lottieJson: usersAnimation,
    points: [
      "Access premium office space at flexible terms.",
      "Connect with potential corporate partners and clients.",
      "Collaborate with like-minded innovators.",
      "Work in inspiring, high-performance environments."
    ]
  },
  {
    title: "Why ShareYourSpace 2.0?",
    // icon: Lightbulb,
    lottieJson: ideaAnimation,
    points: [
      "High-quality, curated matching based on deep compatibility.",
      "Optimized spaces designed for productivity and collaboration.",
      "Seamless communication and connection tools.",
      "Focus on building meaningful, synergistic relationships."
    ]
  }
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl md:text-5xl mb-12">
          Unlock Synergies, Fuel Growth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefitsData.map((benefit, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Lottie animationData={benefit.lottieJson} loop={true} style={{ width: 80, height: 80 }} />
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* <CardDescription className="mb-4">{benefit.description}</CardDescription> */}
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {benefit.points.map((point, pIndex) => (
                    <li key={pIndex}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 