import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const { 
    openSearch, 
    isMobileMenuOpen, 
    openMobileMenu, 
    closeMobileMenu 
  } = useUIStore();

  const { openWishlist, wishlistProductIds } = useWishlistStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  const navLinks = [
    { label: 'Sunglasses', path: '/catalog?category=sunglasses' },
    { label: 'Glasses', path: '/catalog?category=optical' },
    { label: 'Lenses', path: '/lenses' },
    { label: 'Lookbook', path: '/lookbook' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path.includes('?category=')) {
      return location.pathname === '/catalog' && location.search.includes(path.split('?')[1]);
    }
    return location.pathname === path;
  };

  // Glass blur state applies when scrolled OR on subpages with light backgrounds
  const isGlass = isScrolled || !isHomePage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
          isGlass
            ? 'bg-white/80 backdrop-blur-xl border-b border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.02)] py-3.5 sm:py-4'
            : 'bg-transparent py-5 sm:py-6'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-3 items-center">
          {/* Left Category Nav (Desktop) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 justify-self-start">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`text-[13px] md:text-[13.5px] tracking-[0.02em] font-medium transition-all ${
                  isActive(link.path)
                    ? isGlass
                      ? 'text-black font-semibold'
                      : 'text-white font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
                    : isGlass
                    ? 'text-neutral-700 hover:text-black hover:opacity-75'
                    : 'text-white/90 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle (Left on Mobile) */}
          <div className="flex md:hidden items-center justify-self-start">
            <button
              onClick={openMobileMenu}
              className={`p-1.5 -ml-1.5 rounded-full transition-colors focus:outline-none ${
                isGlass
                  ? 'text-neutral-800 hover:text-black'
                  : 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
              }`}
              aria-label="Open Navigation Menu"
            >
              <Menu size={21} strokeWidth={1.8} />
            </button>
          </div>

          {/* Center Logo */}
          <div className="justify-self-center">
            <Link
              to="/"
              className="flex flex-col items-center group text-center select-none"
            >
              <span
                className={`logo-title text-[15px] sm:text-[17px] tracking-[0.24em] font-bold uppercase transition-all duration-200 group-hover:opacity-85 ${
                  isGlass
                    ? 'text-neutral-900'
                    : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]'
                }`}
              >
                JEM LUIQA
              </span>
              <span
                className={`text-[8px] sm:text-[8.5px] tracking-[0.38em] uppercase font-medium -mt-0.5 transition-all duration-200 ${
                  isGlass
                    ? 'text-neutral-500'
                    : 'text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]'
                }`}
              >
                EYEWEAR
              </span>
            </Link>
          </div>

          {/* Right Actions: Wishlist & Search */}
          <div className="justify-self-end flex items-center gap-2">
            <button
              onClick={openSearch}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-full transition-all focus:outline-none ${
                isGlass
                  ? 'text-neutral-700 hover:text-black hover:opacity-75'
                  : 'text-white/90 hover:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]'
              }`}
              aria-label="Search Collection"
            >
              <Search size={15} strokeWidth={2} />
              <span className="hidden sm:inline text-[13px] md:text-[13.5px] tracking-[0.02em] font-medium">
                Search
              </span>
            </button>

            {wishlistProductIds.length > 0 && (
              <button
                onClick={openWishlist}
                className={`relative p-1.5 rounded-full transition-all focus:outline-none ${
                  isGlass
                    ? 'text-neutral-700 hover:text-black'
                    : 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]'
                }`}
                aria-label="Open Wishlist"
              >
                <Heart size={16} fill="currentColor" className="text-rose-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistProductIds.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white z-50 p-6 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                  <Link to="/" onClick={closeMobileMenu} className="flex flex-col">
                    <span className="logo-title text-[15px] tracking-[0.2em] font-bold text-neutral-900 uppercase">
                      JEM LUIQA
                    </span>
                    <span className="text-[8px] tracking-[0.3em] text-neutral-500 uppercase -mt-0.5 font-medium">
                      EYEWEAR
                    </span>
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    className="p-1.5 text-neutral-500 hover:text-black rounded-full transition-colors"
                    aria-label="Close Menu"
                  >
                    <X size={20} strokeWidth={1.8} />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className={`text-sm tracking-wide font-medium transition-colors ${
                      location.pathname === '/' ? 'text-black font-semibold' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Home
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`text-sm tracking-wide font-medium transition-colors ${
                        isActive(link.path) ? 'text-black font-semibold' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/catalog"
                    onClick={closeMobileMenu}
                    className={`text-sm tracking-wide font-medium transition-colors ${
                      location.pathname === '/catalog' && !location.search ? 'text-black font-semibold' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    All Collections
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 space-y-3">
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="text-xs text-neutral-400 hover:text-black block"
                >
                  Studio Portal (Admin) →
                </Link>
                <div className="text-[11px] text-neutral-400">
                  © 2026 Jem Luiqa Eyewear.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
