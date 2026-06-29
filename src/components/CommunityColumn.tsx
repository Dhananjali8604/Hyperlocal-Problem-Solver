import React, { useState } from 'react';
import { Users, Vote, Award, CheckCircle2, AlertTriangle, MessageSquare, Plus, Sparkles, ThumbsUp, ThumbsDown, Trophy } from 'lucide-react';
import { User, CommunityPost, Complaint } from '../types';

interface CommunityColumnProps {
  user: User | null;
  posts: CommunityPost[];
  complaints: Complaint[];
  onResolutionVote: (complaintId: string, vote: 'yes' | 'no') => void;
  onTriageVote: (complaintId: string, vote: 'yes' | 'no') => void;
  onCreatePost: (post: Omit<CommunityPost, 'id' | 'createdAt'>) => void;
}

export const CommunityColumn: React.FC<CommunityColumnProps> = ({
  user,
  posts,
  complaints,
  onResolutionVote,
  onTriageVote,
  onCreatePost
}) => {
  const [filterPincode, setFilterPincode] = useState(user?.pincode || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQ, setPollQ] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onCreatePost({
      pincode: filterPincode || user?.pincode || '110001',
      title: newTitle,
      content: newContent,
      type: 'announcement',
      authorName: user?.name || 'Locality Citizen',
      ...(hasPoll ? {
        poll: { question: pollQ || newTitle, yesVotes: 0, noVotes: 0, voters: [] }
      } : {})
    });

    setNewTitle('');
    setNewContent('');
    setHasPoll(false);
    setPollQ('');
    setShowCreateModal(false);
  };

  // Filter posts
  const displayedPosts = posts.filter(p => !filterPincode || p.pincode.includes(filterPincode.trim()));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-600/30 via-emerald-600/30 to-sky-600/30 backdrop-blur-xl border border-white/20 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase font-mono">
            <Users className="w-3.5 h-3.5" /> Locality Civic Square
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Community Column &amp; Verification Polls
          </h2>
          <p className="text-xs text-sky-100/80 leading-relaxed">
            AI automatically dispatches neighbor polls to validate reported infrastructure hazards and verify municipal task completion photos before closing records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <input
            type="text"
            placeholder="Filter PIN Code..."
            value={filterPincode}
            onChange={e => setFilterPincode(e.target.value)}
            className="w-full sm:w-36 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
          />
          {user?.role === 'citizen' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Locality Post
            </button>
          )}
        </div>
      </div>

      {/* POSTS LIST */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/20 space-y-3">
            <MessageSquare className="w-10 h-10 text-sky-400 mx-auto opacity-60" />
            <h4 className="text-base font-bold">No Community Posts in PIN {filterPincode}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first citizen in your neighborhood to start a civic discussion or submit a hazard report.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5">
          {displayedPosts.map(post => {
            const cmp = post.complaintId ? complaints.find(c => c.id === post.complaintId) : null;
            const hasVoted = user && post.poll?.voters.includes(user.id);

            return (
              <div
                key={post.id}
                className={`rounded-3xl p-6 md:p-8 backdrop-blur-xl border shadow-xl relative overflow-hidden transition-all ${
                  post.type === 'resolution_poll' ? 'bg-gradient-to-br from-purple-900/40 via-slate-900/70 to-indigo-950/60 border-purple-400/40' :
                  post.type === 'hero_congrats' ? 'bg-gradient-to-br from-amber-900/40 via-slate-900/70 to-yellow-950/60 border-amber-400/50 shadow-amber-500/10' :
                  post.type === 'triage_poll' ? 'bg-gradient-to-br from-sky-900/40 via-slate-900/70 to-teal-950/60 border-sky-400/40' :
                  'bg-white/10 border-white/20'
                }`}
              >
                {/* Header tag */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900/90 border border-white/15 text-sky-200">
                      {post.type === 'resolution_poll' && '🗳️ Authority Work Verification Poll'}
                      {post.type === 'triage_poll' && '⚠️ Neighbor Triage Poll'}
                      {post.type === 'hero_congrats' && '🏆 Civic Hero Honor'}
                      {post.type === 'announcement' && '📢 Locality Notice'}
                    </span>
                    <span className="text-xs font-mono text-sky-100">📍 PIN: {post.pincode}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-white mb-2">{post.title}</h3>
                <p className="text-xs text-sky-100/90 leading-relaxed mb-4">{post.content}</p>

                {/* IF RESOLUTION POLL: Show Completion Photo baseline */}
                {cmp && cmp.completionPicture && post.type === 'resolution_poll' && (
                  <div className="my-4 p-4 rounded-2xl bg-slate-950/80 border border-purple-400/30 flex flex-col sm:flex-row items-center gap-4">
                    <img src={cmp.completionPicture} alt="Work Proof" className="w-full sm:w-40 h-28 rounded-xl object-cover shrink-0 border border-white/20" />
                    <div className="space-y-1 text-left">
                      <div className="text-xs font-bold text-purple-300">📸 Municipal Authority Proof of Completion</div>
                      <p className="text-[11px] text-slate-300">
                        Municipal team marked &quot;{cmp.title}&quot; as solved. Please inspect your locality and vote below.
                      </p>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE POLL SECTION */}
                {post.poll ? (
                  <div className="mt-4 pt-4 border-t border-white/15 space-y-3">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                      <Vote className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Poll Question: &quot;{post.poll.question}&quot;</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                      
                      {/* VOTE YES */}
                      <button
                        disabled={!user || hasVoted}
                        onClick={() => {
                          if (post.complaintId && post.type === 'resolution_poll') {
                            onResolutionVote(post.complaintId, 'yes');
                          } else if (post.complaintId && post.type === 'triage_poll') {
                            onTriageVote(post.complaintId, 'yes');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                          hasVoted ? 'bg-emerald-500/30 border-emerald-400 text-white cursor-not-allowed' :
                          'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-400/40 text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{post.type === 'resolution_poll' ? 'Yes, Satisfactorily Resolved!' : 'Yes, Problem Exists Here'}</span>
                        </div>
                        <span className="font-mono text-xs font-extrabold bg-slate-900/80 px-2.5 py-1 rounded-lg text-emerald-300">
                          {post.poll.yesVotes}
                        </span>
                      </button>

                      {/* VOTE NO */}
                      <button
                        disabled={!user || hasVoted}
                        onClick={() => {
                          if (post.complaintId && post.type === 'resolution_poll') {
                            onResolutionVote(post.complaintId, 'no');
                          } else if (post.complaintId && post.type === 'triage_poll') {
                            onTriageVote(post.complaintId, 'no');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                          hasVoted ? 'bg-rose-500/30 border-rose-400 text-white cursor-not-allowed' :
                          'bg-rose-500/15 hover:bg-rose-500/25 border-rose-400/40 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{post.type === 'resolution_poll' ? 'No, Issue Still Pertains' : 'No, False Report'}</span>
                        </div>
                        <span className="font-mono text-xs font-extrabold bg-slate-900/80 px-2.5 py-1 rounded-lg text-rose-300">
                          {post.poll.noVotes}
                        </span>
                      </button>

                    </div>

                    {hasVoted && (
                      <div className="text-[11px] text-sky-200 font-mono">
                        ✓ Your verified resident poll vote has been recorded on the civic ledger.
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>✍️ Posted by: <strong className="text-white">{post.authorName}</strong></span>
                  <span>PACT Civic Community Network</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE LOCALITY POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black flex items-center gap-2 text-sky-300">
                <MessageSquare className="w-5 h-5" /> Create Locality Post (PIN {filterPincode || user?.pincode})
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sky-200 mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Volunteer Drive for Park Cleanliness this Sunday"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-200 mb-1">Content / Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share community updates or ask neighbors a question..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-300">
                  <input type="checkbox" checked={hasPoll} onChange={e => setHasPoll(e.target.checked)} className="rounded" />
                  <span>Attach YES/NO Locality Poll</span>
                </label>
                {hasPoll && (
                  <input
                    type="text"
                    placeholder="Poll Question (e.g. Should we request new speed breakers?)"
                    value={pollQ}
                    onChange={e => setPollQ(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/20 text-xs text-white mt-2"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 bg-white/10 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-emerald-500 font-extrabold text-xs rounded-xl shadow-lg">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
