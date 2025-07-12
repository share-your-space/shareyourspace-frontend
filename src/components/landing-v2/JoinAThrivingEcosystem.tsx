import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const JoinAThrivingEcosystem = () => {
  return (
    <section className="relative py-16 cursor-pointer">
      <div className="relative h-96 min-w-[300px]">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          layout="fill"
          objectFit="cover"
          className="rounded-2xl"
          alt="Join a thriving ecosystem"
        />
      </div>
      <div className="absolute top-32 left-12 text-white">
        <h3 className="text-4xl mb-3 w-64 font-semibold">Join a Thriving Ecosystem</h3>
        <p className="max-w-xs">Become part of a network of innovators, creators, and collaborators.</p>
        <Button className="text-sm text-black bg-white px-4 py-2 rounded-lg mt-5 shadow-md font-semibold hover:shadow-xl active:scale-90 transition duration-150">
          Learn More
        </Button>
      </div>
    </section>
  );
};

export default JoinAThrivingEcosystem;
