import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import photo1 from '@/assets/155fcbd7be132c2355179c87c4dd31f67e34d530.png';
import photo2 from '@/assets/b12612cf6d353a44814598f63a16fca6983f6eb8.png';

export function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);

    // Auto-play
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => {
      clearInterval(interval);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const photos = [photo1, photo2];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Carousel */}
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {photos.map((photo, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0">
                    <img
                      src={photo}
                      alt={`PlayLife mission ${index + 1}`}
                      className="w-full h-[500px] object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 py-4 bg-white">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${index === selectedIndex ? 'bg-[#e6244d] w-6' : 'bg-gray-300'
                    }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Text content */}
          <div>
            <h2 className="text-[#22081c] mb-6">
              Organiser une mission PlayLife simplement
            </h2>
            <p className="text-gray-600 mb-10 text-lg">
              Deux façons d'aider les enfants grâce au sport, partout dans le monde.
            </p>

            <div className="flex flex-col gap-4">
              <button className="px-8 py-3.5 bg-[#e6244d] text-white rounded-full hover:bg-[#d11d42] transition-colors shadow-md">
                Créer une mission
              </button>
              <button className="px-8 py-3.5 bg-white text-[#22081c] border-2 border-gray-200 rounded-full hover:border-[#e6244d] hover:text-[#e6244d] transition-all shadow-sm">
                Voir l'annuaire des structures
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}