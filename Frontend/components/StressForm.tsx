
import React, { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { StressPredictionData, Gender, ExerciseType, PredictionResult, ValidationRanges, DataTransformUtils } from '../types';
import { analyzeStressLevel } from '../services/predictionService';
import StressResultCard from './StressResultCard';

const StressForm: React.FC<{ addPoints: (amount: number, badge?: string) => void }> = ({ addPoints }) => {
  const [formData, setFormData] = useState<StressPredictionData>({
    age: 30,
    sleepDuration: 7.5,
    sleepQuality: 4,
    physicalActivity: 3,
    screenTime: 8,
    caffeineIntake: 2,
    workHours: 8,
    travelTime: 1,
    socialInteractions: 3,
    gender: Gender.MALE,
    smokingHabit: 'No',
    meditationPractice: 'No',
    exerciseType: ExerciseType.CARDIO
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous API errors
    setApiError(null);
    
    // Validate form data
    const errors = DataTransformUtils.validateFormData(formData);
    setValidationErrors(errors);
    setShowValidation(true);
    
    // Don't submit if there are validation errors
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Submitting stress analysis request with data:', formData);
      const apiResult = await analyzeStressLevel(formData);
      console.log('Received stress analysis result:', apiResult);
      setResult(apiResult);
      addPoints(25, 'Neural Pioneer');
    } catch (error) {
      console.error('Error analyzing stress level:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setApiError('Unable to connect to our analysis service. Please check your internet connection and try again.');
        } else if (error.message.includes('timeout')) {
          setApiError('The analysis is taking longer than expected. Please try again.');
        } else if (error.message.includes('validation')) {
          setApiError('There was an issue with your input data. Please review your entries and try again.');
        } else {
          setApiError('An unexpected error occurred during analysis. Please try again or contact support if the issue persists.');
        }
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof StressPredictionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user updates it
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error if it exists and user is updating fields
    if (validationErrors.general) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
    
    // Clear API error when user starts making changes
    if (apiError) {
      setApiError(null);
    }
  };

  if (result) {
    return <StressResultCard result={result} inputData={formData} onReset={() => setResult(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
          Stress Analysis Engine
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Synchronize your biometric data with our analysis core to unlock your personalized evolution path.
          Earn <span className="text-indigo-400 font-bold">+25 pts</span> for your first scan today.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
        {/* Show general validation errors */}
        {showValidation && validationErrors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{validationErrors.general}</p>
          </div>
        )}
        
        {/* Show API errors */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
              Personal Metrics
            </h3>
            <RangeInput 
              label="Age" 
              value={formData.age} 
              min={ValidationRanges.age.min} 
              max={ValidationRanges.age.max} 
              step={1}
              onChange={(v) => updateField('age', v)} 
              unit="yrs"
              error={showValidation ? validationErrors.age : undefined}
            />
            <RangeInput 
              label="Sleep Duration" 
              value={formData.sleepDuration} 
              min={ValidationRanges.sleepDuration.min} 
              max={ValidationRanges.sleepDuration.max} 
              step={0.5} 
              onChange={(v) => updateField('sleepDuration', v)} 
              unit="hrs"
              error={showValidation ? validationErrors.sleepDuration : undefined}
            />
            <RangeInput 
              label="Sleep Quality" 
              value={formData.sleepQuality} 
              min={ValidationRanges.sleepQuality.min} 
              max={ValidationRanges.sleepQuality.max} 
              step={1}
              onChange={(v) => updateField('sleepQuality', v)} 
              unit="/5"
              error={showValidation ? validationErrors.sleepQuality : undefined}
            />
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-purple-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">2</span>
              Lifestyle Factors
            </h3>
            <RangeInput 
              label="Work Hours" 
              value={formData.workHours} 
              min={ValidationRanges.workHours.min} 
              max={ValidationRanges.workHours.max} 
              step={0.5}
              onChange={(v) => updateField('workHours', v)} 
              unit="hrs"
              error={showValidation ? validationErrors.workHours : undefined}
            />
            <RangeInput 
              label="Screen Time" 
              value={formData.screenTime} 
              min={ValidationRanges.screenTime.min} 
              max={ValidationRanges.screenTime.max} 
              step={0.5}
              onChange={(v) => updateField('screenTime', v)} 
              unit="hrs"
              error={showValidation ? validationErrors.screenTime : undefined}
            />
            <RangeInput 
              label="Caffeine Intake" 
              value={formData.caffeineIntake} 
              min={ValidationRanges.caffeineIntake.min} 
              max={ValidationRanges.caffeineIntake.max} 
              step={1}
              onChange={(v) => updateField('caffeineIntake', v)} 
              unit="cups"
              error={showValidation ? validationErrors.caffeineIntake : undefined}
            />
            <RangeInput 
              label="Travel Time" 
              value={formData.travelTime} 
              min={ValidationRanges.travelTime.min} 
              max={ValidationRanges.travelTime.max} 
              step={0.5} 
              onChange={(v) => updateField('travelTime', v)} 
              unit="hrs"
              error={showValidation ? validationErrors.travelTime : undefined}
            />
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-pink-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs">3</span>
              Activity & Habits
            </h3>
            <RangeInput 
              label="Physical Activity" 
              value={formData.physicalActivity} 
              min={ValidationRanges.physicalActivity.min} 
              max={ValidationRanges.physicalActivity.max} 
              step={1}
              onChange={(v) => updateField('physicalActivity', v)} 
              unit="/5"
              error={showValidation ? validationErrors.physicalActivity : undefined}
            />
            <RangeInput 
              label="Social Interactions" 
              value={formData.socialInteractions} 
              min={ValidationRanges.socialInteractions.min} 
              max={ValidationRanges.socialInteractions.max} 
              step={1}
              onChange={(v) => updateField('socialInteractions', v)} 
              unit="/5"
              error={showValidation ? validationErrors.socialInteractions : undefined}
            />
            <SelectInput 
              label="Gender" 
              value={formData.gender} 
              options={Object.values(Gender)} 
              onChange={(v) => updateField('gender', v)}
              error={showValidation ? validationErrors.gender : undefined}
            />
            <SelectInput 
              label="Exercise Type" 
              value={formData.exerciseType} 
              options={Object.values(ExerciseType)} 
              onChange={(v) => updateField('exerciseType', v)}
              error={showValidation ? validationErrors.exerciseType : undefined}
            />
            <div className="grid grid-cols-2 gap-4">
              <ToggleInput 
                label="Smoking" 
                value={formData.smokingHabit} 
                onChange={(v) => updateField('smokingHabit', v)}
                error={showValidation ? validationErrors.smokingHabit : undefined}
              />
              <ToggleInput 
                label="Meditation" 
                value={formData.meditationPractice} 
                onChange={(v) => updateField('meditationPractice', v)}
                error={showValidation ? validationErrors.meditationPractice : undefined}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative px-12 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-lg flex items-center gap-3 overflow-hidden shadow-indigo-500/20 shadow-lg disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Analyzing with ML Model...
              </>
            ) : (
              <>
                <BrainCircuit />
                Synchronize Pulse
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const RangeInput: React.FC<{ 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step?: number; 
  unit: string; 
  onChange: (v: number) => void;
  error?: string;
}> = ({ label, value, min, max, step = 1, unit, onChange, error }) => {
  // Format display value based on step size
  const displayValue = step < 1 ? value.toFixed(1) : value.toString();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <label className="text-slate-400">{label}</label>
        <span className="text-indigo-400 font-medium">{displayValue}{unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
        className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer ${error ? 'accent-red-500' : 'accent-indigo-500'}`} 
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

const SelectInput: React.FC<{ 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (v: string) => void;
  error?: string;
}> = ({ label, value, options, onChange, error }) => (
  <div className="space-y-2">
    <label className="text-sm text-slate-400">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className={`w-full glass bg-transparent border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
        error 
          ? 'border-red-500/50 focus:ring-red-500/40' 
          : 'border-white/10 focus:ring-indigo-500/40'
      }`}
    >
      {options.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
    </select>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const ToggleInput: React.FC<{ 
  label: string; 
  value: 'Yes' | 'No'; 
  onChange: (v: 'Yes' | 'No') => void;
  error?: string;
}> = ({ label, value, onChange, error }) => (
  <div className="space-y-2">
    <label className="text-sm text-slate-400">{label}</label>
    <div className={`flex bg-slate-800/50 rounded-xl p-1 border ${error ? 'border-red-500/50' : 'border-white/5'}`}>
      <button 
        type="button" 
        onClick={() => onChange('Yes')} 
        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          value === 'Yes' 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        Yes
      </button>
      <button 
        type="button" 
        onClick={() => onChange('No')} 
        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          value === 'No' 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        No
      </button>
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default StressForm;
