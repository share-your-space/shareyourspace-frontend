import React from 'react';
import Image from 'next/image';

const locations = [
  { name: 'London Innovation Hub', location: 'London', img: '/images/landing/london.png' },
  { name: 'NYC Tech Forward', location: 'New York', img: '/images/landing/new-york.png' },
  { name: 'SF Creative Assembly', location: 'San Francisco', img: '/images/landing/san-francisco.png' },
  { name: 'Berlin Green Desk', location: 'Berlin', img: '/images/landing/berlin.png' },
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
