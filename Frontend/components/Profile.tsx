
import React, { useState } from 'react';
import { Trophy, Star, Shield, Zap, Award, Flame, Medal, Edit3, Check, X } from 'lucide-react';
import { UserStats } from '../types';

const badgeConfig: Record<string, { icon: React.ReactNode, color: string, desc: string }> = {
  'Neural Pioneer': { icon: <Shield size={24} />, color: 'text-indigo-400 bg-indigo-400/10', desc: 'Completed first neural stress scan.' },
  'Knowledge Seeker': { icon: <Star size={24} />, color: 'text-rose-400 bg-rose-400/10', desc: 'Read all available intelligence modules.' },
  'Breath Master': { icon: <Zap size={24} />, color: 'text-cyan-400 bg-cyan-400/10', desc: 'Mastered the box breathing cycle.' },
  'Zen Master': { icon: <Award size={24} />, color: 'text-emerald-400 bg-emerald-400/10', desc: 'Completed a 15-minute meditation session.' }
};

const Profile: React.FC<{ userStats: UserStats; updateUserStats: (stats: UserStats) => void }> = ({ userStats, updateUserStats }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(userStats.username || 'Sojourner v1.0');

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      updateUserStats({ ...userStats, username: tempUsername.trim() });
      setIsEditingUsername(false);
    }
  };

  const handleUsernameCancel = () => {
    setTempUsername(userStats.username || 'Sojourner v1.0');
    setIsEditingUsername(false);
  };

  const displayUsername = userStats.username || 'Sojourner v1.0';
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="text-center py-10">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full gradient-bg animate-pulse blur-xl opacity-30" />
          <div className="relative w-full h-full rounded-full glass border-2 border-indigo-500/50 flex items-center justify-center bg-slate-900">
            <Trophy size={48} className="text-indigo-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-slate-900 border border-orange-500/50 flex items-center justify-center text-orange-400">
            <Flame size={20} />
          </div>
        </div>
        {isEditingUsername ? (
          <div className="flex items-center justify-center gap-3 mb-2">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              className="bg-slate-800/50 border border-indigo-500/30 rounded-lg px-4 py-2 text-center text-2xl font-bold text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              placeholder="Enter username"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUsernameSubmit();
                if (e.key === 'Escape') handleUsernameCancel();
              }}
              autoFocus
            />
            <button
              onClick={handleUsernameSubmit}
              className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              title="Save username"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleUsernameCancel}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{displayUsername}</h1>
            <button
              onClick={() => setIsEditingUsername(true)}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
              title="Edit username"
            >
              <Edit3 size={16} />
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <span className="px-4 py-1 rounded-full glass border-indigo-500/20 text-indigo-400 font-bold text-sm">LEVEL {Math.floor(userStats.points / 100) + 1}</span>
          <span className="px-4 py-1 rounded-full glass border-orange-500/20 text-orange-400 font-bold text-sm">{userStats.streak} DAY STREAK</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-[2.5rem] p-8 border border-white/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Medal size={20} className="text-indigo-400" />
            Neural Milestones
          </h3>
          <div className="space-y-4">
            {Object.keys(badgeConfig).map(badge => {
              const hasBadge = userStats.badges.includes(badge);
              const config = badgeConfig[badge];
              return (
                <div key={badge} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${hasBadge ? 'glass border-indigo-500/40 bg-indigo-500/5' : 'opacity-40 border-transparent bg-white/5 grayscale'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{badge}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{config.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass rounded-[2.5rem] p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-amber-400" />
              Biometric Data Points
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <StatsBox label="Total Points" value={userStats.points} />
              <StatsBox label="Active Streak" value={`${userStats.streak}d`} />
              <StatsBox label="Badges Earned" value={userStats.badges.length} />
              <StatsBox label="Status" value="Optimized" />
            </div>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <h3 className="font-bold text-xl mb-2 relative z-10">Next Evolution</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">Earn 50 more points to unlock the 'Digital Stoic' module.</p>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-white" style={{ width: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsBox: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export default Profile;
