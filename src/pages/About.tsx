import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Users, Award, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const galleryItems = [
  {
    image: '/images/aboutmain.jpg',
    title: 'Community of Athletes',
    text: 'Building a vibrant community of young athletes across Mewat region through structured sports programs.',
  },
  {
    image: '/images/aboutus.jpg',
    title: 'Excellence in Athletics',
    text: 'Our athletes have represented the region at state and national level competitions with outstanding achievements.',
  },
  {
    image: '/images/aboutus2.jpg',
    title: 'Celebrating Victories',
    text: 'Every tournament concludes with grand ceremonies recognizing the hard work and dedication of our participants.',
  },
];

const features = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To identify, nurture, and promote sporting talent across the Mewat region, providing world-class infrastructure and coaching to every aspiring athlete.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We believe sports unite communities. Our programs are designed to bring schools, families, and villages together through the spirit of healthy competition.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'From traditional wrestling to modern athletics, we maintain the highest standards of organization and fairness in every tournament we host.',
  },
  {
    icon: TrendingUp,
    title: 'Growth',
    description: 'Since inception, Khelo Mewat has grown from a small initiative to a region-wide movement, touching the lives of thousands of young athletes.',
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about-hero',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from('.about-hero h1', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' })
        .from('.about-hero p', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!galleryRef.current) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.about-gallery-item');

      items.forEach((item, index) => {
        const title = item.querySelector<HTMLHeadingElement>('.about-gallery-title span');
        const text = item.querySelector<HTMLElement>('.about-gallery-text');
        const inner = item.querySelector<HTMLElement>('.about-gallery-image-inner');

        if (!title || !text || !inner) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item as Element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.from(item as Element, { opacity: 0, ease: 'sine', duration: 0.8, delay: index * 0.05 })
          .from(inner, { scaleY: 0.6, scaleX: 1.8, ease: 'expo', duration: 1.5 }, 0)
          .from(title, { rotationX: 70, z: -500, opacity: 0, duration: 1.1, ease: 'expo' }, 0.2)
          .from(text, { xPercent: 20, opacity: 0, duration: 0.8, ease: 'power2' }, 0.5);
      });
    }, galleryRef.current);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from('.features-header', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from('.feature-card', { y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.4');
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={sectionRef}>
      {/* Hero */}
      <section className="about-hero relative min-h-[60vh] flex items-center justify-center bg-[#F7F2E9] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/images/banerbg.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/50 via-[#0A1628]/40 to-[#0A1628]/50" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-[#f37022] mb-4">
            About Khelo Mewat
          </h1>
          <p className="text-white text-lg font-inter">
            Building a legacy of sports excellence and physical education across the Mewat region.
          </p>
        </div>
      </section>

      {/* Main Content + Gallery */}
      <section className="py-16 lg:py-24 bg-[#F7F2E9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Story */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-[#f37022] mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-slate-700 font-inter leading-relaxed">
                <p>
                  Khelo Mewat was established with a vision to transform the sporting landscape of the Mewat region. 
                  Recognizing the immense talent and potential of young athletes in this area, the Government of Mewat 
                  Sports Authority launched this initiative to provide structured opportunities for physical development 
                  and competitive excellence.
                </p>
                <p>
                  Our programs span across traditional sports like wrestling (kushti) and kabaddi, alongside modern 
                  disciplines including cricket, volleyball, and athletics. We organize inter-school tournaments, 
                  district-level championships, and training camps throughout the year.
                </p>
                <p>
                  Since our inception, we have successfully engaged over 50 schools across 12 districts, registered 
                  more than 5,000 young athletes, and hosted over 25 major tournaments. Our alumni have gone on to 
                  represent Haryana at state and national level competitions.
                </p>
                <p>
                  Khelo Mewat is not just about competition — it is about building character, fostering teamwork, 
                  and creating a culture where sports are valued as an essential part of education and personal growth.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <img src="/images/logop.png" alt="Khelo Mewat" className="h-16 w-auto" />
                <div>
                  <div className="text-[#f37022] font-playfair font-bold text-lg">Khelo Mewat</div>
                  <div className="text-slate-500 text-sm font-inter">Government Sports Authority</div>
                </div>
              </div>
            </div>

            {/* Right: Gallery */}
            <div ref={galleryRef} className="lg:col-span-2 about-gallery-section">
              <div className="about-gallery-list grid grid-cols-1 sm:grid-cols-2 gap-6">
                {galleryItems.map((item, index) => (
                  <div key={index} className="about-gallery-item group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-playfair font-bold text-[#f37022] mb-3">
                        {item.title}
                      </h3>
                      <p className="about-gallery-text text-slate-600 text-sm font-inter leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section py-16 lg:py-24 bg-[#F7F2E9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="features-header text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-[#f37022] mb-3">
              What Drives Us
            </h2>
            <p className="text-slate-600 font-inter text-base max-w-2xl mx-auto">
              Our core values guide every tournament we organize and every athlete we support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card bg-white border border-slate-200 rounded-xl p-6 hover:border-[#f37022]/30 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#f37022]/10 rounded-lg shrink-0">
                    <feature.icon className="w-6 h-6 text-[#f37022]" />
                  </div>
                  <div>
                    <h3 className="text-white font-playfair font-bold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 font-inter text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
