import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, Users, Trophy, CheckCircle2, Award, MapPin, 
  Sparkles, Bell, Globe, ArrowRight, ThumbsUp, MessageSquare, Share2, 
  Download, FileText, X, AlertTriangle, ShieldCheck, Check
} from 'lucide-react';

import { User, Complaint, CommunityPost, MunicipalRanking, Badge, ComplaintCategory, Language } from './types';
import { INITIAL_USER, INITIAL_COMPLAINTS, INITIAL_POSTS, INITIAL_RANKINGS, INITIAL_BADGES } from './data';
import { t } from './lib/translations';

import { Header } from './components/Header';
import { WelcomeModal } from './components/WelcomeModal';
import { ReportModal } from './components/ReportModal';
import { ExploreView } from './components/ExploreView';
import { CommunityColumn } from './components/CommunityColumn';
import { ResolvedLedger } from './components/ResolvedLedger';
import { LocalityHeroes } from './components/LocalityHeroes';

export default function App() {
  // Core application state
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [rankings, setRankings] = useState<MunicipalRanking[]>(INITIAL_RANKINGS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'community' | 'ledger' | 'heroes'>('dashboard');
  const [language, setLanguage] = useState<Language>('en');

  // Modal triggers
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Check if first visit (show welcome onboarding)
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('pact_onboarded_v1');
    if (!hasOnboarded) {
      setShowWelcomeModal(true);
    }
  }, []);

  // Welcome modal complete handler
  const handleWelcomeComplete = (newUser: User) => {
    setUser(newUser);
    setShowWelcomeModal(false);
    localStorage.setItem('pact_onboarded_v1', 'true');
  };

  // Create new complaint report
  const handleCreateComplaint = (newCmp: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'verificationCount' | 'verifiedBy' | 'authorityComments'>) => {
    const id = `cmp-${Date.now()}`;
    const created: Complaint = {
      ...newCmp,
      id,
      status: 'reported',
      createdAt: Date.now(),
      verificationCount: 1,
      verifiedBy: user ? [user.id] : [],
      authorityComments: [],
      aiSummary: `AI Verified Report: ${newCmp.title} (${newCmp.category.toUpperCase()}) in ${newCmp.locality}.`
    };

    setComplaints(prev => [created, ...prev]);
    setShowReportModal(false);

    // Auto dispatch a community announcement post
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      pincode: created.pincode,
      title: `🚨 New Hazard Reported: ${created.title}`,
      content: `Citizen ${created.reporterName} reported a ${created.urgency} urgency ${created.category} issue at ${created.locality}. Neighbors nearby, please inspect and verify.`,
      type: 'announcement',
      authorName: 'AI Civic Dispatcher',
      createdAt: Date.now(),
      complaintId: created.id
    };
    setPosts(prev => [newPost, ...prev]);
  };

  // Citizen verification vote (+1 confirmation)
  const handleVerifyComplaint = (cmpId: string) => {
    if (!user) {
      setShowWelcomeModal(true);
      return;
    }

    setComplaints(prev => prev.map(c => {
      if (c.id === cmpId) {
        if (c.verifiedBy.includes(user.id)) return c; // already verified
        const newCount = c.verificationCount + 1;
        
        // If reaches 10 verifications, issue a badge to reporter!
        if (newCount === 10) {
          const badgeId = `badge-${Date.now()}`;
          const newBadge: Badge = {
            id: badgeId,
            userId: c.reporterId,
            userName: c.reporterName,
            pincode: c.pincode,
            complaintId: c.id,
            complaintTitle: c.title,
            issuedAt: Date.now(),
            badgeNumber: `PACT-${c.pincode}-${Math.floor(1000 + Math.random() * 9000)}`,
            badgeType: 'Bronze'
          };
          setBadges(cp => [newBadge, ...cp]);

          // Congratulate in posts
          setPosts(pp => [
            {
              id: `post-h-${Date.now()}`,
              pincode: c.pincode,
              title: `🏆 Civic Honor: ${c.reporterName} Earned PACT Badge!`,
              content: `Report "${c.title}" received 10 verified neighbor confirmations! Municipal escalation is underway.`,
              type: 'hero_congrats',
              authorName: 'PACT Civic System',
              createdAt: Date.now()
            },
            ...pp
          ]);
        }

        return {
          ...c,
          verificationCount: newCount,
          verifiedBy: [...c.verifiedBy, user.id]
        };
      }
      return c;
    }));
  };

  // Municipal Authority status change
  const handleStatusChange = (cmpId: string, newStatus: Complaint['status'], comment?: string, completionPhotoUrl?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === cmpId) {
        const updatedComments = comment && comment.trim() ? [...c.authorityComments, `${user?.name || 'Municipal Engineer'}: ${comment}`] : c.authorityComments;
        
        const isResolvedNow = newStatus === 'resolved';

        const updated: Complaint = {
          ...c,
          status: newStatus,
          authorityComments: updatedComments,
          ...(isResolvedNow ? {
            resolvedAt: Date.now(),
            completionPicture: completionPhotoUrl || 'https://images.unsplash.com/photo-1584463623578-3df8d3617be3?auto=format&fit=crop&w=800&q=80'
          } : {})
        };

        // If marked resolved, trigger a community work verification poll post
        if (isResolvedNow && c.status !== 'resolved') {
          const pollPost: CommunityPost = {
            id: `post-res-${Date.now()}`,
            pincode: c.pincode,
            title: `🗳️ Work Verification Poll: ${c.title}`,
            content: `Authority marked this record as resolved. Please check the proof photo and vote whether the repair meets locality quality standards.`,
            type: 'resolution_poll',
            authorName: user?.name || 'Municipal Authority',
            createdAt: Date.now(),
            complaintId: c.id,
            poll: {
              question: `Is "${c.title}" completely fixed in your lane?`,
              yesVotes: 1,
              noVotes: 0,
              voters: user ? [user.id] : []
            }
          };
          setPosts(pp => [pollPost, ...pp]);
        }

        return updated;
      }
      return c;
    }));
  };

  // Poll voting handler
  const handleResolutionVote = (complaintId: string, vote: 'yes' | 'no') => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.complaintId === complaintId && p.poll && !p.poll.voters.includes(user.id)) {
        return {
          ...p,
          poll: {
            ...p.poll,
            yesVotes: vote === 'yes' ? p.poll.yesVotes + 1 : p.poll.yesVotes,
            noVotes: vote === 'no' ? p.poll.noVotes + 1 : p.poll.noVotes,
            voters: [...p.poll.voters, user.id]
          }
        };
      }
      return p;
    }));
  };

  // Create community post
  const handleCreatePost = (newPost: Omit<CommunityPost, 'id' | 'createdAt'>) => {
    const created: CommunityPost = {
      ...newPost,
      id: `post-${Date.now()}`,
      createdAt: Date.now()
    };
    setPosts(prev => [created, ...prev]);
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans text-white selection:bg-sky-400 selection:text-slate-950 transition-colors duration-300 p-3 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #365314 100%)'
      }}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1 gap-6">
        
        {/* HEADER SECTION (Matched to High Density Theme Box Styling) */}
        <Header 
          user={user} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReport={() => setShowReportModal(true)}
          onResetUser={() => {
            setUser(null);
            setShowWelcomeModal(true);
            localStorage.removeItem('pact_onboarded_v1');
          }}
          language={language}
          onLanguageChange={setLanguage}
        />

        {/* NAVIGATION TAB BAR (High Density Glassmorphism) */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-white/20 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition flex items-center gap-2 shrink-0 ${
                activeTab === 'dashboard' 
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 ring-1 ring-white/30' 
                  : 'bg-white/5 hover:bg-white/15 text-white/80'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('nav.dashboard', language)}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">{complaints.filter(c => c.status !== 'resolved').length}</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition flex items-center gap-2 shrink-0 ${
                activeTab === 'community' 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-white/30' 
                  : 'bg-white/5 hover:bg-white/15 text-white/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('nav.community', language)}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">{posts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition flex items-center gap-2 shrink-0 ${
                activeTab === 'ledger' 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-1 ring-white/30' 
                  : 'bg-white/5 hover:bg-white/15 text-white/80'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('nav.resolved', language)}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">{complaints.filter(c => c.status === 'resolved').length}</span>
            </button>

            <button
              onClick={() => setActiveTab('heroes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition flex items-center gap-2 shrink-0 ${
                activeTab === 'heroes' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-1 ring-white/30' 
                  : 'bg-white/5 hover:bg-white/15 text-white/80'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{t('nav.heroes', language)}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500 hover:opacity-90 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-black shadow-lg ring-1 ring-white/40 flex items-center justify-center gap-2 tracking-tight transition transform active:scale-95 text-slate-950"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>REPORT HAZARD</span>
            </button>
          </div>
        </div>

        {/* MAIN VIEW AREA */}
        <main className="flex-1 transition-all duration-300">
          {activeTab === 'dashboard' && (
            <ExploreView 
              user={user}
              complaints={complaints}
              language={language}
              onOpenReport={() => setShowReportModal(true)}
              onTriageVote={(id, vote) => handleVerifyComplaint(id)}
              onAuthorityComplete={(id, pic, remark) => handleStatusChange(id, 'resolved', remark, pic)}
            />
          )}

          {activeTab === 'community' && (
            <CommunityColumn 
              user={user}
              posts={posts}
              complaints={complaints}
              onResolutionVote={handleResolutionVote}
              onTriageVote={handleResolutionVote}
              onCreatePost={handleCreatePost}
            />
          )}

          {activeTab === 'ledger' && (
            <ResolvedLedger 
              user={user}
              complaints={complaints}
              rankings={rankings}
            />
          )}

          {activeTab === 'heroes' && (
            <LocalityHeroes 
              user={user}
              badges={badges}
              onSelectBadge={setSelectedBadge}
            />
          )}
        </main>

        {/* FOOTER BAR (Exact Match to High Density Theme HTML Pattern) */}
        <footer className="mt-4 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center justify-between px-6 py-2 gap-2 text-white/90 shadow-lg shrink-0">
          <div className="flex items-center gap-5 text-[10px] sm:text-xs uppercase tracking-wider font-extrabold font-mono">
            <span onClick={() => setActiveTab('dashboard')} className={`cursor-pointer transition hover:text-sky-300 ${activeTab === 'dashboard' ? 'text-sky-300 underline underline-offset-4' : 'opacity-70'}`}>Dashboard</span>
            <span onClick={() => setActiveTab('community')} className={`cursor-pointer transition hover:text-sky-300 ${activeTab === 'community' ? 'text-sky-300 underline underline-offset-4' : 'opacity-70'}`}>Community Post</span>
            <span onClick={() => setActiveTab('ledger')} className={`cursor-pointer transition hover:text-sky-300 ${activeTab === 'ledger' ? 'text-sky-300 underline underline-offset-4' : 'opacity-70'}`}>Resolved Records</span>
            <span onClick={() => setActiveTab('heroes')} className={`cursor-pointer transition hover:text-sky-300 ${activeTab === 'heroes' ? 'text-sky-300 underline underline-offset-4' : 'opacity-70'}`}>Heroes</span>
          </div>
          <div className="text-[11px] font-mono italic opacity-80 text-center sm:text-right">
            Promised Action (PACT) &bull; Verified Civic Ledger &bull; {complaints.length} Total Reports Tracked
          </div>
        </footer>

      </div>

      {/* MODALS */}
      {showWelcomeModal && (
        <WelcomeModal 
          onComplete={handleWelcomeComplete}
          onClose={() => setShowWelcomeModal(false)}
          initialUser={user}
        />
      )}

      {showReportModal && (
        <ReportModal 
          user={user}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleCreateComplaint}
        />
      )}

      {/* COMPLAINT INSPECTION DETAIL MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[10px] font-mono uppercase font-extrabold">
                    {selectedComplaint.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-extrabold ${
                    selectedComplaint.urgency === 'high' ? 'bg-rose-500 text-white' :
                    selectedComplaint.urgency === 'medium' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {selectedComplaint.urgency} Urgency
                  </span>
                  <span className="text-xs font-mono text-slate-400">PIN: {selectedComplaint.pincode}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black">{selectedComplaint.title}</h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedComplaint.mediaUrl && (
              <img src={selectedComplaint.mediaUrl} alt="Hazard" className="w-full h-64 rounded-2xl object-cover border border-white/15 shadow-lg" />
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 font-mono">Citizen Report Description</h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-950/70 p-4 rounded-2xl border border-white/10">
              <div>📍 <strong>Locality:</strong> {selectedComplaint.locality}</div>
              <div>👤 <strong>Reporter:</strong> {selectedComplaint.reporterName} ({selectedComplaint.reporterPhone})</div>
              <div>🤝 <strong>Corroborations:</strong> {selectedComplaint.verificationCount} verified residents</div>
              <div>🕒 <strong>Logged:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</div>
            </div>

            {/* AI Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900/40 to-emerald-900/40 border border-sky-400/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-sky-300 shrink-0" />
              <div className="text-xs">
                <strong className="text-sky-200 block font-mono">AI Geotag &amp; Cluster Assessment:</strong>
                <span className="text-slate-300">{selectedComplaint.aiSummary}</span>
              </div>
            </div>

            {/* Authority Action Panel */}
            {user?.role === 'authority' && selectedComplaint.status !== 'resolved' && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4" /> MUNICIPAL ACTION PANEL (PIN {user.pincode})
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedComplaint.id, 'in_progress', 'Repair crew dispatched to site.');
                      setSelectedComplaint(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedComplaint.id, 'resolved', 'Repairs completed and inspected.');
                      setSelectedComplaint(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition flex items-center gap-1"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Mark Resolved &amp; Issue Photo
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedComplaint(null)} className="px-6 py-2.5 bg-white/20 hover:bg-white/30 font-bold text-xs rounded-xl">Close Inspection</button>
            </div>
          </div>
        </div>
      )}

      {/* BADGE INSPECTION MODAL */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 border-2 border-amber-400/60 rounded-3xl p-8 shadow-2xl text-white space-y-6 relative text-center overflow-hidden">
            <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <button onClick={() => setSelectedBadge(null)} className="absolute right-6 top-6 text-slate-400 hover:text-white">✕</button>

            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedBadge.badgeType === 'Gold' ? 'from-amber-300 to-amber-600' : selectedBadge.badgeType === 'Silver' ? 'from-slate-300 to-slate-500' : 'from-orange-400 to-amber-700'} p-1 mx-auto shadow-xl flex items-center justify-center`}>
              <Award className="w-10 h-10 text-slate-950" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-amber-300 font-extrabold">Official Civic Honor Badge</div>
              <h3 className="text-2xl font-black tracking-tight text-white">{selectedBadge.badgeType} Contributor</h3>
              <p className="text-[11px] font-mono text-slate-400">Ledger ID: {selectedBadge.badgeNumber}</p>
            </div>

            <p className="text-xs leading-relaxed text-sky-100 max-w-md mx-auto">
              This is to certify that <strong className="text-amber-300 text-sm">{selectedBadge.userName}</strong> (PIN {selectedBadge.pincode}) has demonstrated exemplary citizenship by logging verified infrastructure hazards that led to municipal resolution: <br/>
              <span className="italic font-bold text-white block mt-2">&quot;{selectedBadge.complaintTitle}&quot;</span>
            </p>

            <div className="py-3 px-4 rounded-2xl bg-slate-950/80 border border-amber-400/30 flex items-center justify-between text-xs font-mono">
              <span>🗓️ Issued: {new Date(selectedBadge.issuedAt).toLocaleDateString()}</span>
              <span className="text-emerald-400 font-bold">✓ Blockchain Geotagged</span>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => alert("Badge downloaded as PDF document.")} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 border border-white/20">
                <Download className="w-4 h-4" /> Download Badge
              </button>
              <button onClick={() => alert("Public verification link copied to clipboard.")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg">
                <Share2 className="w-4 h-4" /> Share Recognition
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
