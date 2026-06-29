import React from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Complaint, AuthorityEvaluation, User } from '../types';

interface ResolvedPageProps {
  currentUser: User;
  resolvedComplaints: Complaint[];
  authorities: AuthorityEvaluation[];
}

export const ResolvedPage: React.FC<ResolvedPageProps> = ({
  currentUser,
  resolvedComplaints,
  authorities,
}) => {
  // Sort authorities by rank
  const topAuthorities = [...authorities].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <div className="glass-box border-emerald-400/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Public Civic Audit & Transparency Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Resolved Records & Municipal Rankings
          </h1>
          <p className="text-sm text-sky-100/90 max-w-3xl leading-relaxed">
            Public Hall of Fame holding permanent timestamped records of every resolved civic complaint. Municipal authorities undergo monthly AI data evaluations measuring turnaround speed and task completion efficiency.
          </p>
        </div>
      </div>

      {/* Top 3 Best Performed Municipal Authority Showcase Requirement */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-400 text-[#0c2a4d]">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                Monthly AI Data Evaluation
              </span>
              <h2 className="text-2xl font-black text-white">🏆 Top 3 Best Performing Municipal Authorities</h2>
            </div>
          </div>
          <span className="hidden sm:inline px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-mono">
            Evaluated by PACT AI Analytics
          </span>
        </div>

        <p className="text-xs text-sky-100/80 max-w-3xl">
          Requirement: Posting top three best performed municipal authorities along with their name, district, and state. Monthly AI remarks analyze turnaround speed and task efficiency.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {topAuthorities.slice(0, 3).map((auth, index) => (
            <div
              key={auth.id}
              className={`glass-box p-7 shadow-2xl border flex flex-col justify-between relative overflow-hidden transition hover:translate-y-[-4px] ${
                index === 0
                  ? 'bg-gradient-to-b from-amber-500/25 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20'
                  : index === 1
                  ? 'bg-gradient-to-b from-slate-400/25 border-slate-300 shadow-slate-500/10'
                  : 'bg-gradient-to-b from-amber-700/25 border-amber-600/60'
              }`}
            >
              <div>
                {/* Rank Badge Header */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs font-mono tracking-wider ${
                      index === 0
                        ? 'bg-amber-400 text-[#0c2a4d] shadow-md'
                        : index === 1
                        ? 'bg-slate-300 text-[#0c2a4d]'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    Rank #{auth.rank} • {index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : '🥉 3rd'}
                  </span>
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 text-xs font-black font-mono">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{auth.efficiencyScore}% Index</span>
                  </div>
                </div>

                {/* Name & Location */}
                <h3 className="text-xl font-black text-white leading-snug mb-2">
                  {auth.name}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-amber-200/90 font-semibold mb-6 pb-4 border-b border-white/15">
                  <MapPin className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                  <span>District: {auth.district} • State: {auth.state}</span>
                </div>

                {/* AI Monthly Remark Requirement */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1.5 mb-6">
                  <div className="flex items-center space-x-1 text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Monthly Performance Remark</span>
                  </div>
                  <p className="text-xs text-sky-100 italic leading-relaxed">
                    "{auth.aiMonthlyRemark}"
                  </p>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10 text-center">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-sky-200/70 block uppercase font-semibold">Resolved Matters</span>
                  <span className="text-base font-black text-emerald-300 font-mono">{auth.resolvedCount}/{auth.totalComplaints}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-sky-200/70 block uppercase font-semibold">Avg Turnaround</span>
                  <span className="text-base font-black text-sky-300 font-mono">{auth.avgResolutionTimeHours} Hours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Authorities Ranking List Requirement: "Other municipal authorities can see their ranking after a monthly evaluation." */}
      <div className="glass-box border-white/20 p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-sky-200 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-amber-300" />
          <span>Full National Municipal Authority Leaderboard</span>
        </h3>
        <p className="text-xs text-sky-100/80">
          All registered municipal authorities can review their national and regional monthly evaluations below.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/15 text-[11px] font-bold uppercase tracking-wider text-sky-300 bg-white/5">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Authority Office</th>
                <th className="py-3 px-4">District & State</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Avg Time</th>
                <th className="py-3 px-4 text-right">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs text-white">
              {topAuthorities.map((auth) => (
                <tr key={auth.id} className={`hover:bg-white/10 transition ${currentUser.pincode === auth.pincode ? 'bg-sky-500/20 font-bold' : ''}`}>
                  <td className="py-3.5 px-4 font-mono font-black text-amber-300">#{auth.rank}</td>
                  <td className="py-3.5 px-4 font-bold">{auth.name} {currentUser.pincode === auth.pincode && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-400 text-[#0c2a4d]">(Your Office)</span>}</td>
                  <td className="py-3.5 px-4 text-sky-100">{auth.district}, {auth.state}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-300">{auth.resolvedCount}/{auth.totalComplaints}</td>
                  <td className="py-3.5 px-4 font-mono">{auth.avgResolutionTimeHours}h</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-mono font-black">
                      {auth.efficiencyScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved Hall of Fame Records List Requirement */}
      <div className="space-y-6">
        <h2 className="text-xl font-black uppercase tracking-wider text-sky-200 flex items-center justify-between">
          <span>📜 Permanent Record of Resolved Complaints ({resolvedComplaints.length})</span>
          <span className="text-xs font-normal text-sky-200/70">Verified completion proofs & citizen badges</span>
        </h2>

        {resolvedComplaints.length === 0 ? (
          <div className="p-10 glass-box border-white/15 text-center">
            <Clock className="w-10 h-10 text-sky-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No complaints have been finalized as resolved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resolvedComplaints.map((c) => (
              <div
                key={c.id}
                className="glass-box border-emerald-400/40 p-6 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-[10px] font-black uppercase tracking-wider font-mono">
                      ✅ Resolved & Certified
                    </span>
                    <span className="text-xs text-sky-200/80 font-mono">
                      Completed: {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-1">{c.title}</h3>
                  <p className="text-xs text-sky-100/90 mb-4 leading-relaxed">{c.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {c.photoUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-white/20 h-28 bg-black/30">
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-bold text-sky-200">Before</span>
                        <img src={c.photoUrl} alt="Before" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {c.proofPhotoUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-emerald-400/50 h-28 bg-black/30">
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-600 text-[9px] font-bold text-white">After (Task Proof)</span>
                        <img src={c.proofPhotoUrl} alt="After" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-200">
                  <span>📍 {c.locality}</span>
                  <span className="font-bold text-emerald-300">🎖️ Hero Badge: Issued to {c.reporterName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
