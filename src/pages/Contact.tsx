import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.contact-hero',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from('.contact-hero h1', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' })
        .from('.contact-hero p', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .from('.contact-card', { y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.3');
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    toast.success('Message sent successfully!');
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <main ref={sectionRef}>
      {/* Hero */}
      <section className="contact-hero relative min-h-[45vh] flex items-center justify-center bg-[#F7F2E9] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/images/banerbg3.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/50 via-[#0A1628]/40 to-[#0A1628]/50" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-[#f37022] mb-4">
            Contact Us
          </h1>
          <p className="text-white text-lg font-inter">
            Get in touch with the Khelo Mewat Sports Authority for any queries or assistance.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 lg:py-24 bg-[#F7F2E9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              {[
                { icon: MapPin, title: 'Office Address', content: 'Sports Authority Office, Near District Collectorate, Mewat, Haryana - 122107' },
                { icon: Phone, title: 'Phone Numbers', content: '+91-1267-XXXXXX\n+91-98XXXXXXXX' },
                { icon: Mail, title: 'Email Address', content: 'sports.mewat@gov.in\nadmin@khelomewat.gov.in' },
                { icon: Clock, title: 'Office Hours', content: 'Monday - Saturday\n10:00 AM - 5:00 PM' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="contact-card bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-[#f37022]/10 rounded-lg shrink-0">
                      <item.icon className="w-5 h-5 text-[#f37022]" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-playfair font-bold text-base mb-1">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 font-inter text-sm whitespace-pre-line leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="contact-card bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
                <h3 className="text-slate-900 font-playfair font-bold text-xl mb-6">
                  Send us a Message
                </h3>

                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                    <h4 className="text-slate-900 font-playfair font-bold text-lg mb-2">Message Sent!</h4>
                    <p className="text-slate-600 font-inter text-sm text-center">
                      Thank you for reaching out. We will get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-600 text-sm font-inter mb-1.5 block">Your Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none transition-colors"
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-sm font-inter mb-1.5 block">Email *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none transition-colors"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-600 text-sm font-inter mb-1.5 block">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none transition-colors"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 text-sm font-inter mb-1.5 block">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none transition-colors resize-none"
                        rows={5}
                        placeholder="Your message..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="bg-[#f37022] text-[#0A1628] px-8 py-3 rounded-xl font-inter font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
