
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCcw,
  Zap,
  Activity,
  Heart,
  CalendarCheck,
  ArrowRight,
  Brain,
  Target,
  BarChart3,
  TrendingUp,
  PieChart,
  Moon,
  Briefcase,
  Smartphone,
  Coffee,
  Dumbbell,
  Clock
} from 'lucide-react';
import { PredictionResult, StressLevel, StressPredictionData } from '../types';

const StressResultCard: React.FC<{ 
  result: PredictionResult; 
  inputData?: StressPredictionData;
  onReset: () => void 
}> = ({ result, inputData, onReset }) => {
  const getLevelColor = () => {
    switch (result.level) {
      case StressLevel.LOW: return 'text-emerald-400 border-emerald-500/20 shadow-emerald-500/10';
      case StressLevel.MEDIUM: return 'text-amber-400 border-amber-500/20 shadow-amber-500/10';
      case StressLevel.HIGH: return 'text-rose-400 border-rose-500/20 shadow-rose-500/10';
      default: return 'text-indigo-400';
    }
  };

  const getLevelBg = () => {
    switch (result.level) {
      case StressLevel.LOW: return 'bg-emerald-500/20';
      case StressLevel.MEDIUM: return 'bg-amber-500/20';
      case StressLevel.HIGH: return 'bg-rose-500/20';
      default: return 'bg-indigo-500/20';
    }
  };

  // Generate lifestyle factors based on actual input data
  const getLifestyleFactors = () => {
    if (!inputData) {
      // Fallback data if no input provided
      return [
        { label: 'Sleep Quality', value: result.level === StressLevel.HIGH ? 85 : result.level === StressLevel.MEDIUM ? 60 : 30, color: 'bg-blue-500', icon: Moon },
        { label: 'Work Load', value: result.level === StressLevel.HIGH ? 90 : result.level === StressLevel.MEDIUM ? 65 : 25, color: 'bg-purple-500', icon: Briefcase },
        { label: 'Physical Activity', value: result.level === StressLevel.HIGH ? 20 : result.level === StressLevel.MEDIUM ? 45 : 80, color: 'bg-green-500', icon: Dumbbell },
        { label: 'Screen Time', value: result.level === StressLevel.HIGH ? 85 : result.level === StressLevel.MEDIUM ? 60 : 35, color: 'bg-yellow-500', icon: Smartphone }
      ];
    }

    // Calculate stress impact based on actual input data
    const sleepStress = Math.max(0, Math.min(100, (7 - inputData.sleepDuration) * 20 + (5 - inputData.sleepQuality) * 15));
    const workStress = Math.max(0, Math.min(100, (inputData.workHours - 8) * 8 + inputData.travelTime * 10));
    const activityStress = Math.max(0, Math.min(100, (3 - inputData.physicalActivity) * 25));
    const screenStress = Math.max(0, Math.min(100, (inputData.screenTime - 6) * 8));
    const caffeineStress = Math.max(0, Math.min(100, inputData.caffeineIntake * 15));
    const socialStress = Math.max(0, Math.min(100, (4 - inputData.socialInteractions) * 20));

    return [
      { 
        label: 'Sleep Impact', 
        value: sleepStress, 
        color: sleepStress > 60 ? 'bg-red-500' : sleepStress > 30 ? 'bg-yellow-500' : 'bg-green-500', 
        icon: Moon,
        detail: `${inputData.sleepDuration}h sleep, quality ${inputData.sleepQuality}/5`
      },
      { 
        label: 'Work Stress', 
        value: workStress, 
        color: workStress > 60 ? 'bg-red-500' : workStress > 30 ? 'bg-yellow-500' : 'bg-green-500', 
        icon: Briefcase,
        detail: `${inputData.workHours}h work + ${inputData.travelTime}h travel`
      },
      { 
        label: 'Activity Level', 
        value: activityStress, 
        color: activityStress > 60 ? 'bg-red-500' : activityStress > 30 ? 'bg-yellow-500' : 'bg-green-500', 
        icon: Dumbbell,
        detail: `${inputData.physicalActivity}/5 activity, ${inputData.exerciseType}`
      },
      { 
        label: 'Screen Time', 
        value: screenStress, 
        color: screenStress > 60 ? 'bg-red-500' : screenStress > 30 ? 'bg-yellow-500' : 'bg-green-500', 
        icon: Smartphone,
        detail: `${inputData.screenTime}h daily screen time`
      },
      { 
        label: 'Caffeine Impact', 
        value: caffeineStress, 
        color: caffeineStress > 60 ? 'bg-red-500' : caffeineStress > 30 ? 'bg-yellow-500' : 'bg-green-500', 
        icon: Coffee,
        detail: `${inputData.caffeineIntake} cups per day`
      },
      { 
        label: 'Social Support', 
        value: socialStress, 
        color: socialStress > 60 ? 'bg-red-500' : socialStress > 30 ? 'bg-yellow-500' : 'bg-green-500', 
        icon: Heart,
        detail: `${inputData.socialInteractions}/5 social interactions`
      }
    ].sort((a, b) => b.value - a.value).slice(0, 4); // Show top 4 factors
  };

  const lifestyleFactors = getLifestyleFactors();

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-4">
      <div className={`glass rounded-3xl p-4 sm:p-6 lg:p-10 border text-center shadow-2xl ${getLevelColor()}`}>
        <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-6 ${getLevelBg()}`}>
          <Activity className="animate-pulse" size={32} />
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold opacity-80 uppercase tracking-widest mb-1">Pulse Score</h2>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">{result.level}</h1>
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <div className="h-1.5 w-48 sm:w-56 lg:w-64 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-current transition-all duration-1000 ease-out" style={{ width: `${result.score}%` }} />
          </div>
        </div>

        {/* Reset Button - Above Model Container */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all text-white font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Reset Neural Map</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>

        {/* Model Information Section */}
        {(result.modelName || result.modelScore) && (
          <div className="mb-4 glass bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
              {result.modelName && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Brain size={14} className="text-indigo-400 sm:w-4 sm:h-4" />
                  <span className="font-semibold">Model:</span>
                  <span className="text-indigo-300">{result.modelName}</span>
                </div>
              )}
              {result.modelScore && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Target size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
                  <span className="font-semibold">Accuracy:</span>
                  <span className="text-emerald-300">{(result.modelScore * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Analytics Dashboard */}
        <div className="mb-6 sm:mb-10 glass bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/5">
          <h3 className="flex items-center justify-center sm:justify-start gap-2 font-bold mb-4 sm:mb-6 text-slate-200 text-sm sm:text-base">
            <BarChart3 size={18} className="text-cyan-400 sm:w-5 sm:h-5" />
            <span className="text-center sm:text-left">Personalized Stress Analysis</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Modern Analytics */}
            <div className="space-y-4 sm:space-y-6">
              {/* Stress Wave Graph Card */}
              <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 rounded-2xl p-3 sm:p-4 border border-slate-500/20">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm text-slate-300">Stress Waves</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      result.level === 'Low' ? 'bg-emerald-400' :
                      result.level === 'Medium' ? 'bg-amber-400' :
                      'bg-rose-400'
                    }`}></div>
                    <span className={`text-xs ${
                      result.level === 'Low' ? 'text-emerald-400' :
                      result.level === 'Medium' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>Live</span>
                  </div>
                </div>
                
                <div className="flex items-end gap-2 mb-2 sm:mb-3">
                  <span className={`text-2xl sm:text-3xl font-bold ${
                    result.level === 'Low' ? 'text-emerald-400' :
                    result.level === 'Medium' ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {result.level}
                  </span>
                  <span className="text-sm sm:text-lg text-slate-400 mb-1">Level</span>
                </div>
                
                {/* Animated Wave Graph */}
                <div className="relative w-full h-12 bg-slate-800/50 rounded-lg overflow-hidden mb-2">
                  <svg 
                    className="absolute inset-0 w-full h-full" 
                    viewBox="0 0 200 48" 
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={
                          result.level === 'Low' ? 'rgba(34, 197, 94, 0.8)' :
                          result.level === 'Medium' ? 'rgba(245, 158, 11, 0.8)' :
                          'rgba(239, 68, 68, 0.8)'
                        } />
                        <stop offset="100%" stopColor={
                          result.level === 'Low' ? 'rgba(34, 197, 94, 0.3)' :
                          result.level === 'Medium' ? 'rgba(245, 158, 11, 0.3)' :
                          'rgba(239, 68, 68, 0.3)'
                        } />
                      </linearGradient>
                    </defs>
                    
                    {/* Animated Wave Path */}
                    <path
                      d={
                        result.level === 'Low' 
                          ? "M0,40 Q25,35 50,38 T100,36 T150,38 T200,40 L200,48 L0,48 Z"
                          : result.level === 'Medium'
                          ? "M0,35 Q25,20 50,25 T100,22 T150,25 T200,30 L200,48 L0,48 Z"
                          : "M0,30 Q25,8 50,12 T100,10 T150,15 T200,20 L200,48 L0,48 Z"
                      }
                      fill="url(#waveGradient)"
                      className="transition-all duration-2000 ease-out"
                    />
                    
                    {/* Wave Line */}
                    <path
                      d={
                        result.level === 'Low' 
                          ? "M0,40 Q25,35 50,38 T100,36 T150,38 T200,40"
                          : result.level === 'Medium'
                          ? "M0,35 Q25,20 50,25 T100,22 T150,25 T200,30"
                          : "M0,30 Q25,8 50,12 T100,10 T150,15 T200,20"
                      }
                      stroke={
                        result.level === 'Low' ? 'rgb(34, 197, 94)' :
                        result.level === 'Medium' ? 'rgb(245, 158, 11)' :
                        'rgb(239, 68, 68)'
                      }
                      strokeWidth="2"
                      fill="none"
                      className="transition-all duration-2000 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 4px ${
                          result.level === 'Low' ? 'rgba(34, 197, 94, 0.6)' :
                          result.level === 'Medium' ? 'rgba(245, 158, 11, 0.6)' :
                          'rgba(239, 68, 68, 0.6)'
                        })`
                      }}
                    />
                    
                    {/* Animated Moving Dot */}
                    <circle
                      cx="100"
                      cy={
                        result.level === 'Low' ? 36 :
                        result.level === 'Medium' ? 22 :
                        10
                      }
                      r="3"
                      fill={
                        result.level === 'Low' ? 'rgb(34, 197, 94)' :
                        result.level === 'Medium' ? 'rgb(245, 158, 11)' :
                        'rgb(239, 68, 68)'
                      }
                      className="animate-pulse transition-all duration-2000 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 6px ${
                          result.level === 'Low' ? 'rgba(34, 197, 94, 0.8)' :
                          result.level === 'Medium' ? 'rgba(245, 158, 11, 0.8)' :
                          'rgba(239, 68, 68, 0.8)'
                        })`
                      }}
                    />
                  </svg>
                </div>
                
                <div className="text-xs text-slate-400">
                  {result.level === 'Low' ? 'Calm Waves' : 
                   result.level === 'Medium' ? 'Active Waves' : 'Intense Peaks'}
                </div>
              </div>

              {/* Confidence Score Card */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-300">AI Confidence</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-indigo-400">
                    {Math.round(result.confidence * 100)}
                  </span>
                  <span className="text-lg text-indigo-300 mb-1">%</span>
                </div>
                
                {/* Confidence Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1500 ease-out"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-slate-400 mt-2">
                  {result.confidence > 0.8 ? 'High Accuracy' : 
                   result.confidence > 0.6 ? 'Good Accuracy' : 'Moderate Accuracy'}
                </div>
              </div>
            </div>

            {/* Right Column - Lifestyle Factors */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp size={16} />
                Key Contributing Factors
              </h4>
              
              {lifestyleFactors.map((factor, index) => {
                const IconComponent = factor.icon;
                return (
                  <div key={index} className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg ${factor.color} flex items-center justify-center`}>
                        <IconComponent size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-300">{factor.label}</span>
                          <span className="text-xs text-slate-400">{factor.value}%</span>
                        </div>
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full ${factor.color} transition-all duration-1500 ease-out`}
                            style={{ 
                              width: `${factor.value}%`,
                              animationDelay: `${index * 200}ms`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {factor.detail && (
                      <p className="text-xs text-slate-500 ml-11 opacity-0 group-hover:opacity-100 transition-opacity">
                        {factor.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wellness Score Breakdown */}
          {inputData && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <PieChart size={16} />
                Wellness Profile Overview
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-lg font-bold text-white">{inputData.sleepDuration}h</div>
                  <div className="text-xs text-slate-400">Sleep Duration</div>
                </div>
                
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <Briefcase className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-lg font-bold text-white">{inputData.workHours}h</div>
                  <div className="text-xs text-slate-400">Work Hours</div>
                </div>
                
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <Dumbbell className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-lg font-bold text-white">{inputData.physicalActivity}/5</div>
                  <div className="text-xs text-slate-400">Activity Level</div>
                </div>
                
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <Heart className="w-6 h-6 mx-auto mb-2 text-rose-400" />
                  <div className="text-lg font-bold text-white">{inputData.socialInteractions}/5</div>
                  <div className="text-xs text-slate-400">Social Score</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
          <div className="glass bg-white/5 p-6 rounded-2xl border border-white/5">
            <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-200">
              <Zap size={18} className="text-indigo-400" />
              Neural Insights
            </h3>
            <ul className="space-y-3">
              {result.insights.map((insight, i) => (
                <li key={i} className="text-slate-400 text-sm flex gap-3">
                  <span className="text-indigo-400 mt-1">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass bg-white/5 p-6 rounded-2xl border border-white/5">
            <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-200">
              <Heart size={18} className="text-rose-400" />
              Direct Protocol
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-slate-400 text-sm flex gap-3">
                  <span className="text-rose-400 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Wellness Plan Section */}
        <div className="text-left glass rounded-3xl p-8 border border-white/10 bg-indigo-500/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-white">
              <CalendarCheck size={24} className="text-indigo-400" />
              {result.wellnessPlan.title}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-400/20">AI GENERATED</span>
          </div>
          <p className="text-slate-400 text-sm mb-8 italic">"{result.wellnessPlan.summary}"</p>
          <div className="grid grid-cols-1 gap-4">
            {result.wellnessPlan.tasks.map((task) => (
              <Link 
                key={task.id} 
                to={task.link}
                className="group flex items-center justify-between p-4 rounded-2xl glass border border-white/5 hover:border-indigo-500/40 transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{task.title}</h4>
                    <p className="text-xs text-slate-500 capitalize">{task.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold text-sm">+{task.reward} pts</span>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressResultCard;
