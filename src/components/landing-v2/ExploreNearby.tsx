
import React from 'react';
import Image from 'next/image';

const locations = [
  { name: 'New York', distance: '1-hour drive', img: '/placeholder-image.png' },
  { name: 'San Francisco', distance: '45-minute drive', img: '/placeholder-image.png' },
  { name: 'London', distance: '2-hour drive', img: '/placeholder-image.png' },
  { name: 'Tokyo', distance: '3-hour drive', img: '/placeholder-image.png' },
  { name: 'Paris', distance: '1.5-hour drive', img: '/placeholder-image.png' },
  { name: 'Singapore', distance: '30-minute drive', img: '/placeholder-image.png' },
  { name: 'Berlin', distance: '2.5-hour drive', img: '/placeholder-image.png' },
  { name: 'Sydney', distance: '5-hour drive', img: '/placeholder-image.png' },
];

const ExploreNearby = () => {
  return (
    <section className="pt-12">
      <h2 className="text-3xl font-semibold pb-5">Explore nearby spaces</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {locations.map((item) => (
          <div key={item.name} className="flex items-center m-2 mt-5 space-x-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:scale-105 transition-transform duration-200 ease-out">
            <div className="relative h-16 w-16">
              <Image src={item.img} layout="fill" className="rounded-lg" alt={item.name} />
            </div>
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-500">{item.distance}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExploreNearby;
