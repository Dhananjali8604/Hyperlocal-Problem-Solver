import React from 'react';
import { ShieldCheck, Globe, UserCheck, Award, FileText, Users, CheckCircle2, LogOut, Sparkles } from 'lucide-react';
import { User, Language } from '../types';
import { t } from '../lib/translations';

interface HeaderProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenReport: () => void;
  onResetUser: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const LANGUAGES: Language[] = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 
  'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
];

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenReport,
  onResetUser,
  language,
  onLanguageChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/40 backdrop-blur-xl border-b border-white/15 px-4 lg:px-8 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Motto */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900/80 backdrop-blur rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-200 to-emerald-300 bg-clip-text text-transparent">
                  PACT
                </h1>
                <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Promised Action
                </span>
              </div>
              <p className="text-xs text-sky-100/70 font-medium">Hyperlocal Civic Action & Resolution</p>
            </div>
          </div>

          {/* Mobile report trigger */}
          {user?.role === 'citizen' && (
            <button
              onClick={onOpenReport}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg font-semibold text-xs shadow-md shadow-sky-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> {t('nav.new_report', language)}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'explore'
                ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur'
                : 'text-sky-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-300" />
            {user?.role === 'authority' ? 'Urgency Priority Queue' : t('nav.dashboard', language)}
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'community'
                ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur'
                : 'text-sky-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-300" />
            {t('nav.community', language)}
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'resolved'
                ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur'
                : 'text-sky-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-teal-300" />
            {t('nav.resolved', language)}
          </button>

          <button
            onClick={() => setActiveTab('heroes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'heroes'
                ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur'
                : 'text-sky-100/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            {t('nav.heroes', language)}
          </button>
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
          
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-sky-100 transition">
              <Globe className="w-3.5 h-3.5 text-sky-300" />
              <span>{language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : language || 'English'}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl min-w-[140px] max-h-60 overflow-y-auto">
              <div className="text-[10px] font-mono uppercase tracking-wider text-sky-300/70 px-2 py-1">Select Language</div>
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    language === l || (language === 'en' && l === 'English') || (language === 'hi' && l === 'Hindi') ? 'bg-emerald-500/30 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile Badge */}
          {user ? (
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl backdrop-blur">
              <UserCheck className={`w-4 h-4 ${user.role === 'authority' ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div className="text-left">
                <div className="text-xs font-bold leading-none truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] text-sky-200/80 font-mono mt-0.5">
                  {user.role === 'authority' ? `Govt Auth (${user.pincode})` : `PIN: ${user.pincode}`}
                </div>
              </div>
              <button
                onClick={onResetUser}
                title="Switch User / Logout"
                className="ml-1 p-1 hover:bg-white/20 rounded-lg text-sky-200/80 hover:text-white transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          {/* Desktop Report Button */}
          {user?.role === 'citizen' && (
            <button
              onClick={onOpenReport}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-500 hover:opacity-95 active:scale-95 text-white rounded-xl font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              {t('nav.new_report', language)}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
