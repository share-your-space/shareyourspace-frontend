import React from 'react';
import Image from 'next/image';

const locations = [
  { name: 'Pixida Innovation Hub', location: 'Munich', img: 'https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Tech Forward Ventures', location: 'Berlin', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Creative Assembly', location: 'Hamburg', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop' },
  { name: 'The Green Desk', location: 'Frankfurt', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop' },
];

const ExploreNearby = () => {
  return (
    <section className="pt-12">
      <h2 className="text-3xl font-semibold pb-5">Explore our hubs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {locations.map((item) => (
          <div key={item.name} className="flex items-center m-2 mt-5 space-x-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:scale-105 transition-transform duration-200 ease-out">
            <div className="relative h-16 w-16">
              <Image src={item.img} layout="fill" className="rounded-lg object-cover" alt={item.name} />
            </div>
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-500">{item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExploreNearby;
