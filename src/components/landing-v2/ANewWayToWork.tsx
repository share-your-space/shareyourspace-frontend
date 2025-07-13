import React from 'react';
import Image from 'next/image';

const cardData = [
  { img: '/images/landing/hot-desks.jpg', title: 'Flexible Hot Desks' },
  { img: '/images/landing/private-offices.jpg', title: 'Private Offices for Teams' },
  { img: '/images/landing/project-spaces.jpg', title: 'Collaborative Project Spaces' },
  { img: '/images/landing/meeting-rooms.jpg', title: 'Inspiring Meeting Rooms' },
];

const ANewWayToWork = () => {
  return (
    <section className="pt-12">
      <h2 className="text-3xl font-semibold pb-5">A New Way to Work</h2>
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

export default ANewWayToWork;
