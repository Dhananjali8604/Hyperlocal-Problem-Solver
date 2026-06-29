import React from 'react';
import { Trophy, CheckCircle2, Award, Clock, Building2, Sparkles, ShieldCheck, FileText, Calendar } from 'lucide-react';
import { User, Complaint, MunicipalRanking } from '../types';

interface ResolvedLedgerProps {
  user: User | null;
  complaints: Complaint[];
  rankings: MunicipalRanking[];
}

export const ResolvedLedger: React.FC<ResolvedLedgerProps> = ({
  user,
  complaints,
  rankings
}) => {
  const resolvedCases = complaints.filter(c => c.status === 'resolved');

  // Top 3 authorities
  const topThree = rankings.slice(0, 3);
  const myRanking = user?.role === 'authority' ? rankings.find(r => r.pincode === user.pincode) : null;

  return (
    <div className="space-y-12 pb-16">
      
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700/30 via-emerald-800/40 to-sky-700/30 backdrop-blur-xl border border-white/20 p-6 md:p-10 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-mono font-bold uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" /> Civic Transparency Ledger
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">
          Resolved Ledger &amp; AI Municipal Evaluations
        </h2>
        <p className="text-xs md:text-sm text-sky-100/80 max-w-3xl leading-relaxed">
          Holding immutable public records of satisfactorily completed civic repairs along with monthly AI evaluations measuring response speed and efficiency across Indian municipal districts.
        </p>
      </div>

      {/* TOP 3 BEST PERFORMING MUNICIPAL AUTHORITIES REQUIREMENT */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/15 pb-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-amber-300">
              <Trophy className="w-6 h-6 text-amber-400" /> Top 3 Best Performing Municipal Authorities
            </h3>
            <p className="text-xs text-sky-200/70 mt-0.5">Monthly efficiency remarks evaluated by AI from resolution speed &amp; resident polls</p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30">
            Monthly National Showcase
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topThree.map((item, index) => {
            const medalColor = index === 0 ? 'from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-amber-500/20' :
                             index === 1 ? 'from-slate-300 via-slate-100 to-slate-400 text-slate-950 shadow-slate-400/20' :
                             'from-amber-700 via-amber-600 to-amber-800 text-white shadow-amber-800/20';
            
            const badgeIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

            return (
              <div
                key={item.pincode}
                className={`rounded-3xl p-6 md:p-8 backdrop-blur-xl border shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.02] ${
                  index === 0 ? 'bg-gradient-to-br from-amber-950/50 via-slate-900/80 to-slate-900 border-amber-400/60 ring-2 ring-amber-400/40' :
                  'bg-white/10 border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{badgeIcon}</span>
                    <div className={`px-3 py-1 rounded-xl font-black font-mono text-xs bg-gradient-to-r shadow-lg ${medalColor}`}>
                      Rank #{item.rank || index + 1}
                    </div>
                  </div>

                  <h4 className="text-xl font-extrabold tracking-tight text-white leading-snug">{item.authorityName}</h4>
                  
                  <div className="flex items-center gap-1.5 text-xs font-mono text-sky-200 mt-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{item.district}, {item.state}</span>
                  </div>

                  {/* AI Remark Box */}
                  <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Evaluation Remark:</span>
                      <span>Score: {item.efficiencyScore}/100</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">&quot;{item.aiRemark}&quot;</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-sky-100">
                  <span>📌 PIN: {item.pincode}</span>
                  <span>⚡ Avg: {item.avgHoursToResolve}h to solve</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUTHORITY SPECIFIC JURISDICTIONAL RANKING VIEW */}
      {user?.role === 'authority' && (
        <div className="rounded-3xl bg-gradient-to-br from-teal-900/50 via-slate-900/80 to-emerald-950/60 border border-emerald-400/50 p-6 md:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Your Jurisdictional Monthly Evaluation Record
            </h4>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400/30">
              PIN: {user.pincode}
            </span>
          </div>

          {myRanking ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 text-center">
                <div className="text-xs text-slate-400 uppercase font-mono">Current Ranking</div>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">#{myRanking.rank}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">Efficiency: {myRanking.efficiencyScore}%</div>
              </div>

              <div className="sm:col-span-3 space-y-2">
                <h5 className="font-bold text-lg text-white">{myRanking.authorityName} ({myRanking.district}, {myRanking.state})</h5>
                <p className="text-xs text-sky-100 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <strong className="text-emerald-300">AI Remark:</strong> {myRanking.aiRemark}
                </p>
                <div className="flex gap-4 text-xs font-mono text-slate-300">
                  <span>✓ Cases Solved: {myRanking.resolvedCount}</span>
                  <span>🕒 Avg Turnaround: {myRanking.avgHoursToResolve} Hours</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-300">
              Your municipal office (PIN {user.pincode}) is currently accumulating resolution data for this evaluation cycle.
            </p>
          )}
        </div>
      )}

      {/* RESOLVED CASES ARCHIVE TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-300" /> Public Resolved Archive Ledger
          </h3>
          <span className="text-xs font-mono text-sky-200">
            {resolvedCases.length} Total Resolved Case{resolvedCases.length === 1 ? '' : 's'}
          </span>
        </div>

        {resolvedCases.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/20">
            <Clock className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400">No resolved complaints recorded yet. Once verified municipal completion photos pass resident polling, records appear here.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4">
          {resolvedCases.map(cmp => {
            const timeDiffHrs = cmp.resolvedAt ? Math.round((cmp.resolvedAt - cmp.createdAt) / 3600000) : 32;

            return (
              <div
                key={cmp.id}
                className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/30 transition"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Completion picture */}
                  <img src={cmp.completionPicture || cmp.mediaUrl} alt="Resolved" className="w-20 h-20 rounded-2xl object-cover border border-emerald-400/40 shrink-0 shadow-lg" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                        ✅ Resolved Record
                      </span>
                      <span className="text-xs font-mono text-sky-200">PIN: {cmp.pincode}</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white leading-snug">{cmp.title}</h4>
                    <p className="text-xs text-slate-300 truncate max-w-md">{cmp.locality} &bull; Reported by {cmp.reporterName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-col items-end justify-between w-full md:w-auto gap-2 border-t md:border-t-0 border-white/10 pt-3 md:pt-0 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono text-emerald-300 font-bold">⏱️ Completed in ~{timeDiffHrs > 0 ? timeDiffHrs : 24} Hours</div>
                    <div className="text-[11px] font-mono text-slate-400">{cmp.resolvedAt ? new Date(cmp.resolvedAt).toLocaleDateString() : 'June 2026'}</div>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded bg-white/10 text-sky-200 border border-white/10">
                    Badge Issued #PACT
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
