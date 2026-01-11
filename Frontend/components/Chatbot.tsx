
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Heart, ShieldAlert, Brain, ArrowRight, Wind, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage, StressAnalysis } from '../types';
import { getWellnessChatResponse } from '../services/geminiService';

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  
  // Load chat history from localStorage on component mount
  const loadChatHistory = (): ChatMessage[] => {
    try {
      const savedMessages = localStorage.getItem('pulsebot-chat-history');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    
    // Return default welcome message if no history exists
    return [
      {
        id: '1',
        role: 'model',
        text: "Hello, I'm PulseBot, your specialized stress management companion. I'm here to help you with stress relief techniques, meditation guidance, breathing exercises, and mental wellness strategies. How can I support your journey to better mental health today?",
        timestamp: new Date()
      }
    ];
  };

  // Load clicked buttons state from localStorage - but make each button independent
  const loadClickedButtons = () => {
    try {
      const saved = localStorage.getItem('pulsebot-clicked-buttons');
      return saved ? JSON.parse(saved) : { neuralScan: false, calmSpace: false, articles: false };
    } catch (error) {
      console.error('Error loading clicked buttons state:', error);
      return { neuralScan: false, calmSpace: false, articles: false };
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [clickedButtons, setClickedButtons] = useState(loadClickedButtons());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('pulsebot-chat-history', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

  // Save clicked buttons state to localStorage - each button independently
  useEffect(() => {
    try {
      localStorage.setItem('pulsebot-clicked-buttons', JSON.stringify(clickedButtons));
    } catch (error) {
      console.error('Error saving clicked buttons state:', error);
    }
  }, [clickedButtons]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to check if message suggests taking the test - only show when user asks about stress assessment
  const shouldShowTestButton = (message: string, userMessage: string): boolean => {
    const userLower = userMessage.toLowerCase();
    const botLower = message.toLowerCase();
    
    // Only show test button if:
    // 1. User asked about their stress level, assessment, or testing
    // 2. Bot response mentions taking a test/assessment
    const userAsksForAssessment = [
      'how stressed am i','stress','stressed',
      'what is my stress level',
      'can you test',
      'assess my stress',
      'check my stress',
      'stress level',
      'how stressed',
      'test my stress',
      'analyze my stress'
    ].some(phrase => userLower.includes(phrase));

    const botSuggestsTest = [
      'neural scan',
      'take the test',
      'assessment',
      'quick test',
      'stress test',
      'evaluation'
    ].some(keyword => botLower.includes(keyword));
    
    return userAsksForAssessment && botSuggestsTest;
  };

  // Enhanced stress detection function to handle various stress expressions
  const detectStressInMessage = (message: string): StressAnalysis => {
    const lowerMessage = message.toLowerCase();
    const detectedPatterns: string[] = [];
    
    // Numerical stress score detection (0-100)
    const numericalScoreRegex = /(?:stress|score|level|rating).*?(\d{1,3})(?:%|\/100|out of 100)?/i;
    const scoreMatch = message.match(numericalScoreRegex);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      if (score >= 0 && score <= 100) {
        let level: 'low' | 'medium' | 'high';
        if (score >= 70) level = 'high';
        else if (score >= 40) level = 'medium';
        else level = 'low';
        detectedPatterns.push(`numerical_score_${score}`);
        return { isStressRelated: true, stressLevel: level, confidence: 0.95, detectedPatterns };
      }
    }

    // Explicit stress level mentions
    const explicitLevels = [
      { patterns: ['high stress', 'very stressed', 'extremely stressed', 'stress is high', 'really stressed'], level: 'high' as const },
      { patterns: ['medium stress', 'moderately stressed', 'somewhat stressed', 'stress is medium', 'bit stressed'], level: 'medium' as const },
      { patterns: ['low stress', 'little stressed', 'slightly stressed', 'stress is low', 'not very stressed'], level: 'low' as const }
    ];

    for (const levelGroup of explicitLevels) {
      const matchedPattern = levelGroup.patterns.find(pattern => lowerMessage.includes(pattern));
      if (matchedPattern) {
        detectedPatterns.push(`explicit_${matchedPattern.replace(/\s+/g, '_')}`);
        return { isStressRelated: true, stressLevel: levelGroup.level, confidence: 0.9, detectedPatterns };
      }
    }

    // Emotional expressions indicating stress
    const stressEmotions = [
      { patterns: ['overwhelmed', 'can\'t cope', 'breaking down', 'falling apart', 'at my limit', 'burned out', 'exhausted'], level: 'high' as const, confidence: 0.85 },
      { patterns: ['anxious', 'worried', 'tense', 'on edge', 'restless', 'uneasy', 'nervous'], level: 'medium' as const, confidence: 0.8 },
      { patterns: ['tired', 'drained', 'worn out', 'fatigued', 'weary'], level: 'medium' as const, confidence: 0.7 }
    ];

    for (const emotionGroup of stressEmotions) {
      const matchedPattern = emotionGroup.patterns.find(pattern => lowerMessage.includes(pattern));
      if (matchedPattern) {
        detectedPatterns.push(`emotion_${matchedPattern.replace(/\s+/g, '_')}`);
        return { isStressRelated: true, stressLevel: emotionGroup.level, confidence: emotionGroup.confidence, detectedPatterns };
      }
    }

    // General stress indicators
    const generalStressKeywords = [
      'stressed', 'stress', 'stressful', 'pressure', 'pressured', 'strain', 'strained',
      'tension', 'mental health', 'struggling', 'difficult time', 'hard time',
      'neural scan', 'test results', 'assessment results', 'my results'
    ];

    const matchedKeywords = generalStressKeywords.filter(keyword => {
      if (lowerMessage.includes(keyword)) {
        detectedPatterns.push(`keyword_${keyword.replace(/\s+/g, '_')}`);
        return true;
      }
      return false;
    });

    if (matchedKeywords.length > 0) {
      // Multiple stress keywords suggest higher stress
      const level = matchedKeywords.length >= 2 ? 'medium' : 'low';
      return { isStressRelated: true, stressLevel: level, confidence: 0.6 + (matchedKeywords.length * 0.1), detectedPatterns };
    }

    return { isStressRelated: false, confidence: 0, detectedPatterns };
  };

  // Function to check if message suggests visiting CalmSpace - only show when user expresses stress or asks for help
  const shouldShowCalmSpaceButton = (message: string, userMessage: string, userStressAnalysis?: StressAnalysis): boolean => {
    const userLower = userMessage.toLowerCase();
    const botLower = message.toLowerCase();
    
    // Only show CalmSpace button if:
    // 1. User expressed stress/anxiety/overwhelm OR shared test results
    // 2. Bot response recommends breathing exercises or CalmSpace
    const userExpressedStress = userStressAnalysis?.isStressRelated || [
      'anxious', 'overwhelmed', 'worried', 'tense',
      'help me', 'need help', 'what should i do', 'how can i',
      'test result', 'my result', 'got', 'score'
    ].some(phrase => userLower.includes(phrase));

    const botRecommendsCalmSpace = [
      'breathing exercises',
      'calmspace',
      'calm space',
      'try our tools',
      'visit calmspace',
      'practice breathing',
      'box breathing',
      'breathing techniques'
    ].some(keyword => botLower.includes(keyword));
    
    return userExpressedStress && botRecommendsCalmSpace;
  };

  // Function to check if message suggests visiting MindLabZenith for educational content
  const shouldShowArticlesButton = (message: string, userMessage: string): boolean => {
    const userLower = userMessage.toLowerCase();
    const botLower = message.toLowerCase();
    
    // Only show articles button if:
    // 1. User asked for learning/educational content
    // 2. Bot response mentions articles or MindLabZenith
    const userAsksForLearning = [
      'how to',
      'learn about',
      'tell me about',
      'explain',
      'what is',
      'why does',
      'articles',
      'read about',
      'information',
      'research'
    ].some(phrase => userLower.includes(phrase));

    const botSuggestsArticles = [
      'mindlabzenith',
      'mind lab zenith',
      'articles',
      'explore our articles',
      'check out',
      'learn more',
      'educational content',
      'insights'
    ].some(keyword => botLower.includes(keyword));
    
    return userAsksForLearning && botSuggestsArticles;
  };

  const handleTakeTest = (messageId: string) => {
    setClickedButtons(prev => ({ ...prev, [`neuralScan_${messageId}`]: true }));
    navigate('/predict');
  };

  const handleVisitCalmSpace = (messageId: string) => {
    setClickedButtons(prev => ({ ...prev, [`calmSpace_${messageId}`]: true }));
    navigate('/tools');
  };

  const handleVisitArticles = (messageId: string) => {
    setClickedButtons(prev => ({ ...prev, [`articles_${messageId}`]: true }));
    navigate('/articles');
  };

  // Function to clear chat history and reset all button states
  const clearChatHistory = () => {
    const defaultMessage = {
      id: '1',
      role: 'model' as const,
      text: "Hello, I'm PulseBot, your specialized stress management companion. I'm here to help you with stress relief techniques, meditation guidance, breathing exercises, and mental wellness strategies. How can I support your journey to better mental health today?",
      timestamp: new Date()
    };
    
    // Reset all states
    setMessages([defaultMessage]);
    setClickedButtons({});
    setLastUserMessage('');
    setInput('');
    
    // Clear localStorage
    localStorage.removeItem('pulsebot-chat-history');
    localStorage.removeItem('pulsebot-clicked-buttons');
    localStorage.removeItem('pulsebot-conversation-id');
    
    // Scroll to top after reset
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 100);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Store the user message for button logic
    const currentUserMessage = input.trim();
    setLastUserMessage(currentUserMessage);

    // Analyze user message for stress content
    const stressAnalysis = detectStressInMessage(currentUserMessage);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: currentUserMessage,
      timestamp: new Date(),
      stressAnalysis: stressAnalysis.isStressRelated ? stressAnalysis : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({ role: m.role, text: m.text }));
      
      // Enhanced context for stress-related messages
      let enhancedMessage = userMessage.text;
      if (stressAnalysis.isStressRelated && stressAnalysis.stressLevel) {
        enhancedMessage += ` [Detected stress level: ${stressAnalysis.stressLevel}, confidence: ${stressAnalysis.confidence.toFixed(2)}]`;
      }
      
      const response = await getWellnessChatResponse(history, enhancedMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "My neural pathways are currently experiencing a brief desync. Please take a deep breath while I reconnect.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PULSE AI</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Specialized Wellness Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 italic">
            <Heart size={14} className="text-rose-500" />
            Healing-mode activated
          </div>
          <button
            onClick={clearChatHistory}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-slate-500 rounded-xl transition-all duration-200 flex items-center gap-2"
            title="Reset conversation and show navigation buttons again"
          >
            <Sparkles size={12} />
            Reset Chat
          </button>
        </div>
      </header>

      <div className="flex-1 glass rounded-3xl overflow-hidden border border-white/10 flex flex-col shadow-2xl">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((msg, index) => {
            // Find the corresponding user message for button logic
            const correspondingUserMsg = index > 0 ? messages[index - 1] : null;
            const userMessageText = correspondingUserMsg?.role === 'user' ? correspondingUserMsg.text : lastUserMessage;
            const userStressAnalysis = correspondingUserMsg?.stressAnalysis;
            
            return (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/10'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-indigo-400" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-indigo-500/10' : 'bg-white/5 border border-white/5 text-slate-200'}`}>
                  {msg.text}
                  {/* Show test button for bot messages that suggest taking the test - only when contextually appropriate and not clicked for this message */}
                  {msg.role === 'model' && !clickedButtons[`neuralScan_${msg.id}`] && shouldShowTestButton(msg.text, userMessageText) && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleTakeTest(msg.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-medium rounded-full transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-105"
                      >
                        <Brain size={14} />
                        Take Neural Scan
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                  {/* Show CalmSpace button for bot messages that suggest breathing exercises - only when contextually appropriate and not clicked for this message */}
                  {msg.role === 'model' && !clickedButtons[`calmSpace_${msg.id}`] && shouldShowCalmSpaceButton(msg.text, userMessageText, userStressAnalysis) && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleVisitCalmSpace(msg.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white text-xs font-medium rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-105"
                      >
                        <Wind size={14} />
                        Visit CalmSpace
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                  {/* Show Articles button for bot messages that suggest educational content - only when contextually appropriate and not clicked for this message */}
                  {msg.role === 'model' && !clickedButtons[`articles_${msg.id}`] && shouldShowArticlesButton(msg.text, userMessageText) && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleVisitArticles(msg.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-medium rounded-full transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105"
                      >
                        <BookOpen size={14} />
                        Visit MindLabZenith
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center text-slate-500 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                </div>
                <span>PulseBot is processing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/40 border-t border-white/5">
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about stress relief, meditation, or breathing techniques..."
              className="flex-1 bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-slate-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
              <ShieldAlert size={10} />
              Non-Emergency Neural Network Support
            </div>
            <button
              onClick={clearChatHistory}
              className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest font-semibold transition-colors flex items-center gap-1"
              title="Reset conversation and restore navigation buttons"
            >
              <Sparkles size={10} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
