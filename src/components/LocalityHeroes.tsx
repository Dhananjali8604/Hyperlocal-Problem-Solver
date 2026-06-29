import React, { useState } from 'react';
import { Award, Trophy, Users, CheckCircle2, Sparkles, MapPin, Download, Share2, FileText } from 'lucide-react';
import { User, Badge } from '../types';

interface LocalityHeroesProps {
  user: User | null;
  badges: Badge[];
  onSelectBadge: (badge: Badge) => void;
}

export const LocalityHeroes: React.FC<LocalityHeroesProps> = ({
  user,
  badges,
  onSelectBadge
}) => {
  const [filterPincode, setFilterPincode] = useState(user?.pincode || '110001');

  // Filter badges
  const localityBadges = badges.filter(c => !filterPincode || c.pincode.includes(filterPincode.trim()));

  // Aggregate by user
  const heroCounts: Record<string, { name: string; count: number; userId: string }> = {};
  localityBadges.forEach(c => {
    if (!heroCounts[c.userId]) {
      heroCounts[c.userId] = { name: c.userName, count: 0, userId: c.userId };
    }
    heroCounts[c.userId].count += 1;
  });

  const topHeroes = Object.values(heroCounts).sort((a, b) => b.count - a.count).slice(0, 3);

  // If demo has fewer heroes, add honorable sample civic leaders
  if (topHeroes.length < 3 && filterPincode === '110001') {
    if (!topHeroes.find(h => h.name === 'Rajesh Sharma')) topHeroes.push({ name: 'Rajesh Sharma', count: 3, userId: 'user-rajesh' });
    if (!topHeroes.find(h => h.name === 'Priya Verma')) topHeroes.push({ name: 'Priya Verma', count: 2, userId: 'user-priya' });
    if (!topHeroes.find(h => h.name === 'Sunil Gupta')) topHeroes.push({ name: 'Sunil Gupta', count: 2, userId: 'u-sunil' });
  }

  return (
    <div className="space-y-12 pb-16">
      
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-emerald-600/30 backdrop-blur-xl border border-white/20 p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase">
            <Award className="w-3.5 h-3.5" /> Neighborhood Hall of Honor
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Outstanding Locality Heroes
          </h2>
          <p className="text-xs md:text-sm text-sky-100/80 leading-relaxed">
            Congratulating the top three citizens in each locality PIN code who submitted verified hazard reports and earned official PACT Social Service Badges.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <div className="relative w-full sm:w-44">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-amber-300" />
            <input
              type="text"
              placeholder="Locality PIN..."
              value={filterPincode}
              onChange={e => setFilterPincode(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* PODIUM SECTION */}
      <div className="space-y-6">
        <div className="border-b border-white/15 pb-3">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-amber-300">
            <Trophy className="w-6 h-6 text-amber-400" /> Top 3 Locality Heroes (PIN {filterPincode})
          </h3>
          <p className="text-xs text-sky-200/70">End-of-month civic recognition broadcasted in community posts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {topHeroes.map((hero, i) => {
            const crown = i === 0 ? '👑 1st Place Hero' : i === 1 ? '🥈 2nd Place Hero' : '🥉 3rd Place Hero';
            const cardStyle = i === 0 ? 'bg-gradient-to-br from-amber-500/25 via-yellow-600/15 to-slate-900 border-amber-400/60 shadow-xl shadow-amber-500/15 scale-[1.02]' : 'bg-white/10 border-white/20';

            return (
              <div
                key={hero.userId || hero.name}
                className={`rounded-3xl p-6 md:p-8 backdrop-blur-xl border text-center transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px] ${cardStyle}`}
              >
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-900/80 border border-white/15 text-xs font-mono font-bold text-amber-300 mb-4 shadow">
                    {crown}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-400 p-0.5 mx-auto mb-3 shadow-lg">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-2xl text-white">
                      {hero.name.charAt(0)}
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-white">{hero.name}</h4>
                  <div className="text-xs font-mono text-sky-200 mt-1">Locality PIN: {filterPincode}</div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 bg-slate-950/40 -mx-6 -mb-6 p-4">
                  <div className="text-2xl font-black font-mono text-emerald-400">{hero.count}</div>
                  <div className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">Badges Earned</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT CERTIFICATES EARNED LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Recent PACT Badges Issued
          </h3>
          <span className="text-xs font-mono text-sky-200">Click badge to inspect</span>
        </div>

        {localityBadges.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/20">
            <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400">No social service badges issued in this PIN code yet.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localityBadges.map(badge => (
            <div
              key={badge.id}
              onClick={() => onSelectBadge(badge)}
              className="cursor-pointer rounded-3xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-emerald-400/50 p-6 shadow-xl transition space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${badge.badgeType === 'Gold' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : badge.badgeType === 'Silver' ? 'bg-slate-300/20 text-slate-300 border-slate-400/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
                    {badge.badgeType}
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    {badge.badgeNumber}
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-300 opacity-0 group-hover:opacity-100 transition" />
              </div>

              <h4 className="font-extrabold text-sm text-white leading-snug group-hover:text-emerald-300 transition">{badge.complaintTitle}</h4>
              
              <div className="text-xs text-slate-300">
                Awarded to <strong className="text-white">{badge.userName}</strong>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>📍 {badge.pincode}</span>
                <span>{new Date(badge.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
