import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { CitizenDashboard } from './components/CitizenDashboard';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { CommunityColumn } from './components/CommunityColumn';
import { ResolvedPage } from './components/ResolvedPage';
import { ReportIssueModal } from './components/ReportIssueModal';
import {
  User,
  Complaint,
  Poll,
  Badge,
  AuthorityEvaluation,
  CommunityPost,
  LanguageCode,
  IssueType,
} from './types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_POLLS,
  INITIAL_BADGES,
  INITIAL_AUTHORITIES,
  INITIAL_COMMUNITY_POSTS,
} from './data/mockData';
import { Award, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'home' | 'community' | 'resolved'>('home');

  // LocalPersistence State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pact_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('pact_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('pact_polls');
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('pact_posts');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('pact_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [authorities, setAuthorities] = useState<AuthorityEvaluation[]>(() => {
    const saved = localStorage.getItem('pact_authorities');
    return saved ? JSON.parse(saved) : INITIAL_AUTHORITIES;
  });

  // Modal Control
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalInitialType, setReportModalInitialType] = useState<IssueType | undefined>(undefined);
  const [selectedComplaintDetail, setSelectedComplaintDetail] = useState<Complaint | null>(null);
  const [badgeEarnedAlert, setBadgeEarnedAlert] = useState<Badge | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('pact_current_user', JSON.stringify(user));
    else localStorage.removeItem('pact_current_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pact_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('pact_polls', JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem('pact_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('pact_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('pact_authorities', JSON.stringify(authorities));
  }, [authorities]);

  // Handlers
  const isCitizen = user?.role === 'citizen';
  const filterByLocation = (item: { pincode: string; locality: string }) => {
    if (!user) return true;
    if (!isCitizen) return true; // authorities handled in AuthorityDashboard
    return (
      item.pincode === user.pincode ||
      (user.locality && item.locality?.toLowerCase() === user.locality.toLowerCase())
    );
  };

  const localComplaints = complaints.filter(filterByLocation);
  const localPolls = polls.filter(filterByLocation);
  const localPosts = posts.filter(filterByLocation);

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    if (user) {
      setUser({ ...user, language: lang });
    }
  };

  const handleOpenReportModal = (type?: IssueType) => {
    setReportModalInitialType(type);
    setIsReportModalOpen(true);
  };

  const handleSubmitComplaint = (newOrCompiledComplaint: Complaint, isCompiled: boolean) => {
    setIsReportModalOpen(false);

    if (isCompiled) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === newOrCompiledComplaint.id ? newOrCompiledComplaint : c))
      );
      // Add bulletin post
      const newPost: CommunityPost = {
        id: `post-${Date.now()}`,
        pincode: newOrCompiledComplaint.pincode,
        locality: newOrCompiledComplaint.locality,
        type: 'system_alert',
        title: `⚡ Amplified Urgency: ${newOrCompiledComplaint.title}`,
        content: `A citizen lodged a similar civic report. PACT AI compiled the reports together and incremented the municipal urgency score to ${newOrCompiledComplaint.urgencyRate}/5.`,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      alert(`✅ Report lodged & compiled with existing active issue!\nUrgency score incremented to ${newOrCompiledComplaint.urgencyRate}/5 at Municipal Authority desk.`);
      return;
    }

    // Fresh complaint
    setComplaints((prev) => [newOrCompiledComplaint, ...prev]);

    // Create issue verification poll
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      complaintId: newOrCompiledComplaint.id,
      pincode: newOrCompiledComplaint.pincode,
      locality: newOrCompiledComplaint.locality,
      question: `Civic Triage Poll: Is there "${newOrCompiledComplaint.title}" observed near ${newOrCompiledComplaint.locality}? / क्या आपके क्षेत्र में यह समस्या है?`,
      type: 'issue_validation',
      yesVotes: 1, // reporter auto yes
      noVotes: 0,
      votedUserIds: [user?.id || 'reporter'],
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setPolls((prev) => [newPoll, ...prev]);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      pincode: newOrCompiledComplaint.pincode,
      locality: newOrCompiledComplaint.locality,
      type: 'poll',
      title: `⚠️ New Civic Triage Alert: ${newOrCompiledComplaint.type}`,
      content: `Report submitted for "${newOrCompiledComplaint.title}". Neighborhood citizens, please verify in the Locality Poll column.`,
      createdAt: new Date().toISOString(),
      pollId: newPoll.id,
    };
    setPosts((prev) => [newPost, ...prev]);

    alert(`🎉 Report submitted successfully!\nTracking ID: ${newOrCompiledComplaint.id}\nYour report has been sent for Google Maps validation & neighborhood verification poll.`);
  };

  const handleUploadResolutionProof = (complaintId: string, proofUrl: string) => {
    const targetCmp = complaints.find((c) => c.id === complaintId);
    if (!targetCmp) return;

    const updatedCmp: Complaint = {
      ...targetCmp,
      proofPhotoUrl: proofUrl,
      status: 'pending_resolution_poll',
    };
    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updatedCmp : c)));

    // Create resolution poll
    const resPoll: Poll = {
      id: `res-poll-${Date.now()}`,
      complaintId: complaintId,
      pincode: targetCmp.pincode,
      locality: targetCmp.locality,
      question: `Resolution Check: Has the municipal authority completely fixed "${targetCmp.title}" near ${targetCmp.locality}? (See repair proof photo)`,
      type: 'resolution_validation',
      yesVotes: 0,
      noVotes: 0,
      votedUserIds: [],
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setPolls((prev) => [resPoll, ...prev]);

    const resPost: CommunityPost = {
      id: `post-${Date.now()}`,
      pincode: targetCmp.pincode,
      locality: targetCmp.locality,
      type: 'resolution_showcase',
      title: `🛠️ Repair Claim Posted by Municipal Authority`,
      content: `The authority claims completion of "${targetCmp.title}". Citizens, please validate their work via poll Yes/No.`,
      createdAt: new Date().toISOString(),
      pollId: resPoll.id,
      photoUrl: proofUrl,
    };
    setPosts((prev) => [resPost, ...prev]);
  };

  const handleVotePoll = (pollId: string, choice: 'yes' | 'no') => {
    if (!user) return;
    const targetPoll = polls.find((p) => p.id === pollId);
    if (!targetPoll || targetPoll.votedUserIds.includes(user.id)) return;

    const updatedPoll: Poll = {
      ...targetPoll,
      yesVotes: choice === 'yes' ? targetPoll.yesVotes + 1 : targetPoll.yesVotes,
      noVotes: choice === 'no' ? targetPoll.noVotes + 1 : targetPoll.noVotes,
      votedUserIds: [...targetPoll.votedUserIds, user.id],
    };
    setPolls((prev) => prev.map((p) => (p.id === pollId ? updatedPoll : p)));

    // Check simulation thresholds
    const totalVotes = updatedPoll.yesVotes + updatedPoll.noVotes;
    const targetCmp = complaints.find((c) => c.id === targetPoll.complaintId);

    if (targetPoll.type === 'issue_validation' && targetCmp) {
      if (updatedPoll.noVotes > updatedPoll.yesVotes + 1 && totalVotes >= 3) {
        // False report declined
        setComplaints((prev) => prev.filter((c) => c.id !== targetCmp.id));
        alert(`❌ Community Verdict: Report "${targetCmp.title}" was declined by neighborhood majority poll as false/not present. Report removed.`);
      } else if (updatedPoll.yesVotes >= 2 && targetCmp.status === 'pending_validation') {
        setComplaints((prev) =>
          prev.map((c) => (c.id === targetCmp.id ? { ...c, status: 'in_progress' } : c))
        );
      }
    } else if (targetPoll.type === 'resolution_validation' && targetCmp) {
      if (updatedPoll.yesVotes > updatedPoll.noVotes && totalVotes >= 1) {
        // Mark resolved
        const resolvedCmp: Complaint = {
          ...targetCmp,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
        };
        setComplaints((prev) => prev.map((c) => (c.id === targetCmp.id ? resolvedCmp : c)));

        // Issue Badge
        const newBadge: Badge = {
          id: `badge-${Math.floor(10000 + Math.random() * 90000)}`,
          complaintId: targetCmp.id,
          complaintTitle: targetCmp.title,
          citizenName: targetCmp.reporterName || 'Civic Hero',
          citizenId: user.id,
          pincode: targetCmp.pincode,
          locality: targetCmp.locality,
          issuedAt: new Date().toISOString(),
          badgeType: 'Community Hero',
        };
        setBadges((prev) => [newBadge, ...prev]);
        setBadgeEarnedAlert(newBadge);

        if (user.role === 'citizen') {
          setUser({ ...user, badgesCount: user.badgesCount + 1 });
        }

        // Increment authority count
        setAuthorities((prev) =>
          prev.map((a) =>
            a.pincode === targetCmp.pincode ? { ...a, resolvedCount: a.resolvedCount + 1, efficiencyScore: Math.min(99, a.efficiencyScore + 2) } : a
          )
        );
      }
    }
  };

  return (
    <div className="min-h-screen pact-gradient text-white font-sans antialiased relative overflow-x-hidden">
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeIssueCount={user?.role === 'citizen' ? localComplaints.filter(c => c.status !== 'resolved').length : undefined}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-fadeIn h-[calc(100vh-80px)] overflow-y-auto flex flex-col scrollbar-hide">
        {!user ? (
          <OnboardingModal onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {activeTab === 'home' &&
              (user.role === 'citizen' ? (
                <CitizenDashboard
                  user={user}
                  complaints={localComplaints}
                  onOpenReportModal={handleOpenReportModal}
                  onSelectComplaint={(cmp) => setSelectedComplaintDetail(cmp)}
                />
              ) : (
                <AuthorityDashboard
                  authorityUser={user}
                  complaints={complaints}
                  evaluations={authorities}
                  onUploadResolutionProof={handleUploadResolutionProof}
                />
              ))}

            {activeTab === 'community' && (
              <CommunityColumn
                user={user}
                polls={localPolls}
                posts={localPosts}
                onVotePoll={handleVotePoll}
              />
            )}

            {activeTab === 'resolved' && (
              <ResolvedPage
                currentUser={user}
                resolvedComplaints={localComplaints.filter((c) => c.status === 'resolved')}
                authorities={authorities}
              />
            )}
          </>
        )}
      </main>

      {/* Complaint Lodge Modal */}
      {isReportModalOpen && user && (
        <ReportIssueModal
          user={user}
          initialType={reportModalInitialType}
          existingComplaints={complaints}
          onClose={() => setIsReportModalOpen(false)}
          onSubmitComplaint={handleSubmitComplaint}
        />
      )}

      {/* Badge Earned Congratulations Popup */}
      {badgeEarnedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-md glass-box p-8 text-center text-white relative shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 text-[#0c2a4d] flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Award className="w-10 h-10 animate-bounce" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 block mb-1">
              🎖️ Social Service Honor Badge
            </span>
            <h3 className="text-2xl font-black text-white mb-2">Thank You, Community Hero!</h3>
            <p className="text-xs text-sky-100/90 leading-relaxed mb-6">
              Your reported civic complaint **"{badgeEarnedAlert.complaintTitle}"** has been validated as resolved by your locality residents! PACT awards this official badge of gratitude to your name.
            </p>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 font-mono text-left text-xs mb-6 space-y-1">
              <p>🏅 Badge ID: {badgeEarnedAlert.id}</p>
              <p>👤 Hero Name: {badgeEarnedAlert.citizenName}</p>
              <p>📍 Locality: {badgeEarnedAlert.locality} ({badgeEarnedAlert.pincode})</p>
              <p>📅 Date: {new Date(badgeEarnedAlert.issuedAt).toLocaleDateString()}</p>
            </div>

            <button
              onClick={() => setBadgeEarnedAlert(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0c2a4d] font-black text-xs uppercase tracking-wider shadow-xl hover:brightness-110 transition"
            >
              Collect Badge & Close
            </button>
          </div>
        </div>
      )}

      {/* Complaint Details Popup */}
      {selectedComplaintDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-box p-6 text-white relative shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-white/15 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-sky-400/20 text-sky-200 text-[10px] font-bold uppercase font-mono">
                  {selectedComplaintDetail.type} • Urgency: {selectedComplaintDetail.urgencyRate}/5
                </span>
                <h3 className="text-xl font-black text-white mt-2 leading-snug">
                  {selectedComplaintDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaintDetail(null)}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-sky-100/90 leading-relaxed">
              {selectedComplaintDetail.description}
            </p>

            {selectedComplaintDetail.photoUrl && (
              <img src={selectedComplaintDetail.photoUrl} alt="Evidence" className="w-full h-56 rounded-2xl object-cover border border-white/20" />
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10 font-mono">
              <div>📍 Locality: {selectedComplaintDetail.locality}</div>
              <div>📮 PIN Code: {selectedComplaintDetail.pincode}</div>
              <div>👤 Reporter: {selectedComplaintDetail.reporterName}</div>
              <div>⚡ Compiled Reports: {selectedComplaintDetail.similarCount}</div>
            </div>

            <button
              onClick={() => setSelectedComplaintDetail(null)}
              className="w-full py-3 rounded-2xl bg-sky-400 text-[#0c2a4d] font-black text-xs uppercase tracking-wider hover:brightness-110 transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
