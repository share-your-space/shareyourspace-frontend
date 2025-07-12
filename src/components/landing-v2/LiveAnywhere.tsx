
import React from 'react';
import Image from 'next/image';

const cardData = [
  { img: '/placeholder-image.png', title: 'Unique workspaces' },
  { img: '/placeholder-image.png', title: 'Spaces for teams' },
  { img: '/placeholder-image.png', title: 'Vibrant communities' },
  { img: '/placeholder-image.png', title: 'Flexible terms' },
];

const LiveAnywhere = () => {
  return (
    <section className="pt-12">
      <h2 className="text-3xl font-semibold pb-5">Work anywhere</h2>
      <div className="flex space-x-4 overflow-x-scroll p-4 -ml-4 scrollbar-hide">
        {cardData.map(({ img, title }) => (
          <div key={title} className="cursor-pointer hover:scale-105 transform transition duration-300 ease-out flex-shrink-0">
            <div className="relative h-80 w-80">
              <Image src={img} layout="fill" className="rounded-xl" alt={title} />
            </div>
            <h3 className="text-2xl mt-3 font-semibold">{title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveAnywhere;
