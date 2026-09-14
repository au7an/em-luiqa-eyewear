import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Glasses,
  Sparkles,
  Layers,
  Tag,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  X,
  LayoutTemplate,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useInquiryStore } from '../../store/useInquiryStore';
import { useLanguageStore } from '../../store/useLanguageStore';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { user, signOut } = useAuthStore();
  const getNewCount = useInquiryStore((state) => state.getNewCount);
  const { t, language, setLanguage } = useLanguageStore();
  const navigate = useNavigate();
  const newInquiriesCount = getNewCount();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { label: t('admin.dashboard', 'Dashboard'), path: '/admin', icon: LayoutDashboard, exact: true },
    { label: t('admin.homepage_layout', 'Homepage Layout'), path: '/admin/homepage', icon: LayoutTemplate },
    { label: t('admin.products', 'Products'), path: '/admin/products', icon: Glasses },
    { label: t('admin.campaigns', 'Campaigns'), path: '/admin/campaigns', icon: Sparkles },
    { label: t('admin.lenses', 'Lens Services'), path: '/admin/lenses', icon: Layers },
    { label: t('admin.promotions', 'Promotions'), path: '/admin/promotions', icon: Tag },
    { label: t('admin.lookbook', 'Lookbook'), path: '/admin/lookbook', icon: BookOpen },
    {
      label: t('admin.inquiries', 'Inquiries'),
      path: '/admin/inquiries',
      icon: MessageSquare,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { label: t('admin.settings', 'Settings'), path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-300 flex flex-col h-full border-r border-neutral-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-neutral-800">
        <div>
          <Link
            to="/admin"
            onClick={onCloseMobile}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-neutral-900 font-bold text-xs">
              JL
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm text-white uppercase block">
                JEM LUIQA
              </span>
              <span className="text-[10px] text-neutral-400 font-medium block -mt-0.5 tracking-wider uppercase">
                Studio CMS
              </span>
            </div>
          </Link>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            {language === 'id' ? 'Manajemen Studio' : 'Management'}
          </span>

          {/* Admin Language Pill */}
          <div className="inline-flex items-center rounded-md p-0.5 bg-neutral-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'id' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'en' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-neutral-800 space-y-2">
        {/* Link to public store */}
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
        >
          <span className="text-[11px] font-medium">
            {language === 'id' ? 'Lihat Website Toko' : 'View Storefront'}
          </span>
          <ExternalLink size={13} />
        </Link>

        {/* User Info & Logout */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between px-2">
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              {language === 'id' ? 'Masuk sebagai' : 'Signed in as'}
            </span>
            <span className="text-xs text-neutral-200 truncate block font-medium max-w-[140px]">
              {user?.email || 'admin@jemluiqa.com'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
