import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown, ChevronUp, Award, Scale, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router';

gsap.registerPlugin(ScrollTrigger);

const sports = [
  {
    name: 'Cricket',
    description: 'The premier championship of Mewat. Elite 15-over matches designed to showcase top-tier regional cricket talent under strict standard playing conditions.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157479/cricket1_d9qbc6.jpg',
    players: '11 Active Players (Squad Size: 17)',
    details: {
      format: '15 Overs per Innings',
      squad: 'Maximum Squad Allocation: 17 Players | Playing XI: 11 Players',
      rules: [
        'Mandatory Powerplay restriction applies to the first 6 overs.',
        'Standard ICC compliance for Wide Balls, No Balls, and subsequent Free Hits.',
        'Tied fixtures will be definitively settled via an official Super Over.',
        'The On-Field Umpire’s decision remains absolute, final, and non-contestable.'
      ]
    }
  },
  {
    name: 'Football',
    description: 'The ultimate exhibition of strategic teamwork, spatial dominance, and athletic endurance on standard dimensions.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782374249/WhatsApp_Image_2026-06-24_at_8.39.24_PM_ws2dmb.jpg',
    players: '11 Active Players (Squad Size: 16)',
    details: {
      format: 'Full-Scale Tournament Format',
      squad: 'Maximum Squad Allocation: 16 Certified Players',
      rules: [
        'Governed entirely under current FIFA Statutory Regulations.',
        'Matching club-standard official sports kits/uniforms are mandatory.',
        'Match referee holds absolute authority regarding disciplinary cards.'
      ]
    }
  },
  {
    name: 'Volleyball',
    description: 'High-speed tactical sets calling for exceptional net coordination, precision spiking, and rigorous defensive discipline.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157492/volleyball1_sbabh6.jpg',
    players: '6 Active Players (Squad Size: 12)',
    details: {
      format: 'Best of 3 Sets Series',
      squad: 'Maximum Squad Allocation: 12 Players | 6 Active on Court',
      rules: [
        'Official toss dictates initial court orientation and service rights.',
        'Sets are played up to 25 rallying points (must win by a clear 2-point margin).',
        'FIVB official technical rules stand strictly applicable throughout.'
      ]
    }
  },
  
  {
    name: 'Kabaddi',
    description: 'Rooted in heritage, driven by raw power. A premier mat-surface competitive framework evaluating agility and breath management.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157494/Kabaddi_iaynpu.jpg',
    players: '7 Active Players (Squad Size: 12)',
    details: {
      format: 'Standard Professional Mat Specifications',
      squad: 'Maximum Squad Allocation: 12 Rostered Athletes',
      rules: [
        'Strict adherence to the Amateur Kabaddi Federation of India (AKFI) protocols.',
        'Official line-judges and referee decisions are legally binding on all franchises.',
        'Weight limits and regulations apply strictly at initial weigh-ins.'
      ]
    }
  },
  {
    name: 'Athletics',
    description: 'High-stakes track and field events benchmarking elite velocity, biomechanical precision, and explosive power.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157493/runner1_uwe5nf.jpg',
    players: 'Individual Matrix & Relay Fields',
    details: {
      format: 'Track & Field Technical Series',
      events: ['100m Sprint', '200m Sprint', '400m Sprint', '4 × 100m Relay Track', 'Long Jump Event', 'Shot Put Showcase'],
      rules: [
        'Athletes must report to the Marshalling Area 30 minutes before the official call room schedule.',
        'Lane violations or false starts will trigger instantaneous technical disqualification.',
        'Relay batons must be exchanged strictly within the designated 20-meter transition zone.'
      ]
    }
  },
  {
    name: 'Kho-Kho',
    description: 'A traditional pursuit of instantaneous reflexes, sudden directional changes, and high-intensity chasing sequences.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157497/KhoKho_nity9q.png',
    players: '9 Active Players (Squad Size: 12)',
    details: {
      format: 'Standard Inning System',
      squad: 'Maximum Squad Allocation: 12 Players',
      rules: [
        'Approved uniform compliance and standard protective equipment are mandatory.',
        'Governed strictly by the regulatory frameworks of the Kho-Kho Federation of India.'
      ]
    }
  },
  {
    name: 'Boxing',
    description: 'A structural bracket tournament emphasizing technical ring craftsmanship, targeted precision, and rigorous safety protocols.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157491/Boxing_wdnwak.jpg',
    players: 'Weight Classified Segregation',
    details: {
      format: 'Direct Knockout Elimination Bracket',
      categories: ['30–35 kg Divisions', '40–45 kg Divisions', '45–50 kg Divisions', '50–55 kg Divisions', '55–60 kg Divisions', '60–65 kg Divisions', 'Above 65 kg Heavyweight'],
      rules: [
        'All mandatory protective headguards, mouthguards, and wraps are strictly checked by technical officials.',
        'Tournament follows standard amateur rules with technical knockout evaluation standards.'
      ]
    }
  },
  {
    name: 'Judo',
    description: 'Leverage, balance, and tactical immobilization. Combative disciplines governed under professional martial art metrics.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157480/Judo_cvquo0.jpg',
    players: 'Gender/Weight Classified Brackets',
    details: {
      format: 'Official Judogi Weight Classes',
      boysCategories: ['35kg', '40kg', '45kg', '50kg', '55kg', '60kg', '66kg', 'Above 66kg'],
      girlsCategories: ['27kg', '32kg', '36kg', '40kg', '44kg', '48kg', '52kg', 'Above 52kg'],
      rules: [
        'Judogi compliance (thickness, sleeve length) checked thoroughly before tatami entry.',
        'Strictly supervised and arbitrated under Judo Federation of India technical rules.'
      ]
    }
  },
  {
    name: 'Badminton',
    description: 'Fast-paced court dominance. High-precision racket rallies tracking regional athletic supremacy.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157489/Badminton_xcuuzf.png',
    players: 'Max 2 Representatives per GP',
    details: {
      format: 'Singles / Doubles Knockout Tree',
      rules: [
        'Strict quota cap: Maximum 2 registered individual participants allowed per Gram Panchayat.',
        'Matches follow BWF scoring protocols up to standard point caps.'
      ]
    }
  },
  {
    name: 'Weightlifting',
    description: 'The definitive evaluation of human skeletal strength and dynamic extension across clean & jerk and snatch categories.',
    image: 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157488/WeightLifting_rmgkg4.jpg',
    players: 'Class-Based Weight Inclusions',
    details: {
      format: 'Olympic Lifting Standard Protocols',
      boysCategories: ['55kg', '60kg', '65kg', '70kg', '75kg', '85kg', '95kg', '110kg', 'Above 110kg'],
      girlsCategories: ['49kg', '53kg', '57kg', '61kg', '69kg', '77kg', '86kg', 'Above 86kg'],
      rules: [
        'All attempts must be executed using certified, calibrated weights and standard barbells.',
        'Platform technical adjudicators evaluate lockouts under International Weightlifting guidelines.'
      ]
    }
  }
];

