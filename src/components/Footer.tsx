import { Link } from 'react-router';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F9F7F1] border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/images/logop.png" alt="Khelo Mewat" className="h-14 w-auto" />
            </Link>
            <p className="text-[#4A6B8A] text-sm leading-relaxed">
              Empowering youth through sports. Khelo Mewat is the official sports portal
              for the Mewat region, organizing tournaments and nurturing athletic talent.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#f37022] font-playfair font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/sports', label: 'Sports' },
                { to: '/register', label: 'Registration' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-600 text-sm hover:text-[#f37022] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tournaments */}
          <div>
            <h4 className="text-[#f37022] font-playfair font-bold text-lg mb-4">Tournaments</h4>
            <ul className="space-y-2.5">
              {['Cricket Championship', 'Volleyball League', 'Athletics Meet', 'Wrestling Competition', 'Kabaddi Tournament'].map((sport) => (
                <li key={sport}>
                  <Link
                    to="/sports"
                    className="text-slate-600 text-sm hover:text-[#f37022] transition-colors"
                  >
                    {sport}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#f37022] font-playfair font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-slate-600 text-sm">
                <MapPin className="w-4 h-4 text-[#f37022] mt-0.5 shrink-0" />
                Sports Authority Office, Mewat District, Haryana, India
              </li>
              <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                <Phone className="w-4 h-4 text-[#f37022] shrink-0" />
                +91-1267-XXXXXX
              </li>
              <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                <Mail className="w-4 h-4 text-[#f37022] shrink-0" />
                sports.mewat@gov.in
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#4A6B8A]/20 py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#4A6B8A] text-xs">
            Government of Mewat Sports Authority. All rights reserved.
          </p>
          <p className="text-[#4A6B8A] text-xs">
            &copy; {currentYear} Khelo Mewat. Designed for Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
