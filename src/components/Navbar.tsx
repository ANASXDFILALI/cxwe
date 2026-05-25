import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Handshake } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const isActive = (path: string) =>
    location.pathname === path ? 'text-amber-400' : 'text-stone-200 hover:text-white';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'bg-stone-900 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* outer glow ring */}
            <div
              className="relative rounded-full shrink-0 transition-all duration-300"
              style={{
                background: 'radial-gradient(circle, rgba(212,168,83,0.25) 0%, transparent 70%)',
                boxShadow: '0 0 16px rgba(212,168,83,0.45), 0 0 32px rgba(212,168,83,0.2)',
              }}
            >
              <img
                src="/logo.png"
                alt="Morocco Food Export"
                className="h-14 w-auto rounded-full block"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
              />
            </div>
            {/* Brand text */}
            <div className="leading-tight hidden sm:block">
              <div className="text-white font-bold text-sm tracking-wide">Morocco Food Export</div>
              <div className="text-amber-400 text-xs tracking-widest uppercase">Quality from Morocco</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/catalog" className={`text-sm font-medium transition-colors ${isActive('/catalog')}`}>
              Catalogue
            </Link>
            <Link to="/quote" className={`text-sm font-medium transition-colors ${isActive('/quote')}`}>
              Demander un devis
            </Link>
            <Link
              to="/partner"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive('/partner') ? 'text-amber-400' : 'text-stone-200 hover:text-white'}`}
            >
              <Handshake className="w-3.5 h-3.5" />
              Collaborer
            </Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/partner"
              className="flex items-center gap-1.5 border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Handshake className="w-3.5 h-3.5" />
              Collaborer
            </Link>
            <Link
              to="/quote"
              className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Devis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-stone-900 border-t border-stone-700 px-4 py-4 space-y-3">
          <Link to="/" className="block text-stone-200 hover:text-white py-2 text-sm font-medium">Accueil</Link>
          <Link to="/catalog" className="block text-stone-200 hover:text-white py-2 text-sm font-medium">Catalogue</Link>
          <Link to="/quote" className="block text-stone-200 hover:text-white py-2 text-sm font-medium">Demander un devis</Link>
          <Link to="/partner" className="block text-amber-400 hover:text-amber-300 py-2 text-sm font-medium flex items-center gap-1.5">
            <Handshake className="w-4 h-4" /> Collaborer avec nous
          </Link>
          <Link
            to="/quote"
            className="block bg-amber-500 text-white text-center text-sm font-semibold px-4 py-2 rounded-lg mt-2"
          >
            Devis
          </Link>
        </div>
      )}
    </header>
  );
}

