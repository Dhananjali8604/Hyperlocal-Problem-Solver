import React, { useState } from 'react';
import { MapPin, ShieldAlert, Sparkles, Filter, ThumbsUp, ThumbsDown, CheckCircle2, Upload, AlertTriangle, Eye, Globe, Loader2, Layers, CheckSquare, Clock } from 'lucide-react';
import { User, Complaint, ComplaintType, Language } from '../types';
import { t } from '../lib/translations';

interface ExploreViewProps {
  user: User | null;
  complaints: Complaint[];
  language: Language;
  onOpenReport: () => void;
  onTriageVote: (complaintId: string, vote: 'yes' | 'no') => void;
  onAuthorityComplete: (complaintId: string, completionPicture: string, remark: string) => void;
}

const CATEGORIES: { id: ComplaintType | 'All'; label: string; icon: string; color: string }[] = [
  { id: 'All', label: 'All Reports', icon: '🌐', color: 'from-slate-700/50 to-slate-800/50 border-white/20' },
  { id: 'Infra', label: 'Infra (Roads/Bridges)', icon: '🚧', color: 'from-amber-600/30 to-amber-800/40 border-amber-400/40' },
  { id: 'Electrical', label: 'Electrical Hazards', icon: '⚡', color: 'from-yellow-500/30 to-amber-700/40 border-yellow-400/40' },
  { id: 'Water', label: 'Water & Drainage', icon: '💧', color: 'from-sky-500/30 to-blue-700/40 border-sky-400/40' },
  { id: 'Sanitation', label: 'Sanitation & Garbage', icon: '🗑️', color: 'from-emerald-600/30 to-teal-800/40 border-emerald-400/40' },
  { id: 'Other', label: 'Other Civic Issues', icon: '📌', color: 'from-purple-600/30 to-indigo-800/40 border-purple-400/40' }
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  user,
  complaints,
  language,
  onOpenReport,
  onTriageVote,
  onAuthorityComplete
}) => {
  const [selectedCat, setSelectedCat] = useState<ComplaintType | 'All'>('All');
  const [filterPincode, setFilterPincode] = useState(user?.pincode || '');
  const [showMap, setShowMap] = useState(true);

  // Authority completion modal state
  const [completeModalCmp, setCompleteModalCmp] = useState<Complaint | null>(null);
  const [completionPic, setCompletionPic] = useState('https://images.unsplash.com/photo-1542013936693-859e53936323?auto=format&fit=crop&w=800&q=80');
  const [authRemark, setAuthRemark] = useState('');
  const [completing, setCompleting] = useState(false);

  // AI Translation state
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  React.useEffect(() => {
    setTranslations({});
    
    // Auto translate up to 5 displayed complaints when language changes
    if (language !== 'en' && language !== 'English') {
      complaints.slice(0, 5).forEach(cmp => {
        fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `${cmp.title}: ${cmp.description}`, targetLang: language || 'hi' })
        })
        .then(res => res.json())
        .then(data => {
          setTranslations(prev => ({ ...prev, [cmp.id]: data.translatedText }));
        })
        .catch(console.error);
      });
    }
  }, [language, complaints]);

  const handleTranslate = async (cmp: Complaint) => {
    if (translations[cmp.id]) return;
    setTranslatingId(cmp.id);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${cmp.title}: ${cmp.description}`, targetLang: language || 'hi' })
      });
      const data = await res.json();
      setTranslatingId(null);
      setTranslations(prev => ({ ...prev, [cmp.id]: data.translatedText }));
    } catch (e) {
      setTranslatingId(null);
    }
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalCmp) return;
    setCompleting(true);
    await onAuthorityComplete(completeModalCmp.id, completionPic, authRemark);
    setCompleting(false);
    setCompleteModalCmp(null);
  };

  // Filter complaints
  let displayedComplaints = complaints.filter(c => c.status !== 'declined');

  if (user?.role === 'authority') {
    // Authority sees ONLY complaints strictly in their jurisdictional PIN code!
    displayedComplaints = displayedComplaints.filter(c => c.pincode === user.pincode);
    // Sort strictly by urgencyScore descending
    displayedComplaints.sort((a, b) => b.urgencyScore - a.urgencyScore);
  } else {
    // Citizen filter
    if (selectedCat !== 'All') {
      displayedComplaints = displayedComplaints.filter(c => c.type === selectedCat);
    }
    if (filterPincode.trim()) {
      displayedComplaints = displayedComplaints.filter(c => c.pincode.includes(filterPincode.trim()));
    }
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* CITIZEN VIEW: Front Page Category Blocks & Triage Map */}
      {user?.role === 'citizen' && (
        <div className="space-y-8">
          
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="space-y-3 max-w-2xl text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Hyperlocal Civic Service Pact
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Promised Action for Your Neighborhood
              </h2>
              <p className="text-sm text-sky-100/80 leading-relaxed">
                Report infrastructure defects, validate neighbor issues via Google Maps triage, and earn government-backed recognition badges.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 z-10 w-full md:w-auto">
              <div className="relative w-full sm:w-44">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-300" />
                <input
                  type="text"
                  placeholder="Filter PIN Code..."
                  value={filterPincode}
                  onChange={e => setFilterPincode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                onClick={onOpenReport}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-500 hover:opacity-95 active:scale-95 text-white rounded-xl font-extrabold text-xs shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" /> {t('nav.new_report', language)}
              </button>
            </div>
          </div>

          {/* FRONT PAGE REQUIREMENT: Reports of types in different blocks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-300" /> {t('explore.filter', language)}
              </h3>
              <span className="text-xs text-sky-200/70 font-mono">Select Block to Filter</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORIES.map(cat => {
                const count = complaints.filter(c => c.status !== 'declined' && (cat.id === 'All' || c.type === cat.id) && (!filterPincode || c.pincode.includes(filterPincode))).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`p-4 rounded-2xl bg-gradient-to-br backdrop-blur-md border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[110px] ${cat.color} ${
                      selectedCat === cat.id ? 'ring-2 ring-white scale-[1.02] shadow-xl' : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white border border-white/10">
                        {count}
                      </span>
                    </div>
                    <div className="font-extrabold text-xs text-white tracking-tight mt-3">{cat.id === 'All' ? t('explore.all', language) : cat.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Maps Validation Triage Box */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-base font-black flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" /> Google Maps Geolocation Triage Radar
                </h4>
                <p className="text-xs text-sky-200/80 mt-0.5">
                  Validating current reported issues surrounding PIN {filterPincode || '110001'}. Surrounding area people are notified to confirm hazards.
                </p>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold shrink-0"
              >
                {showMap ? 'Hide Radar Map' : 'Show Radar Map'}
              </button>
            </div>

            {showMap && (
              <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-white/15 shadow-inner bg-slate-950">
                <iframe
                  title="Google Maps Civic Validation"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)' }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${filterPincode || 'Connaught Place New Delhi'}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-white/20 px-3 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>AI Triage Active: Compiling Similar Neighbor Pins</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* AUTHORITY VIEW HEADER: Priority Queue Explanation */}
      {user?.role === 'authority' && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-emerald-500/20 backdrop-blur-xl border border-amber-400/30 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase">
              Municipal Jurisdiction Dashboard (PIN {user.pincode})
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              AI Urgency Priority Queue
            </h2>
            <p className="text-xs text-sky-100/80 leading-relaxed">
              Complaints are updated in real-time according to AI Urgency score. Similar reports submitted in your jurisdiction automatically compile into single records and increment urgency.
            </p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur border border-white/15 px-6 py-4 rounded-2xl text-center shrink-0">
            <div className="text-3xl font-black text-amber-400 font-mono">{displayedComplaints.length}</div>
            <div className="text-[10px] text-slate-300 font-mono uppercase tracking-wider mt-1">Active Cases in PIN {user.pincode}</div>
          </div>
        </div>
      )}

      {/* COMPLAINTS LIST SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            {user?.role === 'authority' ? 'Prioritized Municipal Action List' : 'Community Reported Complaints'}
          </h3>
          <span className="text-xs font-mono text-sky-200/80">
            {displayedComplaints.length} Case{displayedComplaints.length === 1 ? '' : 's'} Found
          </span>
        </div>

        {displayedComplaints.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/20 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h4 className="text-base font-bold">No Active Civic Issues</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All reported complaints in this category or PIN code have been resolved or filtered out.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4">
          {displayedComplaints.map(cmp => {
            const hasVotedTriage = user && cmp.triagePoll?.voters.includes(user.id);
            const isTranslated = translations[cmp.id];

            return (
              <div
                key={cmp.id}
                className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 p-6 shadow-xl transition-all space-y-4 relative overflow-hidden"
              >
                {/* Top bar: Category, PIN & Urgency badge */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/15 text-xs font-bold text-sky-200">
                      {cmp.type === 'Infra' && '🚧 Infra'}
                      {cmp.type === 'Electrical' && '⚡ Electrical'}
                      {cmp.type === 'Water' && '💧 Water/Sewage'}
                      {cmp.type === 'Sanitation' && '🗑️ Sanitation'}
                      {cmp.type === 'Other' && '📌 Civic'}
                    </span>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-sky-100">
                      📍 PIN: {cmp.pincode} ({cmp.locality})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Urgency Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/25 to-amber-500/25 border border-rose-400/40 text-rose-200 text-xs font-extrabold font-mono shadow-md">
                      🔥 Urgency Score: {cmp.urgencyScore}
                      {cmp.similarReportsCount > 1 && (
                        <span className="ml-1 px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px]">
                          {cmp.similarReportsCount} Compiled
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider ${
                      cmp.status === 'pending_validation' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      cmp.status === 'validated' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      cmp.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      cmp.status === 'resolved_pending_poll' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {cmp.status === 'pending_validation' && '⚠️ Community Triage'}
                      {cmp.status === 'validated' && '📤 Sent to Municipality'}
                      {cmp.status === 'in_progress' && '🔨 In Progress'}
                      {cmp.status === 'resolved_pending_poll' && '🗳️ Resident Verification Poll'}
                      {cmp.status === 'resolved' && '✅ Resolved'}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  
                  {/* Photo / Video preview */}
                  <div className="md:col-span-1 relative h-36 rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-inner shrink-0">
                    {cmp.mediaType === 'video' ? (
                      <video src={cmp.mediaUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={cmp.mediaUrl} alt={cmp.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono uppercase text-sky-300 backdrop-blur">
                      Evidence
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-xl font-black tracking-tight text-white leading-snug">
                        {isTranslated ? (
                          <span className="text-emerald-300">{isTranslated}</span>
                        ) : cmp.title}
                      </h4>

                      {/* AI Translate Button */}
                      {language !== 'en' && !isTranslated && (
                        <button
                          disabled={translatingId === cmp.id}
                          onClick={() => handleTranslate(cmp)}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-[11px] font-semibold text-sky-300 shrink-0 flex items-center gap-1 transition"
                        >
                          {translatingId === cmp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                          {t('explore.translate', language)}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-sky-100/80 leading-relaxed">
                      {cmp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 pt-2 font-mono">
                      <span>👤 Reported by: <strong className="text-white">{cmp.reporterName}</strong></span>
                      <span>📞 Tracking Phone: <strong className="text-white">{cmp.reporterPhone?.slice(0, 3)}****{cmp.reporterPhone?.slice(-3)}</strong></span>
                      <span>🕒 {new Date(cmp.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Authority Remark */}
                    {cmp.authorityRemark && (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-400/30 text-xs text-sky-200 mt-2">
                        <strong className="text-sky-300 uppercase font-mono text-[10px] block mb-0.5">Municipal Authority Status Update:</strong>
                        {cmp.authorityRemark}
                      </div>
                    )}
                  </div>

                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4">
                  
                  {/* CITIZEN TRIAGE POLLING ACTIONS */}
                  {user?.role === 'citizen' && cmp.status === 'pending_validation' && (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-xs font-bold text-amber-300">
                        Surrounding Triage Validation: Does this hazard exist?
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={hasVotedTriage}
                          onClick={() => onTriageVote(cmp.id, 'yes')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            hasVotedTriage ? 'bg-emerald-500/40 text-white cursor-not-allowed' : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Yes ({cmp.triagePoll.yes})
                        </button>
                        <button
                          disabled={hasVotedTriage}
                          onClick={() => onTriageVote(cmp.id, 'no')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            hasVotedTriage ? 'bg-rose-500/40 text-white cursor-not-allowed' : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> False Report ({cmp.triagePoll.no})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AUTHORITY TASK COMPLETION TRIGGER */}
                  {user?.role === 'authority' && (cmp.status === 'validated' || cmp.status === 'in_progress') && (
                    <div className="flex items-center justify-end w-full">
                      <button
                        onClick={() => setCompleteModalCmp(cmp)}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
                      >
                        <Upload className="w-4 h-4" /> Post Completion Photo &amp; Trigger Resident Verification Poll
                      </button>
                    </div>
                  )}

                  {/* RESOLVED COMPLETION PHOTO PREVIEW */}
                  {cmp.completionPicture && (
                    <div className="flex items-center gap-3 w-full bg-emerald-500/10 border border-emerald-400/30 p-3 rounded-2xl">
                      <img src={cmp.completionPicture} alt="Work Completed" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/20" />
                      <div className="text-xs">
                        <div className="font-bold text-emerald-300">✅ Municipal Task Completion Photo Posted</div>
                        <div className="text-slate-300 text-[11px]">Resident verification poll dispatched to locality residents.</div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* AUTHORITY COMPLETION MODAL */}
      {completeModalCmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black flex items-center gap-2 text-emerald-400">
                <Upload className="w-5 h-5" /> Mark Task Completed
              </h3>
              <button onClick={() => setCompleteModalCmp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCompletionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sky-200 mb-1">Issue Being Closed:</label>
                <div className="p-3 rounded-xl bg-white/5 font-bold text-xs">{completeModalCmp.title}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Picture of Completion of Task (URL) *</label>
                <input
                  type="url"
                  required
                  value={completionPic}
                  onChange={e => setCompletionPic(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                />
                <div className="mt-2 h-32 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                  <img src={completionPic} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Official Completion Remark *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g., Replaced damaged transformer cables and insulated pole..."
                  value={authRemark}
                  onChange={e => setAuthRemark(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white resize-none"
                />
              </div>

              <p className="text-[11px] text-amber-200/80 bg-amber-500/10 p-3 rounded-xl border border-amber-400/30">
                ⚠️ On submission, this picture will be dispatched to locality residents in a YES/NO verification poll. If residents confirm resolution, a badge thanking the reporter is generated.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCompleteModalCmp(null)} className="px-5 py-2.5 bg-white/10 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={completing} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2">
                  {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Post Proof &amp; Dispatch Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
