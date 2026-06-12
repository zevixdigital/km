import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router';
import { Users, Calendar, Trophy, ArrowRight, ChevronDown, ChevronUp, Scale, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const sports = [
  {
    name: 'Cricket',
    tagline: "The Gentleman's Game",
    description: 'The premium championship of Mewat. High-octane 15-over matches designed to showcase top-tier regional cricket talent under strict standard playing compliance.',
    image: '/images/cricket1.jpg',
    teamSize: '11 Active Players (Squad: 17)',
    tournaments: '15 Overs per Side',
    registrationOpen: true,
    details: {
      squad: 'Maximum Squad Allocation: 17 Players | Playing XI: 11 Players',
      rules: [
        'Mandatory Powerplay restriction applies to the first 6 overs.',
        'Standard compliance for Wide Balls, No Balls, and subsequent Free Hits.',
        'Tied fixtures will be definitively settled via an official Super Over.',
        'The On-Field Umpire’s decision remains absolute, final, and non-contestable.'
      ]
    }
  },
  {
    name: 'Football',
    tagline: 'The Beautiful Game',
    description: 'The ultimate exhibition of strategic teamwork, spatial dominance, and athletic endurance on standard tournament-grade pitches.',
    image: '/images/football1.jpg',
    teamSize: '11 Active Players (Squad: 16)',
    tournaments: 'Standard Match Format',
    registrationOpen: true,
    details: {
      squad: 'Maximum Squad Allocation: 16 Certified Players',
      rules: [
        'Governed entirely under current standard Football Statutory Regulations.',
        'Matching club-standard official sports kits/uniforms are mandatory.',
        'Match referee holds absolute authority regarding structural disciplinary cards.'
      ]
    }
  },
  {
    name: 'Volleyball',
    tagline: 'Rise and Spike',
    description: 'Fast-paced tactical sets calling for exceptional net coordination, precision spiking, and rigorous defensive discipline.',
    image: '/images/volleyball1.jpg',
    teamSize: '6 Active Players (Squad: 12)',
    tournaments: 'Best of 3 Sets Series',
    registrationOpen: true,
    details: {
      squad: 'Maximum Squad Allocation: 12 Players | 6 Active on Court',
      rules: [
        'Official toss dictates initial court orientation and service rights.',
        'Sets are played up to 25 rallying points (must win by a clear 2-point margin).',
        'Official technical volleyball rules stand strictly applicable throughout.'
      ]
    }
  },
  {
    name: 'Kabaddi',
    tagline: 'Strength Meets Tradition',
    description: 'Rooted in heritage, driven by raw power. A premier mat-surface competitive framework evaluating agility and team coordination.',
    image: '/images/kabaddi1.jpg',
    teamSize: '7 Active Players (Squad: 12)',
    tournaments: 'Standard Mat Specifications',
    registrationOpen: true,
    details: {
      squad: 'Maximum Squad Allocation: 12 Rostered Athletes',
      rules: [
        'Strict adherence to standard professional Kabaddi protocols.',
        'Official line-judges and referee decisions are legally binding on all units.',
        'Weight limits and regulations apply strictly at initial weigh-ins.'
      ]
    }
  },
  {
    name: 'Athletics',
    tagline: 'Faster, Higher, Stronger',
    description: 'High-stakes track and field events benchmarking elite velocity, biomechanical precision, and explosive power.',
    image: '/images/runner1.jpg',
    teamSize: 'Individual & Relay Fields',
    tournaments: 'Track & Field Series',
    registrationOpen: true,
    details: {
      events: ['100m Sprint', '200m Sprint', '400m Sprint', '4×100m Relay Track', 'Long Jump', 'Shot Put'],
      rules: [
        'Athletes must report to the Marshalling Area before the official event start.',
        'Lane violations or false starts will trigger instantaneous technical disqualification.',
        'Relay batons must be exchanged strictly within the designated transition zone.'
      ]
    }
  },
  {
    name: 'Kho-Kho',
    tagline: 'Speed and Strategy',
    description: 'A traditional pursuit of instantaneous reflexes, sudden directional changes, and high-intensity chasing sequences.',
    image: '/images/khokho1.jpg',
    teamSize: '9 Active Players (Squad: 12)',
    tournaments: 'Standard Inning System',
    registrationOpen: true,
    details: {
      squad: 'Maximum Squad Allocation: 12 Rostered Players',
      rules: [
        'Approved uniform compliance and proper sports dress are mandatory.',
        'Governed strictly by standard Kho-Kho Federation regulatory frameworks.'
      ]
    }
  },
  {
    name: 'Boxing',
    tagline: 'Pound for Pound',
    description: 'A structural bracket tournament emphasizing technical ring craftsmanship, targeted precision, and rigorous safety protocols.',
    image: '/images/boxing1.jpg',
    teamSize: 'Weight Classified Segregation',
    tournaments: 'Knockout Tournament Tree',
    registrationOpen: true,
    details: {
      categories: ['30–35 kg', '40–45 kg', '45–50 kg', '50–55 kg', '55–60 kg', '60–65 kg', 'Above 65 kg'],
      rules: [
        'All mandatory protective equipment and wraps are strictly monitored before entry.',
        'Tournament structure runs on direct knockout elimination mechanics.'
      ]
    }
  },
  {
    name: 'Judo',
    tagline: 'The Gentle Way',
    description: 'Leverage, balance, and tactical immobilization. Combative disciplines split perfectly by weight limits and gender classes.',
    image: '/images/judo1.jpg',
    teamSize: 'Gender Classified Brackets',
    tournaments: 'Direct Elimination Pools',
    registrationOpen: true,
    details: {
      boysCategories: ['35kg', '40kg', '45kg', '50kg', '55kg', '60kg', '66kg', 'Above 66kg'],
      girlsCategories: ['27kg', '32kg', '36kg', '40kg', '44kg', '48kg', '52kg', 'Above 52kg'],
      rules: [
        'Official Federation rules apply thoroughly across all point assessments.',
        'The decision of the designated pool referee is final and binding.'
      ]
    }
  },
  {
    name: 'Badminton',
    tagline: 'Precision and Pace',
    description: 'Fast-paced court dominance. High-precision racket rallies tracking Gram Panchayat athletic supremacy.',
    image: '/images/badminton1.jpg',
    teamSize: 'Max 2 Reps per GP',
    tournaments: 'Singles/Doubles Bracket',
    registrationOpen: true,
    details: {
      rules: [
        'Strict quota cap: Maximum 2 registered individual participants allowed per Gram Panchayat.',
        'Standard Badminton Federation rules and scoring guidelines stand applicable.'
      ]
    }
  },
  {
    name: 'Weightlifting',
    tagline: 'Pure Power',
    description: 'The definitive evaluation of human skeletal strength and dynamic extension across standard clean & jerk and snatch categories.',
    image: '/images/weightlifting1.jpg',
    teamSize: 'Weight Classified Tiers',
    tournaments: 'Calibrated Platform Series',
    registrationOpen: true,
    details: {
      boysCategories: ['55kg', '60kg', '65kg', '70kg', '75kg', '85kg', '95kg', '110kg', 'Above 110kg'],
      girlsCategories: ['49kg', '53kg', '57kg', '61kg', '69kg', '77kg', '86kg', 'Above 86kg'],
      rules: [
        'Official Weightlifting Rules apply strictly to all weight declarations.',
        'Certified, calibrated equipment and standard platforms will be deployed.'
      ]
    }
  }
];

function SportCard({ sport, index }: { sport: typeof sports[0]; index: number }) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div
      className={`sport-card bg-white border border-slate-200 rounded-2xl overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-md ${
        index % 2 === 0 ? '' : 'md:[direction:rtl]'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image Grid Box */}
        <div className={`relative h-64 md:h-auto overflow-hidden ${index % 2 === 0 ? '' : 'md:[direction:ltr]'}`}>
          <img
            src={sport.image}
            alt={sport.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 hidden md:block" />
        </div>
        
        {/* Content Box */}
        <div className={`p-6 sm:p-8 lg:p-10 text-left ${index % 2 === 0 ? '' : 'md:[direction:ltr]'}`}>
          <span className="text-[#f37022] font-inter text-xs font-semibold uppercase tracking-wider">
            {sport.tagline}
          </span>
          <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-slate-900 mt-1 mb-4">
            {sport.name}
          </h2>
          <p className="text-slate-600 font-inter text-sm leading-relaxed mb-6">
            {sport.description}
          </p>

          {/* Icon Attributes Badge Grid */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-inter bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-[#f37022]" />
              {sport.teamSize}
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-inter bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-[#f37022]" />
              {sport.tournaments}
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-inter bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
              <Trophy className="w-4 h-4 text-[#f37022]" />
              {sport.registrationOpen ? 'Registration Active' : 'Closed'}
            </div>
          </div>

          {/* Interactive Drawers: Auto-Expand on Desktop Hover | Click on Mobile */}
          <div 
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="mb-6 bg-slate-50/80 border border-slate-200/80 rounded-xl overflow-hidden cursor-pointer lg:cursor-default"
          >
            <div className="flex justify-between items-center p-3.5 bg-slate-100/60 font-inter text-xs sm:text-sm font-bold text-slate-800 select-none">
              <span className="flex items-center gap-1.5">📋 View Official Rules & Categories</span>
              <div className="lg:hidden">
                {mobileExpanded ? <ChevronUp className="w-4 h-4 text-[#f37022]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              <span className="hidden lg:inline text-[11px] font-normal text-slate-400 italic">Auto-hovers to view</span>
            </div>

            {/* Core Transition Wrapper */}
            <div className={`grid transition-all duration-300 ease-in-out ${
              mobileExpanded 
                ? 'grid-rows-[1fr] opacity-100' 
                : 'grid-rows-[0fr] opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100'
            }`}>
              <div className="overflow-hidden">
                <div className="p-4 bg-white font-inter text-xs sm:text-sm text-slate-700 space-y-3.5 border-t border-slate-200/60">
                  {sport.details.squad && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wide">Roster Specifications</span>
                      <p className="text-slate-900 font-semibold mt-0.5">{sport.details.squad}</p>
                    </div>
                  )}

                  {sport.details.events && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wide mb-1.5">Events Matrix</span>
                      <div className="flex flex-wrap gap-1">
                        {sport.details.events.map(ev => (
                          <span key={ev} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200">{ev}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sport.details.categories && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wide mb-1.5">Sanctioned Classes</span>
                      <div className="flex flex-wrap gap-1">
                        {sport.details.categories.map(cat => (
                          <span key={cat} className="bg-orange-50 text-[#f37022] font-semibold px-2 py-0.5 rounded text-xs border border-orange-100">{cat}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sport.details.boysCategories && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-blue-600 font-medium block text-[11px] uppercase tracking-wide mb-1">Boys Divisions</span>
                        <div className="flex flex-wrap gap-1">
                          {sport.details.boysCategories.map(cat => (
                            <span key={cat} className="bg-blue-50/60 text-blue-800 px-1.5 py-0.5 rounded text-[11px] border border-blue-100">{cat}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-pink-600 font-medium block text-[11px] uppercase tracking-wide mb-1">Girls Divisions</span>
                        <div className="flex flex-wrap gap-1">
                          {sport.details.girlsCategories.map(cat => (
                            <span key={cat} className="bg-pink-50/60 text-pink-800 px-1.5 py-0.5 rounded text-[11px] border border-pink-100">{cat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wide mb-1">Regulatory Clauses</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs leading-relaxed">
                      {sport.details.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#f37022] text-white px-6 py-2.5 rounded-full font-inter font-bold text-sm shadow-sm transition-transform hover:bg-[#e26212] active:scale-95"
          >
            Register for {sport.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Sports() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.sport-card');
      cards.forEach((card) => {
        gsap.from(card as Element, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={sectionRef} className="bg-[#F7F2E9]">
      {/* Hero Header */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src="/images/banerbg2.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-[#F7F2E9]" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 mt-8">
          <span className="text-[#f37022] font-inter text-xs font-extrabold tracking-widest uppercase block mb-1">
            🏆 Khelo Mewat 2.0
          </span>
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-slate-900 mb-4 tracking-tight">
            Sports Categories & Rules
          </h1>
          <p className="text-slate-600 text-base sm:text-lg font-inter leading-relaxed">
            Discover the comprehensive range of sporting fields, framework benchmarks, weight category pools, and official regulatory directives organized under the committee.
          </p>
        </div>
      </section>

      {/* Sports Matrix Render Block */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {sports.map((sport, index) => (
            <SportCard key={sport.name} sport={sport} index={index} />
          ))}
        </div>
      </section>

      {/* --- Premium Financial Reward Matrix (Official Prize Structure Restyled) --- */}
      <section className="py-12 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-[#f37022]" />
              <div>
                <h3 className="text-2xl font-playfair font-bold text-white tracking-tight">
                  Official Financial Reward Matrix
                </h3>
                <p className="text-xs font-inter text-slate-400 mt-0.5">Approved allocations for authenticated final podium finishers.</p>
              </div>
            </div>
            <div className="text-[10px] font-inter uppercase tracking-widest text-[#f37022] font-bold bg-[#f37022]/10 border border-[#f37022]/20 px-3 py-1.5 rounded-md">
              Sanctioned Brackets
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Tier Card */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <span className="text-xs font-inter font-bold text-[#f37022] tracking-wider uppercase block mb-4">
                Institutional & Team Disciplines
              </span>
              <div className="space-y-3 font-inter">
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border-l-4 border-amber-500">
                  <span className="text-xs sm:text-sm text-slate-300">Winner (Gold Medal)</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">₹1,50,000</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border-l-4 border-slate-400">
                  <span className="text-xs sm:text-sm text-slate-300">Runner-Up (Silver Medal)</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">₹1,00,000</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border-l-4 border-amber-700">
                  <span className="text-xs sm:text-sm text-slate-300">Second Runner-Up (Bronze)</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">₹50,000</span>
                </div>
              </div>
            </div>

            {/* Individual Tier Card */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <span className="text-xs font-inter font-bold text-[#f37022] tracking-wider uppercase block mb-4">
                Individual Athletics & Combat Fields
              </span>
              <div className="space-y-3 font-inter">
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border-l-4 border-amber-500">
                  <span className="text-xs sm:text-sm text-slate-300">Gold Medalist Allocation</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">₹7,100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border-l-4 border-slate-400">
                  <span className="text-xs sm:text-sm text-slate-300">Silver Medalist Allocation</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">₹5,100</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border-l-4 border-amber-700">
                  <span className="text-xs sm:text-sm text-slate-300">Bronze Medalist Allocation</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">₹3,100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-[10px] font-inter text-slate-500 tracking-wide">
            *All financial disbursements are subject to direct institutional bank transfers and explicit statutory verification protocols.
          </div>
        </div>
      </section>

      {/* --- Regulatory Framework (General Terms & Conditions Redrafted) --- */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
            <Scale className="w-6 h-6 text-slate-800" />
            <div>
              <h3 className="text-xl sm:text-2xl font-playfair font-bold text-slate-900">
                Statutory Code of Regulations
              </h3>
              <p className="text-xs font-inter text-slate-400 mt-0.5">Binding regulatory and organizational bylaws for Khelo Mewat 2.0.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-inter text-xs sm:text-sm text-slate-600 leading-relaxed">
            {[
              {
                title: "Jurisdictional & Domicile Eligibility",
                text: "All contesting athletes must completely satisfy the specific regional domicile and age-group verification parameters established under the current framework guidelines."
              },
              {
                title: "Identity Authentication Protocols",
                text: "Submission of authentic, government-approved identification documents (Aadhaar Card, Institutional Boards, or valid IDs) is mandatory prior to fixture staging."
              },
              {
                title: "Exclusivity of Athlete Representation",
                text: "Roster duplication is strictly prohibited. An individual athlete is restricted from representing multiple teams or independent fractions within the same sport category."
              },
              {
                title: "Administrative Schedule Modifications",
                text: "The core Organizing Committee retains absolute structural authority to amend fixtures, adjust session timing matrices, or reallocate court venues under operational emergencies."
              },
              {
                title: "Disciplinary Infractions & Code Penalties",
                text: "Any proven instance of ethical misconduct, competitive manipulation, cheating, or absolute insubordination will initiate immediate and irreversible lineup disqualification."
              },
              {
                title: "Finality of Arbitration & Technical Verdicts",
                text: "The operational rulings of certified match referees, umpires, and technical panel judges remain ultimate, legally binding, and non-appealable across all game phases."
              },
              {
                title: "Reporting Constraints & Forfeiture Terms",
                text: "Franchises and individual athletes must report to the technical registry booth exactly 30 minutes prior to slated play. Failure to report leads to match forfeitures."
              },
              {
                title: "Apparel Uniformity & Equipment Standards",
                text: "Adherence to regulation sports uniforms and certified defensive gear is strictly enforced. Non-compliant gear will restrict the candidate from entry into competitive loops."
              }
            ].map((clause, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex gap-3.5 items-start transition-colors hover:bg-slate-100/40">
                <div className="w-5 h-5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  0{index + 1}
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-xs sm:text-sm mb-0.5">{clause.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{clause.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}