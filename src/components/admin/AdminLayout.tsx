import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { ToastContainer } from './Toast';

export const AdminLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block lg:w-64 shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-neutral-900 text-white px-4 py-3 flex items-center justify-between border-b border-neutral-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 -ml-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/admin" className="font-bold text-sm tracking-wider uppercase">
            JEM LUIQA <span className="text-[10px] text-neutral-400 font-normal">CMS</span>
          </Link>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-neutral-400 hover:text-white"
        >
          Storefront ↗
        </Link>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl lg:hidden"
            >
              <AdminSidebar onCloseMobile={() => setIsMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Global Toast Feedback */}
      <ToastContainer />
    </div>
  );
};
