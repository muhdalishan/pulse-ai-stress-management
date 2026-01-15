import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Activity, 
  Shield, 
  Code, 
  Database, 
  BarChart3,
  User,
  Heart,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Globe,
  Lock,
  Mail,
  Github,
  Linkedin
} from 'lucide-react';

const About: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we should scroll to meet the team section
    const state = location.state as { scrollToTeam?: boolean } | null;
    
    if (state?.scrollToTeam) {
      // Longer delay to ensure the page has fully rendered
      setTimeout(() => {
        const element = document.getElementById('meet-the-team');
        if (element) {
          // Use scrollIntoView with center positioning to ensure visibility
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 500);
    }
  }, [location]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Activity className="text-indigo-500 animate-pulse" size={48} />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-500">
            PULSE AI
          </h1>
        </div>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          An advanced AI-powered stress prediction and wellness management system that uses machine learning 
          to analyze your lifestyle patterns and provide personalized stress management recommendations.
        </p>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-indigo-500/20">
          <Brain className="text-indigo-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2 text-white">AI-Powered Analysis</h3>
          <p className="text-slate-400 text-sm">
            Advanced machine learning algorithms analyze 13+ lifestyle factors to predict stress levels with high accuracy.
          </p>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-emerald-500/20">
          <Target className="text-emerald-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2 text-white">84.3% Accuracy</h3>
          <p className="text-slate-400 text-sm">
            Our RandomForest model achieves 84.3% accuracy in stress prediction, validated on comprehensive datasets.
          </p>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-cyan-500/20">
          <Heart className="text-cyan-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2 text-white">Personalized Care</h3>
          <p className="text-slate-400 text-sm">
            Tailored wellness plans, insights, and recommendations based on your unique stress profile and lifestyle.
          </p>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="glass p-8 rounded-3xl border border-white/10">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
          <Code className="text-indigo-400" />
          Technical Architecture
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Backend */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              <Database size={20} />
              Backend Infrastructure
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-400 mt-1" size={16} />
                <div>
                  <p className="font-semibold text-slate-200">FastAPI Framework</p>
                  <p className="text-sm text-slate-400">High-performance Python web framework with automatic API documentation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-400 mt-1" size={16} />
                <div>
                  <p className="font-semibold text-slate-200">Machine Learning Pipeline</p>
                  <p className="text-sm text-slate-400">Scikit-learn RandomForest model with feature preprocessing and validation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-400 mt-1" size={16} />
                <div>
                  <p className="font-semibold text-slate-200">RESTful API Design</p>
                  <p className="text-sm text-slate-400">Clean, documented endpoints with comprehensive error handling</p>
                </div>
              </div>
            </div>
          </div>

          {/* Frontend */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <Globe size={20} />
              Frontend Experience
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-cyan-400 mt-1" size={16} />
                <div>
                  <p className="font-semibold text-slate-200">React + TypeScript</p>
                  <p className="text-sm text-slate-400">Modern, type-safe frontend with component-based architecture</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-cyan-400 mt-1" size={16} />
                <div>
                  <p className="font-semibold text-slate-200">Responsive Design</p>
                  <p className="text-sm text-slate-400">Tailwind CSS with glass morphism effects and dark mode support</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-cyan-400 mt-1" size={16} />
                <div>
                  <p className="font-semibold text-slate-200">Real-time Analytics</p>
                  <p className="text-sm text-slate-400">Interactive charts and visualizations for stress analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass p-8 rounded-3xl border border-white/10">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
          <BarChart3 className="text-amber-400" />
          How PULSE AI Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center">
              <User className="text-indigo-400" size={24} />
            </div>
            <h3 className="font-bold text-white">1. Data Input</h3>
            <p className="text-sm text-slate-400">
              You provide lifestyle information through our intuitive form interface
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
              <Brain className="text-purple-400" size={24} />
            </div>
            <h3 className="font-bold text-white">2. AI Analysis</h3>
            <p className="text-sm text-slate-400">
              Our ML model processes 13+ factors to predict your stress level
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <h3 className="font-bold text-white">3. Insights</h3>
            <p className="text-sm text-slate-400">
              Receive detailed analytics, visualizations, and personalized insights
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center">
              <Lightbulb className="text-cyan-400" size={24} />
            </div>
            <h3 className="font-bold text-white">4. Action Plan</h3>
            <p className="text-sm text-slate-400">
              Get tailored wellness recommendations and actionable improvement strategies
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="glass p-8 rounded-3xl border border-white/10">
        <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
          <Shield className="text-green-400" />
          Privacy & Security
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Lock className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-2">Local Processing</h3>
                <p className="text-slate-400 text-sm">
                  All data processing happens locally on your device. No personal information is stored on external servers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-2">Data Anonymization</h3>
                <p className="text-slate-400 text-sm">
                  Input data is processed anonymously without storing personal identifiers or sensitive information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-2">No Data Collection</h3>
                <p className="text-slate-400 text-sm">
                  We don't collect, store, or share your personal health information with third parties.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Globe className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white mb-2">Open Source</h3>
                <p className="text-slate-400 text-sm">
                  Transparent, auditable codebase ensures you know exactly how your data is being processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Developer */}
      <div id="meet-the-team" className="glass p-8 rounded-3xl border border-white/10">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
          <User className="text-purple-400" />
          Meet the Developer
        </h2>
        
        <div className="max-w-5xl mx-auto">
          {/* Split Layout - Left: Picture, Right: Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative">
            
            {/* Vertical Divider Line (Desktop Only) */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-600/50 to-transparent transform -translate-x-1/2"></div>
            
            {/* Left Side - Profile Picture & Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48 lg:w-56 lg:h-56">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse blur-xl opacity-30" />
                <div className="relative w-full h-full rounded-full glass border-2 border-indigo-500/50 overflow-hidden">
                  <img 
                    src="/images/alishan.jpg" 
                    alt="Muhammad Ali Shan" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Basic Info Below Picture - All Centered */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl lg:text-3xl font-bold text-white">Muhammad Alishan</h3>
                <p className="text-indigo-400 font-mono text-base">L1S23BSCS0050</p>
                <p className="text-lg text-slate-300 font-semibold">Full Stack Developer & AI Engineer</p>
              </div>
            </div>
            
            {/* Right Side - Description & Contact */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="max-w-xl">
                <h4 className="text-xl font-semibold text-slate-200 mb-4">About</h4>
                <p className="text-slate-400 leading-relaxed text-base">
                  Passionate AI engineer and full-stack developer specializing in machine learning applications for healthcare and wellness. 
                  Currently pursuing BSCS at University of Central Punjab, with expertise in Python, React, TypeScript, and ML frameworks. 
                  PULSE AI represents my commitment to leveraging artificial intelligence for mental health and stress management solutions.
                </p>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold text-slate-200 mb-4">Connect</h4>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a 
                    href="https://github.com/muhdalishan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                    title="GitHub Profile"
                  >
                    <Github size={18} />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                  <a 
                    href="https://linkedin.com/in/muhdalishan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    title="LinkedIn Profile"
                  >
                    <Linkedin size={18} />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                  <a 
                    href="mailto:l1s23bscs0050@ucp.edu.pk" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    title="Send Email"
                  >
                    <Mail size={18} />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Footer */}
      <div className="text-center space-y-4 pt-8 border-t border-white/10">
        <p className="text-slate-400">
          PULSE AI - Empowering wellness through artificial intelligence
        </p>
        <p className="text-sm text-slate-500">
          Built with React, TypeScript, Python, FastAPI, and Scikit-learn
        </p>
      </div>
    </div>
  );
};

export default About;