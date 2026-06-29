import React from 'react';
import { ShieldAlert, Award, Globe, LogOut, MapPin, Building2, UserCircle } from 'lucide-react';
import { User, LANGUAGES, LanguageCode } from '../types';
import { useTranslation } from '../translations';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onLanguageChange: (lang: LanguageCode) => void;
  activeTab: 'home' | 'community' | 'resolved';
  setActiveTab: (tab: 'home' | 'community' | 'resolved') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onLanguageChange,
  activeTab,
  setActiveTab,
}) => {
  const { t } = useTranslation(user?.language);

  return (
    <header className="sticky top-0 z-40 glass-box border-x-0 border-t-0 rounded-none h-20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Motto */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0c2a4d] rounded-[14px] flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-sky-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-sky-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  PACT
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 rounded-full">
                  {t('verifiedTriage')}
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-300/90 tracking-wide">
                {t('promisedAction')}
              </p>
            </div>
          </div>

          {/* Navigation Links (if logged in) */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-sky-500/30 to-emerald-500/30 text-white border border-white/20 shadow-md'
                    : 'text-sky-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {user.role === 'citizen' ? t('triageHub') : t('authorityDesk')}
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'community'
                    ? 'bg-gradient-to-r from-sky-500/30 to-emerald-500/30 text-white border border-white/20 shadow-md'
                    : 'text-sky-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t('pollsAndHeroes')}</span>
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'resolved'
                    ? 'bg-gradient-to-r from-sky-500/30 to-emerald-500/30 text-white border border-white/20 shadow-md'
                    : 'text-sky-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t('resolvedRecords')}</span>
              </button>
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="relative group">
              <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-semibold hover:bg-white/20 transition cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-sky-300" />
                <span>{LANGUAGES.find((l) => l.code === (user?.language || 'en'))?.nativeName}</span>
              </div>
              <div className="absolute right-0 mt-2 w-48 py-2 bg-[#0e3b43] border border-white/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-sky-300/80 uppercase tracking-wider border-b border-white/10 mb-1">
                  Select Language
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => onLanguageChange(lang.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition flex items-center justify-between ${
                        user?.language === lang.code ? 'text-sky-300 font-bold bg-white/5' : 'text-sky-100'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[10px] opacity-70 font-mono">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* PIN Code Badge */}
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-sky-300" />
                  <span>PIN: {user.pincode}</span>
                </div>

                {/* Role / Hero Badge */}
                {user.role === 'citizen' ? (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold shadow-sm">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{user.badgesCount} {t('badges')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('govtAuthority')}</span>
                  </div>
                )}

                {/* Profile / Logout */}
                <div className="flex items-center space-x-2 border-l border-white/15 pl-3">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-sky-200/70 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Switch User / Logout"
                    className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-sky-200 hover:text-red-300 border border-white/15 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserCircle className="w-5 h-5 text-sky-300" />
                <span className="text-xs font-bold text-sky-100">{t('welcomeToPact')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        {user && (
          <div className="flex md:hidden items-center justify-around pb-3 pt-1 border-t border-white/10">
            <button
              onClick={() => setActiveTab('home')}
              className={`text-xs font-bold py-1 px-3 rounded-lg ${activeTab === 'home' ? 'text-sky-300 bg-white/10' : 'text-sky-100/70'}`}
            >
              {t('triageHub')}
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`text-xs font-bold py-1 px-3 rounded-lg ${activeTab === 'community' ? 'text-sky-300 bg-white/10' : 'text-sky-100/70'}`}
            >
              {t('pollsAndHeroes')}
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`text-xs font-bold py-1 px-3 rounded-lg ${activeTab === 'resolved' ? 'text-sky-300 bg-white/10' : 'text-sky-100/70'}`}
            >
              {t('resolvedRecords')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