function ShowcaseItem({ sport, index }: { sport: typeof sports[0]; index: number }) {
  const itemRef = useRef<HTMLLIElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!itemRef.current) return;

    const ctx = gsap.context(() => {
      const item = itemRef.current;
      if (!item) return;

      const image = item.querySelector('.showcase-image-wrap');
      const inner = item.querySelector('.showcase-image-inner');
      const content = item.querySelector('.showcase-content');

      if (!image || !inner || !content) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        image,
        { clipPath: 'inset(0% 50% 0% 50%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }
      )
        .fromTo(
          inner,
          { scale: 1.25 },
          { scale: 1, duration: 0.8, ease: 'power3.inOut' },
          0
        )
        .from(
          content,
          { x: index % 2 === 0 ? 30 : -30, opacity: 0, duration: 0.6, ease: 'power3.out' },
          0.3
        );
    }, itemRef.current);

    return () => ctx.revert();
  }, [index]);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) setIsExpanded(false);
  };

  const handleMobileClick = () => {
    if (window.innerWidth < 1024) setIsExpanded(!isExpanded);
  };

  const isReversed = index % 2 !== 0;

  return (
    <li 
      ref={itemRef} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center py-12 border-b border-slate-100 last:border-0 ${isReversed ? 'lg:flex-row-reverse' : ''}`}
    >
      {/* Media Box */}
      <div className="showcase-image-wrap w-full lg:w-[45%] h-[240px] sm:h-[340px] lg:h-[400px] overflow-hidden rounded-xl shadow-md relative group">
        <div
          className="showcase-image-inner w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${sport.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
      </div>

      {/* Narrative & Metrics */}
      <div className="showcase-content w-full lg:w-[55%] text-left">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-[#f37022]" />
          <span className="text-[#f37022] font-inter text-xs font-bold tracking-widest uppercase">
            {sport.players}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-slate-900 mb-3">
          {sport.name}
        </h3>
        <p className="text-slate-600 font-inter text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
          {sport.description}
        </p>

        {/* Dynamic Hybrid Rule Book Drawer */}
        <div 
          onClick={handleMobileClick}
          className={`border rounded-xl overflow-hidden bg-slate-50 border-slate-200 transition-all duration-300 ${
            window.innerWidth >= 1024 ? 'lg:cursor-default' : 'cursor-pointer hover:bg-slate-100/70'
          }`}
        >
          <div className="w-full flex items-center justify-between p-4 font-inter font-semibold text-slate-800 text-sm select-none">
            <span className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-500" /> 
              Official Statutory Rules & Categories
            </span>
            <div className="lg:hidden">
              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#f37022]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
            <span className="hidden lg:inline text-xs text-slate-400 font-normal italic">Autohovers on desktop</span>
          </div>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 pt-0 border-t border-slate-200/80 bg-white font-inter text-xs sm:text-sm text-slate-700 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div><span className="text-slate-400 font-medium">Format:</span> <span className="text-slate-900 font-medium">{sport.details.format}</span></div>
                  {sport.details.squad && <div><span className="text-slate-400 font-medium">Composition:</span> <span className="text-slate-900 font-medium">{sport.details.squad}</span></div>}
                </div>
                
                {sport.details.events && (
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1.5">Scheduled Events Matrix:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sport.details.events.map((ev) => (
                        <span key={ev} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">{ev}</span>
                      ))}
                    </div>
                  </div>
                )}

                {sport.details.categories && (
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1.5">Sanctioned Weight Classes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sport.details.categories.map((cat) => (
                        <span key={cat} className="bg-orange-50 text-[#f37022] font-semibold px-2 py-1 rounded-md text-xs border border-orange-100">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}

                {sport.details.boysCategories && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-blue-700 font-semibold text-xs block mb-1">Boys Divisions:</span>
                      <div className="flex flex-wrap gap-1">
                        {sport.details.boysCategories.map((cat) => (
                          <span key={cat} className="bg-blue-50/70 text-blue-800 px-1.5 py-0.5 rounded text-xs border border-blue-100">{cat}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-pink-700 font-semibold text-xs block mb-1">Girls Divisions:</span>
                      <div className="flex flex-wrap gap-1">
                        {sport.details.girlsCategories.map((cat) => (
                          <span key={cat} className="bg-pink-50/70 text-pink-800 px-1.5 py-0.5 rounded text-xs border border-pink-100">{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Regulatory Clauses:</span>
                  <ul className="list-inside list-decimal space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                    {sport.details.rules.map((rule, idx) => (
                      <li key={idx} className="marker:text-slate-400 marker:font-bold">{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-[#f37022] font-inter font-bold text-xs sm:text-sm hover:gap-2.5 transition-all mt-3"
        >
          Access Registration System <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </li>
  );
}

export default function SportsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.showcase-header', {
        scrollTrigger: {
          trigger: '.showcase-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="showcase-section py-20 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="showcase-header text-center mb-16 border-b border-slate-100 pb-10">
          <span className="text-[#f37022] font-inter text-xs font-extrabold tracking-widest uppercase block mb-2">
            Governance Framework & Guidelines
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-slate-900 tracking-tight mb-4">
            Khelo Mewat 2.0 Disciplines
          </h2>
          <p className="text-slate-500 font-inter text-sm sm:text-base lg:text-md max-w-2xl mx-auto leading-relaxed">
            Comprehensive catalog of official sporting fields, statutory criteria, financial dynamic brackets, and institutional compliance criteria.
          </p>
        </div>

        {/* Sports Matrix */}
        <ul className="divide-y divide-slate-100">
          {sports.map((sport, index) => (
            <ShowcaseItem key={sport.name} sport={sport} index={index} />
          ))}
        </ul>

        {/* --- Financial Reward Matrix --- */}
        <div className="mt-28 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#f37022]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-[#f37022]" />
              <div>
                <h3 className="text-2xl font-playfair font-bold tracking-tight text-white">
                  Official Financial Reward Matrix
                </h3>
                <p className="text-xs font-inter text-slate-400 mt-0.5">Approved allocations for authenticated final podium finishers.</p>
              </div>
            </div>
            <div className="text-xs font-inter uppercase tracking-widest text-[#f37022] font-bold bg-[#f37022]/10 border border-[#f37022]/20 px-3 py-1.5 rounded-md self-start md:self-auto">
              FY 2026 Sanctioned
            </div>
          </div>

          {/* Premium Financial Grid Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Tier Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <span className="text-xs font-inter font-bold text-[#f37022] tracking-wider uppercase block mb-4">
                Institutional & Team Disciplines
              </span>
              <div className="space-y-3.5 font-inter">
                <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border-l-4 border-amber-500">
                  <span className="text-sm font-medium text-slate-300">Winner (Gold Medal)</span>
                  <span className="font-mono text-lg font-bold text-white">INR 1,50,000</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border-l-4 border-slate-400">
                  <span className="text-sm font-medium text-slate-300">Runner-Up (Silver Medal)</span>
                  <span className="font-mono text-lg font-bold text-white">INR 1,00,000</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border-l-4 border-amber-700">
                  <span className="text-sm font-medium text-slate-300">Second Runner-Up (Bronze)</span>
                  <span className="font-mono text-lg font-bold text-white">INR 50,000</span>
                </div>
              </div>
            </div>

            {/* Individual Tier Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <span className="text-xs font-inter font-bold text-[#f37022] tracking-wider uppercase block mb-4">
                Individual Athletics & Combat Fields
              </span>
              <div className="space-y-3.5 font-inter">
                <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border-l-4 border-amber-500">
                  <span className="text-sm font-medium text-slate-300">Gold Medalist Allocation</span>
                  <span className="font-mono text-lg font-bold text-white">INR 7,100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border-l-4 border-slate-400">
                  <span className="text-sm font-medium text-slate-300">Silver Medalist Allocation</span>
                  <span className="font-mono text-lg font-bold text-white">INR 5,100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border-l-4 border-amber-700">
                  <span className="text-sm font-medium text-slate-300">Bronze Medalist Allocation</span>
                  <span className="font-mono text-lg font-bold text-white">INR 3,100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-[11px] font-inter text-slate-500 tracking-wide">
            *All financial disbursements are subject to direct institutional bank transfers and explicit statutory verification protocols.
          </div>
        </div>

        {/* --- Regulatory Framework --- */}
        <div className="mt-16 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
            <Scale className="w-6 h-6 text-slate-800" />
            <div>
              <h3 className="text-xl sm:text-2xl font-playfair font-bold text-slate-900">
                Statutory Code of Regulations
              </h3>
              <p className="text-xs font-inter text-slate-400 mt-0.5">Binding legal and organizational bylaws for Khelo Mewat 2.0.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter text-xs sm:text-sm text-slate-600 leading-relaxed">
            {[
              {
                title: "Jurisdictional & Domicile Eligibility",
                text: "All contesting athletes must satisfy the specific regional domicile and sector verification criteria established under the framework guidelines."
              },
              {
                title: "Identity Authentication Protocols",
                text: "Submission of authentic, government-approved identification artifacts (Aadhaar/Passport/Institutional Boards) is mandatory prior to physical badge accreditation."
              },
              {
                title: "Exclusivity of Athlete Representation",
                text: "Roster duplication is strictly prohibited. An individual athlete is restricted from representing multiple teams or independent factions within the same sport code."
              },
              {
                title: "Administrative Schedule Modifications",
                text: "The central Organizing Committee retains absolute structural authority to amend fixtures, adjust session timing matrices, or reallocate venues under unforeseen operational emergencies."
              },
              {
                title: "Disciplinary Infractions & Code Penalties",
                text: "Any proven instance of ethical misconduct, competitive manipulation, or structural insubordination will initiate direct and irreversible roster disqualification."
              },
              {
                title: "Finality of Arbitration & Technical Verdicts",
                text: "The operational rulings of certified match referees, umpires, and technical line judges remain ultimate, legally binding, and non-appealable under all situations."
              },
              {
                title: "Reporting Constraints & Forfeiture Terms",
                text: "Franchises must report to the technical registry exactly forty-five (45) minutes prior to slated play. Failure to comply results in automatic walkover awards."
              },
              {
                title: "Apparel Uniformity & Equipment Standards",
                text: "Adherence to regulation sports uniforms and certified defensive gear is strictly enforced. Non-compliance will bar the individual from stepping into competitive zones."
              }
            ].map((clause, index) => (
              <div key={index} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex gap-3.5 items-start">
                <div className="w-5 h-5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  0{index + 1}
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-xs sm:text-sm mb-1">{clause.title}</h4>
                  <p className="text-slate-600 text-xs leading-normal">{clause.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
