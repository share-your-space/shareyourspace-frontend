import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative h-[600px] sm:h-[700px] lg:h-[800px] overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/landing/hero-poster.jpg"
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
        style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }}
      >
        <source src="/images/landing/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Find Your Next Collaboration
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-3xl">
          Tap into a curated network of innovative companies. Find more than a desk—find your next partner, project, or passion.
        </p>
        <div className="w-full max-w-2xl">
          <div className="relative flex items-center bg-white rounded-full shadow-lg p-2">
            <Input
              type="text"
              placeholder="Search for spaces, companies, or skills"
              className="flex-grow bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-500"
            />
            <Button
              type="submit"
              className="bg-primary text-white rounded-full p-3 ml-2"
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
