import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { Trophy, ChevronRight, Download, FileText } from 'lucide-react';

const slideImages = ['/images/banerbg.jpg', '/images/banerbg2.jpg', '/images/banerbg3.jpg'];

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from('.hero-title', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' })
        .from('.hero-subtitle', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
        .from('.hero-cta', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .from('.hero-stats', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
        .from('.hero-download-bar', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
    }, contentRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideImages.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F7F2E9]">
      <div className="absolute inset-0">
        {slideImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Hero background ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${
              index === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-[#F7F2E9]/70" />
      <div className="absolute inset-0 bg-white/20" />

      {/* Content Container */}
      <div ref={contentRef} className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 hero-stats">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#f37022]" />
            <span className="text-[#f37022] font-inter text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Government of Mewat Sports Authority
            </span>
          </div>

          <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight mb-4 sm:mb-6">
            Empowering the Future of Sports in Mewat
          </h1>

          <p className="hero-subtitle text-slate-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-xl">
            Register your school for district-level championships, track events, and join the movement building the next generation of athletes.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Link
              to="/register"
              className="bg-[#f37022] text-[#0A1628] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center sm:justify-start gap-2 shadow-sm"
            >
              Register Now
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/sports"
              className="border-2 border-[#f37022] text-[#f37022] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold text-sm hover:bg-[#f37022] hover:text-[#0A1628] transition-all flex items-center justify-center shadow-sm"
            >
              View Tournaments
            </Link>
          </div>

          {/* Stats Section */}
          <div className="hero-stats grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-2xl mb-8 sm:mb-12">
            {[
              { value: '50+', label: 'Schools Registered' },
              { value: '12', label: 'Sports Categories' },
              { value: '5000+', label: 'Active Athletes' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-[#f37022]">{stat.value}</div>
                <div className="text-slate-600 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Added Natively: Quick Download Bar for PDFs */}
          <div className="hero-download-bar border-t border-slate-200/60 pt-6 max-w-xl">
            <div className="text-slate-800 text-xs font-bold font-inter mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#f37022]" /> Required Registration Documents:
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a 
                href="https://drive.google.com/file/d/1-bGXqtQPvixKyRYFqovw6ptiY5u4-tVY/view?usp=sharing" 
                download
                className="inline-flex items-center gap-1.5 bg-white hover:bg-orange-50/50 border border-slate-200 hover:border-[#f37022] text-slate-700 hover:text-[#f37022] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Participant Entry Form
              </a>
              <a 
                href="https://drive.google.com/file/d/1d7RT6YhCm0iaBf7yJS91M_WOJN0KQkWE/view?usp=sharing" 
                download
                className="inline-flex items-center gap-1.5 bg-white hover:bg-orange-50/50 border border-slate-200 hover:border-[#f37022] text-slate-700 hover:text-[#f37022] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Sarpanch Performa
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}