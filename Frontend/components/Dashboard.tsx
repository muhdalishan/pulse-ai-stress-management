
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  MessageSquare, 
  Wind, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Flame,
  Trophy,
  Info,
  Users
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserStats } from '../types';

const dummyData = [
  { name: 'Mon', value: 30 }, { name: 'Tue', value: 45 }, { name: 'Wed', value: 25 },
  { name: 'Thu', value: 60 }, { name: 'Fri', value: 50 }, { name: 'Sat', value: 20 }, { name: 'Sun', value: 15 },
];

const Dashboard: React.FC<{ userStats: UserStats }> = ({ userStats }) => {
  const navigate = useNavigate();

  const handleAboutUsClick = () => {
    navigate('/about', { state: { scrollToTeam: true } });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">
            Welcome, <span className="text-indigo-500">{userStats.username || 'Thomas Shelby'}</span>
          </h1>
          <p className="text-slate-400">Your stress signals are <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">stabilizing</span>.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-orange-500/20 text-orange-400 font-bold">
            <Flame size={20} className="animate-bounce" />
            <span>{userStats.streak} Day Streak</span>
          </div>
          <Link to="/predict" className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={18} />
            Scan Pulse
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-400" />
                Wellness Trend
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Live Telemetry
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ color: '#818cf8' }} />
                  <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard to="/chat" title="Pulse Bot" desc="Immediate AI-driven emotional buffering." icon={<MessageSquare className="text-purple-400" />} accent="purple" />
            <FeatureCard to="/tools" title="Calm Space" desc="Dynamic breathing and meditation modules." icon={<Wind className="text-cyan-400" />} accent="cyan" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass rounded-[2rem] p-6 border border-white/10">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <Trophy size={18} className="text-indigo-400" />
              Wellness Progress
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Current Points</span>
                <span className="text-white font-bold">{userStats.points}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(userStats.points % 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">{100 - (userStats.points % 100)} points to next level</p>
            </div>
          </div>

          <div onClick={handleAboutUsClick} className="group glass rounded-3xl p-8 border border-white/10 hover:border-indigo-500/50 transition-all shadow-xl relative overflow-hidden cursor-pointer">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">Meet the Team</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Learn more about PULSE AI and meet the development team.</p>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">Learn More <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ to: string; title: string; desc: string; icon: React.ReactNode; accent: string }> = ({ to, title, desc, icon, accent }) => (
  <Link to={to} className={`group glass rounded-3xl p-8 border border-white/10 hover:border-indigo-500/50 transition-all shadow-xl relative overflow-hidden`}>
    <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-${accent}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
    <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">Synchronize <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></div>
  </Link>
);

export default Dashboard;
