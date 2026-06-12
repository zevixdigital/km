import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 50, suffix: '+', label: 'Schools Participating' },
  { value: 12, suffix: '', label: 'Districts Covered' },
  { value: 5000, suffix: '+', label: 'Athletes Registered' },
  { value: 25, suffix: '+', label: 'Tournaments Hosted' },
];

function CounterItem({ stat }: { stat: typeof stats[0] }) {
  const [count, setCount] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const trigger = ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: stat.value,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            setCount(Math.floor(this.targets()[0].val));
          },
        });
      },
      once: true,
    });

    return () => { trigger.kill(); };
  }, [stat.value]);

  return (
    <div ref={itemRef} className="text-center">
      <div className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-playfair font-bold text-[#f37022] mb-1 sm:mb-2">
        {count}{stat.suffix}
      </div>
      <div className="text-slate-600 font-inter text-xs sm:text-sm uppercase tracking-wider">
        {stat.label}
      </div>
    </div>
  );
}

export default function ImpactCounter() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.impact-header',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from('.impact-header', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-24 bg-[#F7F2E9] border-y border-slate-200">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="impact-header text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-[#f37022] mb-2 sm:mb-3">
            Impact of Khelo Mewat
          </h2>
          <p className="text-slate-700 font-inter text-sm sm:text-base max-w-2xl mx-auto">
            Our initiatives have transformed the sporting landscape across the Mewat region.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
          {stats.map((stat) => (
            <CounterItem key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
