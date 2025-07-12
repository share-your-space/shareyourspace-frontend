
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[900px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/placeholder-image.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Find Your Next Workspace
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl">
          Discover unique office spaces shared by innovative companies. Collaborate, innovate, and grow your network.
        </p>
        <div className="w-full max-w-2xl">
          <div className="relative flex items-center bg-white rounded-full shadow-lg p-2">
            <Input
              type="text"
              placeholder="Search for spaces, companies, or locations"
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
