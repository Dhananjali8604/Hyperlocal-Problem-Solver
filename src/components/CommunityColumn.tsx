import React from 'react';
import {
  Award,
  Vote,
  CheckCircle2,
  XCircle,
  MessageSquareQuote,
  Sparkles,
  MapPin,
  Trophy,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Poll, CommunityPost, User } from '../types';

interface CommunityColumnProps {
  user: User;
  polls: Poll[];
  posts: CommunityPost[];
  onVotePoll: (pollId: string, choice: 'yes' | 'no') => void;
}

export const CommunityColumn: React.FC<CommunityColumnProps> = ({
  user,
  polls,
  posts,
  onVotePoll,
}) => {
  // Filter for locality
  const activePolls = polls.filter((p) => p.status === 'active');

  return (
    <div className="space-y-10 pb-16">
      {/* Community Banner */}
      <div className="glass-box border-white/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Vote className="w-3.5 h-3.5 text-emerald-300" />
            <span>Hyperlocal Neighborhood Hub • PIN: {user.pincode}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Locality Verification Polls & Hero Recognition
          </h1>
          <p className="text-sm text-sky-100/90 max-w-3xl leading-relaxed">
            PACT AI posts automated geospatial polls asking neighborhood citizens to confirm active hazards or audit municipal repair claims. Every validated confirmation builds civic truth and awards official badges.
          </p>
        </div>
      </div>

      {/* Monthly Outstanding Community Hero Showcase Requirement */}
      <div className="glass-box border-emerald-400/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-400 text-[#0c2a4d]">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                Monthly Showcase • PACT AI Analytics
              </span>
              <h2 className="text-2xl font-black text-white">🏆 Outstanding Community Heroes of the Month</h2>
            </div>
          </div>

          <p className="text-xs text-sky-100/80 mb-6 max-w-2xl">
            Requirement: Top three citizens who earned the most badges at the end of each month in this locality are notified and congratulated for outstanding civic service.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Rank 1 */}
            <div className="glass-box bg-amber-500/20 border-amber-400/50 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-[#0c2a4d] font-black text-xs font-mono">
                    🥇 1st Place
                  </span>
                  <Award className="w-6 h-6 text-amber-400 animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-white">Aarav Sharma</h3>
                <p className="text-xs text-amber-200/90 mt-1">📍 Indiranagar Sector • 3 Badges</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-sky-100">
                ⭐ "First to report water main burst & streetlight pole issues."
              </div>
            </div>

            {/* Rank 2 */}
            <div className="glass-box bg-slate-400/20 border-slate-300/40 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-slate-300 text-[#0c2a4d] font-black text-xs font-mono">
                    🥈 2nd Place
                  </span>
                  <Award className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-white">Sneha Reddy</h3>
                <p className="text-xs text-slate-200/90 mt-1">📍 Indiranagar Sector • 2 Badges</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-sky-100">
                ⭐ "Prompt reporting of sanitation waste accumulation hazards."
              </div>
            </div>

            {/* Rank 3 */}
            <div className="glass-box bg-amber-700/30 border-amber-600/40 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-black text-xs font-mono">
                    🥉 3rd Place
                  </span>
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-black text-white">Rohit Menon</h3>
                <p className="text-xs text-amber-200/90 mt-1">📍 Indiranagar Sector • 2 Badges</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-sky-100">
                ⭐ "Active poll validator & community vigilance volunteer."
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Automated Polls Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-black uppercase tracking-wider text-sky-200 flex items-center space-x-2">
          <span>🤖 Active AI Locality Verification Polls ({activePolls.length})</span>
        </h2>

        {activePolls.length === 0 ? (
          <div className="p-10 glass-box border-white/15 text-center">
            <ShieldCheck className="w-12 h-12 text-sky-400 mx-auto mb-2" />
            <p className="text-base font-bold text-white">No active verification polls pending in your sector.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePolls.map((poll) => {
              const totalVotes = poll.yesVotes + poll.noVotes;
              const yesPercent = totalVotes > 0 ? Math.round((poll.yesVotes / totalVotes) * 100) : 50;
              const noPercent = totalVotes > 0 ? 100 - yesPercent : 50;
              const hasVoted = poll.votedUserIds.includes(user.id);

              return (
                <div
                  key={poll.id}
                  className="glass-box border-white/20 p-6 shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                          poll.type === 'issue_validation'
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                            : 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                        }`}
                      >
                        {poll.type === 'issue_validation' ? '⚠️ Issue Truth Audit' : '🛠️ Repair Claim Audit'}
                      </span>
                      <span className="text-xs text-sky-200/80 font-mono">📍 {poll.locality}</span>
                    </div>

                    <h3 className="text-base font-black text-white mb-4 leading-snug">
                      {poll.question}
                    </h3>

                    {/* Poll Bars */}
                    <div className="space-y-3 mb-6">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-emerald-300 mb-1">
                          <span>Yes / Confirmed ({poll.yesVotes})</span>
                          <span>{yesPercent}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${yesPercent}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-red-300 mb-1">
                          <span>No / False Report ({poll.noVotes})</span>
                          <span>{noPercent}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500" style={{ width: `${noPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting Actions */}
                  <div className="pt-4 border-t border-white/10">
                    {hasVoted ? (
                      <div className="py-2.5 rounded-xl bg-white/10 border border-white/20 text-center text-xs font-bold text-sky-200 flex items-center justify-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>You have voted on this locality poll. Thank you!</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => onVotePoll(poll.id, 'yes')}
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-[#0c2a4d] font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Yes (हाँ)</span>
                        </button>
                        <button
                          onClick={() => onVotePoll(poll.id, 'no')}
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>No (नहीं)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* General Feed Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-sky-200">
          📰 Locality Bulletin Feed
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="glass-box border-white/15 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-300 uppercase">📌 {post.locality}</span>
                <span className="text-[10px] text-sky-200/70">{new Date(post.createdAt).toLocaleTimeString()}</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">{post.title}</h3>
              <p className="text-xs text-sky-100 leading-relaxed">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
