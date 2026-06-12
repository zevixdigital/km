import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  { src: '/images/banerbg.jpg', title: 'Cricket Tournament Inauguration', category: 'Cricket' },
  { src: '/images/banerbg2.jpg', title: 'Team Championship Photo', category: 'Group' },
  { src: '/images/banerbg3.jpg', title: 'Sports Event Gathering', category: 'Group' },
  { src: '/images/banerbg4.jpg', title: 'Award Ceremony', category: 'Ceremony' },
  { src: '/images/aboutus2.jpg', title: 'Prize Distribution', category: 'Ceremony' },
  { src: '/images/volleyball.jpg', title: 'Volleyball Team', category: 'Volleyball' },
  { src: '/images/cricket.jpg', title: 'Cricket Team Photo', category: 'Cricket' },
  { src: '/images/runner.jpg', title: 'Champions with Trophy', category: 'Athletics' },
];

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.gallery-item');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.gallery-section',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from('.gallery-header', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from(items, {
          y: 60,
          opacity: 0,
          scale: 0.9,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        }, '-=0.4');
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="gallery-section py-12 sm:py-16 lg:py-24 bg-[#F7F2E9]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="gallery-header text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-[#f37022] mb-2 sm:mb-3">
            Moments from Our Events
          </h2>
          <p className="text-slate-700 font-inter text-sm sm:text-base max-w-2xl mx-auto">
            Glimpses of tournaments, celebrations, and the spirit of sportsmanship.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {galleryImages.map((img, index) => (
            <div
              key={index}
              className="gallery-item group relative aspect-square overflow-hidden rounded sm:rounded-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[#f37022] text-xs font-inter font-semibold uppercase tracking-wider">
                  {img.category}
                </span>
                <h4 className="text-white font-playfair font-bold text-xs sm:text-sm mt-1">
                  {img.title}
                </h4>
                <p className="text-white/80 text-xs mt-1 sm:mt-2">Click to zoom</p>
              </div>
            </div>
          ))}
        </div>

        {/* Zoom Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/40 text-white p-1.5 sm:p-2 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                  onClick={() => setIsZoomed(!isZoomed)}
                  style={{
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                    transition: 'transform 300ms ease-in-out'
                  }}
                />
                
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-black/60 text-white p-3 sm:p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="text-base sm:text-xl font-playfair font-bold mb-1 sm:mb-2">{selectedImage.title}</h3>
                  <p className="text-xs sm:text-sm text-white/80">{selectedImage.category}</p>
                  <p className="text-xs text-white/60 mt-1 sm:mt-2">
                    {isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
