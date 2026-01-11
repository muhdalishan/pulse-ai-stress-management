
import React, { useState, useEffect, useRef } from 'react';
import { Wind, Timer, Play, Pause, RotateCcw, Volume2, CloudRain, Waves, Trees, CheckCircle2 } from 'lucide-react';

const ReliefTools: React.FC<{ addPoints: (amount: number, badge?: string) => void }> = ({ addPoints }) => {
  const [activeTool, setActiveTool] = useState<'breath' | 'meditation'>('breath');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [meditationSeconds, setMeditationSeconds] = useState(300);
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Add CSS for volume slider
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #6366f1;
        cursor: pointer;
        border: 2px solid #1e293b;
      }
      .slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #6366f1;
        cursor: pointer;
        border: 2px solid #1e293b;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            if (breathPhase === 'Pause') {
              setSessionCompleted(true);
              setIsBreathing(false);
              addPoints(15, 'Breath Master');
              return 4;
            }
            switch (breathPhase) {
              case 'Inhale': setBreathPhase('Hold'); return 4;
              case 'Hold': setBreathPhase('Exhale'); return 4;
              case 'Exhale': setBreathPhase('Pause'); return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  useEffect(() => {
    let interval: any;
    if (isMeditationActive && meditationSeconds > 0) {
      interval = setInterval(() => {
        setMeditationSeconds(prev => prev - 1);
      }, 1000);
    } else if (meditationSeconds === 0 && isMeditationActive) {
      setIsMeditationActive(false);
      setSessionCompleted(true);
      addPoints(20, 'Zen Master');
    }
    return () => clearInterval(interval);
  }, [isMeditationActive, meditationSeconds]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
          Stress Relief Tools
        </h1>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
          <button onClick={() => setActiveTool('breath')} className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTool === 'breath' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Box Breathing</button>
          <button onClick={() => setActiveTool('meditation')} className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTool === 'meditation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Pulse Meditation</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[3rem] p-12 flex flex-col items-center justify-center min-h-[500px] border border-white/10 relative overflow-hidden">
          {sessionCompleted ? (
            <div className="text-center animate-in zoom-in duration-500">
              <CheckCircle2 size={80} className="text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-2">Cycle Synchronized</h2>
              <p className="text-slate-400 mb-8">You've successfully balanced your neurological rhythm. <b>+15 pts awarded.</b></p>
              <button 
                onClick={() => { setSessionCompleted(false); setBreathPhase('Inhale'); setBreathTimer(4); }}
                className="px-8 py-3 rounded-full bg-indigo-600 text-white font-bold"
              >
                Initiate New Cycle
              </button>
            </div>
          ) : activeTool === 'breath' ? (
            <>
              <div className="relative mb-12">
                <div className={`w-64 h-64 rounded-full border-4 border-indigo-500/30 flex items-center justify-center transition-all duration-[4000ms] ${isBreathing ? (breathPhase === 'Inhale' ? 'scale-125' : (breathPhase === 'Exhale' ? 'scale-75' : 'scale-100')) : 'scale-100'}`}>
                  <div className={`w-48 h-48 rounded-full gradient-bg blur-3xl opacity-20 animate-pulse`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-indigo-400">{breathTimer}</span>
                    <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">{breathPhase}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsBreathing(!isBreathing)} className={`px-12 py-4 rounded-full font-bold flex items-center gap-3 transition-all ${isBreathing ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                {isBreathing ? <Pause size={20} /> : <Play size={20} />}
                {isBreathing ? 'Abort Sync' : 'Initiate Sync'}
              </button>
            </>
          ) : (
            <>
              <div className="text-8xl font-black font-mono text-indigo-500 mb-12 flex items-center gap-2">
                <Timer size={64} className="text-indigo-600" />
                {formatTime(meditationSeconds)}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsMeditationActive(!isMeditationActive)} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMeditationActive ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-600 text-white'}`}>{isMeditationActive ? <Pause size={32} /> : <Play size={32} />}</button>
                <button onClick={() => { setIsMeditationActive(false); setMeditationSeconds(300); }} className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700"><RotateCcw size={24} /></button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <Volume2 size={20} className="text-indigo-400" />
              Pulse Ambience
            </h3>
            <div className="space-y-4">
              <SoundscapeItem 
                icon={<CloudRain className="text-blue-400" />} 
                label="Digital Rain" 
                audioFile="/Audio/rain.mp3"
              />
              <SoundscapeItem 
                icon={<Waves className="text-cyan-400" />} 
                label="Ethereal Pulse" 
                audioFile="/Audio/pulse.mp3"
              />
              <SoundscapeItem 
                icon={<Trees className="text-emerald-400" />} 
                label="Carbon Forest" 
                audioFile="/Audio/forest.mp3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SoundscapeItem: React.FC<{ icon: React.ReactNode; label: string; audioFile: string }> = ({ icon, label, audioFile }) => {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.preload = 'metadata';
    
    // Set the audio source
    audioRef.current.src = audioFile;
    
    // Handle loading states
    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleError = () => {
      setLoading(false);
      console.error('Failed to load audio:', audioFile);
    };

    audioRef.current.addEventListener('loadstart', handleLoadStart);
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('error', handleError);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadstart', handleLoadStart);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioFile]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    try {
      if (active) {
        // Stop audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setActive(false);
      } else {
        // Start audio
        await audioRef.current.play();
        setActive(true);
      }
    } catch (err) {
      console.error('Audio playback failed:', err);
      setActive(false);
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
      <div 
        onClick={toggleAudio} 
        className="flex items-center justify-between cursor-pointer mb-3"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
        </div>
      </div>
      
      {active && (
        <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <Volume2 size={14} className="text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-slate-400 w-8">{Math.round(volume * 100)}%</span>
        </div>
      )}
    </div>
  );
};

export default ReliefTools;
