import React, { useState } from 'react';
import {
  Building2,
  Flame,
  Clock,
  CheckCircle2,
  Upload,
  MapPin,
  FileText,
  AlertOctagon,
  Sparkles,
  Search,
  Filter,
  Camera,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Complaint, User, AuthorityEvaluation } from '../types';

interface AuthorityDashboardProps {
  authorityUser: User;
  complaints: Complaint[];
  evaluations: AuthorityEvaluation[];
  onUploadResolutionProof: (complaintId: string, proofPhotoUrl: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  authorityUser,
  complaints,
  evaluations,
  onUploadResolutionProof,
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'open' | 'poll_pending' | 'resolved' | 'all'>('open');

  // Filter complaints sent to this authority's pincode / district
  const authorityComplaints = complaints.filter(
    (c) => c.pincode === authorityUser.pincode || authorityUser.authorityCode === '1234' || authorityUser.pincode === '560038'
  );

  // Requirement: "For the authority the complaints should be updated according to urgency with the most urgent on top followed by lower urgency."
  const sortedComplaints = [...authorityComplaints]
    .filter((c) => {
      if (statusFilter === 'open') return c.status !== 'resolved' && c.status !== 'pending_resolution_poll';
      if (statusFilter === 'poll_pending') return c.status === 'pending_resolution_poll';
      if (statusFilter === 'resolved') return c.status === 'resolved';
      return true;
    })
    .sort((a, b) => {
      // Highest urgency first
      if (b.urgencyRate !== a.urgencyRate) return b.urgencyRate - a.urgencyRate;
      // Then compiled count
      return b.similarCount - a.similarCount;
    });

  const myEvaluation = evaluations.find(
    (e) => e.pincode === authorityUser.pincode || e.id === 'auth-blr'
  ) || evaluations[0];

  const handleSimulatedPhotoProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofUrl(URL.createObjectURL(file));
    }
  };

  const simulateQuickRepairPhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1584463603413-4330628e469d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611288875785-f37756f1406e?auto=format&fit=crop&w=800&q=80',
    ];
    setProofUrl(samples[Math.floor(Math.random() * samples.length)]);
  };

  const handlePostCompletion = () => {
    if (!selectedComplaint || !proofUrl) {
      alert('Please attach completion verification photo.');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      onUploadResolutionProof(selectedComplaint.id, proofUrl);
      setUploading(false);
      setSelectedComplaint(null);
      setProofUrl(null);
      alert('✅ Completion photo posted! PACT AI has launched a neighborhood verification poll to nearby residents. Once validated, resolution badge will be issued.');
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Authority Header Banner */}
      <div className="glass-box border-amber-400/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Jurisdiction PIN: {authorityUser.pincode} • {authorityUser.district || 'Municipal Sector'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {authorityUser.name || 'Municipal Triage Command'}
            </h1>
            <p className="text-sm text-amber-100/80 max-w-2xl">
              Official Gov Desk. Incoming civic reports are compiled by sector and sorted automatically by **Urgency Score**. Descriptions are translated to your chosen language choice.
            </p>
          </div>

          {/* Monthly Performance Card Requirement */}
          {myEvaluation && (
            <div className="shrink-0 bg-white/10 border border-white/20 p-5 rounded-2xl backdrop-blur-md max-w-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-200 uppercase">📈 AI Monthly Evaluation</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-xs font-black font-mono">
                  Rank #{myEvaluation.rank}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">{myEvaluation.efficiencyScore}%</span>
                <span className="text-xs text-emerald-300 font-semibold">Efficiency Index</span>
              </div>
              <p className="text-[11px] text-sky-100/80 italic leading-snug">
                "{myEvaluation.aiMonthlyRemark}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between glass-box p-3 border-white/15 overflow-x-auto">
        <div className="flex space-x-2">
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              statusFilter === 'open'
                ? 'bg-amber-500 text-[#0c2a4d] shadow-lg'
                : 'bg-white/5 text-amber-100 hover:bg-white/10'
            }`}
          >
            🔥 Open Urgent Tasks ({authorityComplaints.filter((c) => c.status !== 'resolved' && c.status !== 'pending_resolution_poll').length})
          </button>
          <button
            onClick={() => setStatusFilter('poll_pending')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              statusFilter === 'poll_pending'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/5 text-purple-100 hover:bg-white/10'
            }`}
          >
            🗳️ Poll Auditing ({authorityComplaints.filter((c) => c.status === 'pending_resolution_poll').length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              statusFilter === 'resolved'
                ? 'bg-emerald-500 text-[#0c2a4d] shadow-lg'
                : 'bg-white/5 text-emerald-100 hover:bg-white/10'
            }`}
          >
            ✅ Resolved Archive ({authorityComplaints.filter((c) => c.status === 'resolved').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              statusFilter === 'all'
                ? 'bg-sky-400 text-[#0c2a4d] shadow-lg'
                : 'bg-white/5 text-sky-100 hover:bg-white/10'
            }`}
          >
            All Reports ({authorityComplaints.length})
          </button>
        </div>
        <div className="hidden lg:flex items-center space-x-2 px-3 text-xs text-amber-200/80">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <span>Priority sort: Urgency 5 on top</span>
        </div>
      </div>

      {/* Complaints List Table/Cards */}
      <div className="space-y-4">
        {sortedComplaints.length === 0 ? (
          <div className="glass-box border-white/15 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="text-base font-bold text-white">No active tasks match this filter!</p>
            <p className="text-xs text-sky-200/70 mt-1">Great job keeping Sector {authorityUser.pincode} clean.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedComplaints.map((c) => (
              <div
                key={c.id}
                className={`glass-box p-6 transition flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  c.urgencyRate === 5
                    ? 'border-red-500/50 shadow-red-500/10 shadow-xl'
                    : c.urgencyRate === 4
                    ? 'border-amber-500/40 shadow-xl'
                    : 'border-white/20 shadow-lg'
                }`}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Urgency Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 uppercase tracking-wider ${
                        c.urgencyRate >= 4 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-[#0c2a4d]'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>Urgency: {c.urgencyRate}/5</span>
                    </span>

                    <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold font-mono">
                      {c.type}
                    </span>

                    {c.similarCount > 1 && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-black font-mono">
                        ⚡ {c.similarCount} Citizen Reports Compiled
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs">
                      📍 {c.locality}
                    </span>
                  </div>

                  {/* Requirement: "Complaints made in any language should be send to authority in the language they have chosen." */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white">
                      {c.translatedDescriptions?.[authorityUser.language] || c.title}
                    </h3>
                    <p className="text-xs text-sky-100/90 leading-relaxed max-w-3xl">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-sky-200/80 pt-2">
                    <span>👤 Reporter: {c.reporterName} ({c.reporterPhone})</span>
                    <span>🕒 Reported: {new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Right Evidence & Actions */}
                <div className="flex sm:flex-row md:flex-col lg:flex-row items-center gap-4 shrink-0">
                  {c.photoUrl && (
                    <img src={c.photoUrl} alt="Evidence" className="w-24 h-24 rounded-2xl object-cover border border-white/20 shadow-md" />
                  )}

                  {c.status === 'resolved' ? (
                    <div className="px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-black text-center flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                      <span>Task Resolved</span>
                    </div>
                  ) : c.status === 'pending_resolution_poll' ? (
                    <div className="px-5 py-3 rounded-2xl bg-purple-500/20 border border-purple-400 text-purple-200 text-xs font-bold text-center">
                      <Clock className="w-6 h-6 text-purple-400 mb-1 mx-auto" />
                      <span>Auditing via Poll</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 text-[#0c2a4d] font-black text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition flex items-center space-x-2 shrink-0 border border-white/30"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Post Resolution Photo</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Proof Upload Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-lg glass-box border-white/25 shadow-2xl overflow-hidden p-6 text-white relative">
            <h3 className="text-xl font-black mb-2 flex items-center space-x-2">
              <span>📸 Post Resolution Evidence Picture</span>
            </h3>
            <p className="text-xs text-sky-200/80 mb-6 leading-snug">
              Requirement: Posting task completion photo sends locality people notification & poll. Resolution badge issues upon validation.
            </p>

            <div className="space-y-4">
              {proofUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-400/60 bg-black/40 h-52 flex items-center justify-center">
                  <img src={proofUrl} alt="Repair proof" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setProofUrl(null)}
                    className="absolute top-3 right-3 px-3 py-1 bg-red-500 rounded-lg text-white text-xs font-bold shadow"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <label className="cursor-pointer flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-sky-400 bg-white/5 transition text-center">
                    <Upload className="w-8 h-8 text-sky-300 mb-2" />
                    <span className="text-xs font-bold">Upload Photo File</span>
                    <input type="file" accept="image/*" onChange={handleSimulatedPhotoProof} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={simulateQuickRepairPhoto}
                    className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400 bg-white/5 transition text-center"
                  >
                    <Camera className="w-8 h-8 text-emerald-300 mb-2" />
                    <span className="text-xs font-bold">Snap Repair Camera</span>
                  </button>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  disabled={!proofUrl || uploading}
                  onClick={handlePostCompletion}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 text-[#0c2a4d] font-black text-xs uppercase tracking-wider shadow-xl disabled:opacity-50"
                >
                  {uploading ? 'Validating & Posting...' : 'Confirm & Launch Poll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
