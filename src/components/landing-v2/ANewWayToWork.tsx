import React from 'react';
import Image from 'next/image';

const cardData = [
  { img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1911&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Flexible Hot Desks' },
  { img: 'https://images.unsplash.com/photo-1521737852577-684897f092a3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Private Offices for Teams' },
  { img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Collaborative Project Spaces' },
  { img: 'https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Inspiring Meeting Rooms' },
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
