import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuthContext();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 50);
      setHidden(currentScroll > lastScroll && currentScroll > 100);
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/sports', label: 'Sports' },
    { to: '/register', label: 'Register' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dadqwaqis/image/upload/v1782157494/logop_cruash.png"
              alt="Khelo Mewat"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-inter font-medium transition-colors duration-300 hover:text-[#f37022] ${
                  location.pathname === link.to ? 'text-[#f37022]' : 'text-slate-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-sm font-inter font-medium text-[#f37022] hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/admin"
                className="text-sm text-slate-600 hover:text-[#f37022] transition-colors font-inter"
              >
                Admin Login
              </Link>
            )}
            <Link
              to="/register"
              className="bg-[#f37022] text-[#0A1628] px-5 py-2 rounded-full text-sm font-inter font-bold hover:scale-105 transition-transform"
            >
              Register Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-2xl font-playfair text-slate-900 hover:text-[#f37022] transition-colors"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 text-xl font-playfair text-[#f37022]"
            >
              <Shield className="w-5 h-5" />
              Dashboard
            </Link>
          )}
          {user && (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="flex items-center gap-2 text-lg text-slate-700 hover:text-slate-900"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          )}
        </div>
      )}
    </>
  );
}
