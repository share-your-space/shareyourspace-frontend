import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'

export function EmblaCarousel({ slides }: { slides: string[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container h-full">
        {slides.map((slideUrl, index) => (
          <div className="embla__slide flex items-center justify-center" key={index}>
            <Image src={slideUrl} alt={`Carousel image ${index + 1}`} layout="fill" objectFit="contain" />
          </div>
        ))}
      </div>
    </div>
  )
} 