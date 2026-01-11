
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BrainCircuit, 
  MessageSquare, 
  BookOpen, 
  Wind, 
  Moon, 
  Sun, 
  LayoutDashboard,
  Menu,
  X,
  Activity,
  Trophy,
  User as UserIcon,
  Info,
  BarChart3
} from 'lucide-react';
import StressForm from './components/StressForm';
import Chatbot from './components/Chatbot';
import WellnessArticles from './components/WellnessArticles';
import ReliefTools from './components/ReliefTools';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import About from './components/About';
import Analytics from './components/Analytics';
import { UserStats } from './types';
import { setBackendHealthStatus } from './services/predictionService';

// API warming service
class APIWarmupService {
  private static instance: APIWarmupService;
  private isWarmedUp: boolean = false;
  private warmupPromise: Promise<void> | null = null;
  private analyticsCache: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): APIWarmupService {
    if (!APIWarmupService.instance) {
      APIWarmupService.instance = new APIWarmupService();
    }
    return APIWarmupService.instance;
  }

  async warmupAPI(): Promise<void> {
    if (this.warmupPromise) {
      return this.warmupPromise;
    }

    this.warmupPromise = this.performWarmup();
    return this.warmupPromise;
  }

  private async performWarmup(): Promise<void> {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    console.log('🔥 Warming up API backend...');

    try {
      // 1. Health check to wake up the server
      const healthPromise = fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // 2. Preload analytics data
      const analyticsPromise = fetch(`${apiUrl}/analytics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // Wait for both requests
      const [healthResponse, analyticsResponse] = await Promise.all([
        healthPromise,
        analyticsPromise
      ]);

      // Update prediction service health status
      const isHealthy = healthResponse.ok;
      setBackendHealthStatus(isHealthy);

      // Cache analytics data if successful
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        this.analyticsCache = analyticsData;
        this.cacheTimestamp = Date.now();
        console.log('📊 Analytics data preloaded and cached');
      }

      if (healthResponse.ok) {
        console.log('✅ Backend API warmed up successfully');
        this.isWarmedUp = true;
      } else {
        console.warn('⚠️ Backend health check failed, but server is responding');
      }

    } catch (error) {
      console.warn('⚠️ API warmup failed (this is normal if backend is not running):', error);
      // Update prediction service that backend is not healthy
      setBackendHealthStatus(false);
      // Don't throw error - app should still work with fallback data
    }
  }

  getCachedAnalytics(): any | null {
    if (this.analyticsCache && 
        Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      console.log('📊 Returning cached analytics data');
      return this.analyticsCache;
    }
    return null;
  }

  isAPIWarmedUp(): boolean {
    return this.isWarmedUp;
  }
}

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAPIWarming, setIsAPIWarming] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('pulse_user_stats');
    return saved ? JSON.parse(saved) : { points: 0, streak: 0, lastCheckIn: '', badges: [], username: 'Thomas Shelby' };
  });

  // API Warmup on app start
  useEffect(() => {
    const warmupService = APIWarmupService.getInstance();
    
    const performWarmup = async () => {
      try {
        await warmupService.warmupAPI();
      } catch (error) {
        console.warn('API warmup completed with warnings');
      } finally {
        setIsAPIWarming(false);
      }
    };

    performWarmup();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (userStats.lastCheckIn !== today) {
      const lastDate = userStats.lastCheckIn ? new Date(userStats.lastCheckIn) : null;
      const diff = lastDate ? (new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24) : null;
      
      setUserStats(prev => {
        const newStreak = diff === 1 ? prev.streak + 1 : 1;
        const newStats = { ...prev, streak: newStreak, lastCheckIn: today };
        localStorage.setItem('pulse_user_stats', JSON.stringify(newStats));
        return newStats;
      });
    }
  }, []);

  const addPoints = (amount: number, badge?: string) => {
    setUserStats(prev => {
      const newBadges = badge && !prev.badges.includes(badge) ? [...prev.badges, badge] : prev.badges;
      const newStats = { ...prev, points: prev.points + amount, badges: newBadges };
      localStorage.setItem('pulse_user_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const updateUserStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem('pulse_user_stats', JSON.stringify(newStats));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
              <Activity className="text-indigo-500 group-hover:animate-pulse" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-500">PULSE AI</span>
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink to="/predict" icon={<BrainCircuit size={18} />} label="Neural Scan" />
            <NavLink to="/chat" icon={<MessageSquare size={18} />} label="Pulse Bot" />
            <NavLink to="/articles" icon={<BookOpen size={18} />} label="Mind Lab" />
            <NavLink to="/tools" icon={<Wind size={18} />} label="Calm Space" />
            <NavLink to="/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
            <NavLink to="/about" icon={<Info size={18} />} label="About" />
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-indigo-500/20 text-indigo-400 font-bold text-sm">
              <Trophy size={16} />
              <span>{userStats.points}</span>
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full glass hover:bg-white/20 transition-all text-indigo-500"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </nav>

        <div className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className={`relative w-64 h-full glass border-r border-white/10 flex flex-col p-6 gap-6`}>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <Activity className="text-indigo-500" />
              <span>PULSE AI</span>
            </div>
            <div className="flex flex-col gap-4">
              <MobileNavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/predict" icon={<BrainCircuit size={20} />} label="Neural Scan" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/chat" icon={<MessageSquare size={20} />} label="PulseBotVault" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/articles" icon={<BookOpen size={20} />} label="MindLabZenith" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/tools" icon={<Wind size={20} />} label="CalmSpace" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/profile" icon={<UserIcon size={20} />} label="Evolution" onClick={() => setIsSidebarOpen(false)} />
              <MobileNavLink to="/about" icon={<Info size={20} />} label="About Us" onClick={() => setIsSidebarOpen(false)} />
            </div>
          </aside>
        </div>

        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard userStats={userStats} />} />
            <Route path="/predict" element={<StressForm addPoints={addPoints} />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/articles" element={<WellnessArticles addPoints={addPoints} />} />
            <Route path="/tools" element={<ReliefTools addPoints={addPoints} />} />
            <Route path="/analytics" element={<Analytics warmupService={APIWarmupService.getInstance()} />} />
            <Route path="/profile" element={<Profile userStats={userStats} updateUserStats={updateUserStats} />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 transition-all px-3 py-1 rounded-full ${isActive ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-indigo-400'}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/5 text-slate-400'}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default App;

// Export the warmup service for use in other components
export { APIWarmupService };
