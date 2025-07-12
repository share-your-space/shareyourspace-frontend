
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const DiscoverThingsToDo = () => {
  return (
    <section className="relative py-16 cursor-pointer">
      <div className="relative h-96 min-w-[300px]">
        <Image
          src="/placeholder-image.png"
          layout="fill"
          objectFit="cover"
          className="rounded-2xl"
          alt="Discover things to do"
        />
      </div>
      <div className="absolute top-32 left-12 text-white">
        <h3 className="text-4xl mb-3 w-64 font-semibold">Discover things to do</h3>
        <p className="max-w-xs">Find activities and workshops hosted by our partner companies.</p>
        <Button className="text-sm text-black bg-white px-4 py-2 rounded-lg mt-5 shadow-md font-semibold hover:shadow-xl active:scale-90 transition duration-150">
          Explore Now
        </Button>
      </div>
    </section>
  );
};

export default DiscoverThingsToDo;
