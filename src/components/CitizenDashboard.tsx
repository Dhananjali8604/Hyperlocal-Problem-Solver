import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  Construction,
  Trash2,
  PlusCircle,
  MapPin,
  Flame,
  Clock,
  CheckCircle,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { Complaint, IssueType, User } from '../types';
import { useTranslation } from '../translations';

interface CitizenDashboardProps {
  user: User;
  complaints: Complaint[];
  onOpenReportModal: (initialType?: IssueType) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  complaints,
  onOpenReportModal,
  onSelectComplaint,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation(user.language);

  // Count active reports by type
  const countByType = (type: IssueType) =>
    complaints.filter((c) => c.type === type && c.status !== 'resolved').length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.type === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pincode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header & Report CTA */}
      <div className="relative rounded-3xl glass-box p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-400/20 border border-sky-300/30 text-sky-200 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-sky-300" />
              <span>Hyperlocal Sector: {user.pincode} • {user.locality || 'Citizen District'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {t('triageHub')}
            </h1>
            <p className="text-sm font-medium text-sky-100/90 leading-relaxed">
              Report local civic hazards. PACT AI validates your submission via locality polls and GPS mapping, compiles similar reports to amplify urgency, and directly notifies municipal authorities.
            </p>
          </div>

          <button
            onClick={() => onOpenReportModal()}
            className="shrink-0 flex items-center justify-center space-x-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 text-[#0c2a4d] font-black text-base uppercase tracking-wider shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 group border border-white/30"
          >
            <PlusCircle className="w-6 h-6 text-[#0c2a4d] group-hover:rotate-90 transition-transform duration-300" />
            <span>🚨 {t('reportIssue')}</span>
          </button>
        </div>
      </div>

      {/* Front Page Blocks Requirement: "Front page should show reports of types in different blocks for people" */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-sky-200 flex items-center space-x-2">
            <span>{t('activeComplaints')}</span>
            <span className="text-xs font-normal text-emerald-300 capitalize">(Select to Lodge or Filter)</span>
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-sky-300 hover:underline font-bold"
            >
              Show All Types
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Infrastructure Block */}
          <div
            onClick={() => {
              setSelectedCategory('Infrastructure');
            }}
            className={`cursor-pointer p-6 transition-all duration-300 relative overflow-hidden ${
              selectedCategory === 'Infrastructure'
                ? 'glass-box bg-sky-500/30 border-sky-400 ring-2 ring-sky-300 shadow-xl shadow-sky-500/20 translate-y-[-4px]'
                : 'glass-box hover:bg-white/15 hover:border-white/30 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border border-sky-300/40 flex items-center justify-center text-sky-300 shadow-inner">
                <Construction className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/30 border border-sky-400/40 text-white text-xs font-black font-mono">
                {countByType('Infrastructure')} Active
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide mb-1">{t('infrastructure')}</h3>
            <p className="text-xs text-sky-100/80 leading-snug mb-4">
              Potholes, broken roads, damaged bridges, collapsed public walls.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-bold text-sky-300">View Category →</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportModal('Infrastructure');
                }}
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-[#0c2a4d] transition"
              >
                + Lodge
              </button>
            </div>
          </div>

          {/* Electrical Block */}
          <div
            onClick={() => {
              setSelectedCategory('Electrical');
            }}
            className={`cursor-pointer p-6 transition-all duration-300 relative overflow-hidden ${
              selectedCategory === 'Electrical'
                ? 'glass-box bg-amber-500/30 border-amber-400 ring-2 ring-amber-300 shadow-xl shadow-amber-500/20 translate-y-[-4px]'
                : 'glass-box hover:bg-white/15 hover:border-white/30 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-white text-xs font-black font-mono">
                {countByType('Electrical')} Active
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide mb-1">{t('electrical')}</h3>
            <p className="text-xs text-sky-100/80 leading-snug mb-4">
              Streetlights out, dangling cables, transformer sparks, outages.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-bold text-amber-300">View Category →</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportModal('Electrical');
                }}
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-[#0c2a4d] transition"
              >
                + Lodge
              </button>
            </div>
          </div>

          {/* Water Related Block */}
          <div
            onClick={() => {
              setSelectedCategory('Water Related');
            }}
            className={`cursor-pointer p-6 transition-all duration-300 relative overflow-hidden ${
              selectedCategory === 'Water Related'
                ? 'glass-box bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-300 shadow-xl shadow-cyan-500/20 translate-y-[-4px]'
                : 'glass-box hover:bg-white/15 hover:border-white/30 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300 shadow-inner">
                <Droplets className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/30 border border-cyan-400/40 text-white text-xs font-black font-mono">
                {countByType('Water Related')} Active
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide mb-1">{t('waterRelated')}</h3>
            <p className="text-xs text-sky-100/80 leading-snug mb-4">
              Burst pipes, sewage overflow, contaminated supply, flooding.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-bold text-cyan-300">View Category →</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportModal('Water Related');
                }}
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-[#0c2a4d] transition"
              >
                + Lodge
              </button>
            </div>
          </div>

          {/* Roads & Sanitation Block */}
          <div
            onClick={() => {
              setSelectedCategory('Roads & Sanitation');
            }}
            className={`cursor-pointer p-6 transition-all duration-300 relative overflow-hidden ${
              selectedCategory === 'Roads & Sanitation'
                ? 'glass-box bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-300 shadow-xl shadow-emerald-500/20 translate-y-[-4px]'
                : 'glass-box hover:bg-white/15 hover:border-white/30 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-white text-xs font-black font-mono">
                {countByType('Roads & Sanitation')} Active
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide mb-1">{t('roadsSanitation')}</h3>
            <p className="text-xs text-sky-100/80 leading-snug mb-4">
              Garbage dumps, uncleaned drains, dead animals, traffic blockages.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-bold text-emerald-300">View Category →</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportModal('Roads & Sanitation');
                }}
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-[#0c2a4d] transition"
              >
                + Lodge
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-box p-4 border-white/15">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-sky-200 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchComplaints')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/60 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-sky-300 shrink-0" />
          <span className="text-xs font-bold text-sky-200 shrink-0">Filter:</span>
          {(['All', 'Infrastructure', 'Electrical', 'Water Related', 'Roads & Sanitation'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-400 text-[#0c2a4d] shadow-md'
                  : 'bg-white/5 text-sky-100 hover:bg-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-sky-200 flex items-center justify-between">
          <span>Hyperlocal Civic Reports ({filteredComplaints.length})</span>
          <span className="text-xs font-normal text-sky-200/70">
            Click card to view details, validation poll & status
          </span>
        </h2>

        {filteredComplaints.length === 0 ? (
          <div className="glass-box p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-base font-bold text-white">No active civic issues match your filter!</p>
            <p className="text-xs text-sky-200/70 mt-1">Your sector is currently green or resolved.</p>
            <button
              onClick={() => onOpenReportModal()}
              className="mt-4 px-6 py-2.5 rounded-xl bg-sky-400 text-[#0c2a4d] text-xs font-black uppercase tracking-wider hover:brightness-110 transition"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="group cursor-pointer glass-box hover:bg-white/15 hover:border-sky-400/50 p-6 shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card top bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono ${
                          c.type === 'Electrical'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : c.type === 'Water Related'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                            : c.type === 'Infrastructure'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        }`}
                      >
                        {c.type}
                      </span>
                      {c.googleMapsVerified && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40 text-[9px] font-bold flex items-center space-x-1">
                          <span>🗺️ Maps Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Urgency Rate Badge */}
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-black shadow-sm">
                      <Flame className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                      <span>Urgency: {c.urgencyRate}/5</span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition line-clamp-2 leading-snug mb-2">
                    {c.translatedDescriptions?.[user.language] || c.title}
                  </h3>
                  <p className="text-xs text-sky-100/80 line-clamp-3 leading-relaxed mb-4">
                    {c.description}
                  </p>

                  {/* Photo Thumbnail if exists */}
                  {c.photoUrl && (
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 border border-white/15 bg-black/30">
                      <img src={c.photoUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2 text-sky-200/80 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[160px]">{c.locality}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {c.similarCount > 1 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold font-mono flex items-center space-x-1" title="Similar reports compiled together to boost urgency">
                        <Users className="w-3 h-3" />
                        <span>+{c.similarCount - 1} Compiled</span>
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                        c.status === 'resolved'
                          ? 'bg-emerald-500/30 text-emerald-200'
                          : c.status === 'in_progress'
                          ? 'bg-sky-500/30 text-sky-200'
                          : c.status === 'pending_resolution_poll'
                          ? 'bg-purple-500/30 text-purple-200'
                          : 'bg-amber-500/30 text-amber-200'
                      }`}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
