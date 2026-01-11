
export enum StressLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum ExerciseType {
  CARDIO = 'Cardio',
  YOGA = 'Yoga',
  STRENGTH = 'Strength Training',
  AEROBICS = 'Aerobics',
  WALKING = 'Walking',
  PILATES = 'Pilates'
}

export interface WellnessPlanTask {
  id: string;
  title: string;
  type: 'article' | 'tool' | 'lifestyle';
  link: string;
  reward: number;
}

export interface WellnessPlan {
  title: string;
  summary: string;
  tasks: WellnessPlanTask[];
}

export interface StressPredictionData {
  age: number;
  sleepDuration: number;
  sleepQuality: number;
  physicalActivity: number;
  screenTime: number;
  caffeineIntake: number;
  workHours: number;
  travelTime: number;
  socialInteractions: number;
  gender: Gender;
  smokingHabit: 'Yes' | 'No';
  meditationPractice: 'Yes' | 'No';
  exerciseType: ExerciseType;
}

// Backend API request interface (snake_case field names)
export interface StressPredictionRequest {
  age: number;
  gender: Gender;
  sleep_duration: number;
  sleep_quality: number;
  physical_activity: number;
  screen_time: number;
  caffeine_intake: number;
  smoking_habit: 'Yes' | 'No';
  work_hours: number;
  travel_time: number;
  social_interactions: number;
  meditation_practice: 'Yes' | 'No';
  exercise_type: ExerciseType;
}

export interface PredictionResult {
  level: StressLevel;
  score: number;
  confidence: number;
  insights: string[];
  recommendations: string[];
  wellnessPlan: WellnessPlan;
  modelName?: string;
  modelScore?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  stressAnalysis?: StressAnalysis;
}

export interface StressAnalysis {
  isStressRelated: boolean;
  stressLevel?: 'low' | 'medium' | 'high';
  confidence: number;
  detectedPatterns?: string[];
}

export interface UserStats {
  points: number;
  streak: number;
  lastCheckIn: string;
  badges: string[];
  username?: string;
}

// Validation ranges matching backend constraints exactly
export const ValidationRanges = {
  age: { min: 18, max: 65 },
  sleepDuration: { min: 4.0, max: 12.0 },
  sleepQuality: { min: 1, max: 5 },
  physicalActivity: { min: 0, max: 5 },
  screenTime: { min: 1.0, max: 14.0 },
  caffeineIntake: { min: 0, max: 8 },
  workHours: { min: 4.0, max: 16.0 },
  travelTime: { min: 0.0, max: 4.0 },
  socialInteractions: { min: 1, max: 5 }
} as const;

// Valid categorical values matching backend enums
export const ValidCategoricalValues = {
  gender: Object.values(Gender),
  smokingHabit: ['Yes', 'No'] as const,
  meditationPractice: ['Yes', 'No'] as const,
  exerciseType: Object.values(ExerciseType)
} as const;

// Utility functions for data transformation
export const DataTransformUtils = {
  // Convert frontend camelCase to backend snake_case
  toBackendFormat: (frontendData: StressPredictionData): StressPredictionRequest => ({
    age: frontendData.age,
    gender: frontendData.gender,
    sleep_duration: frontendData.sleepDuration,
    sleep_quality: frontendData.sleepQuality,
    physical_activity: frontendData.physicalActivity,
    screen_time: frontendData.screenTime,
    caffeine_intake: frontendData.caffeineIntake,
    smoking_habit: frontendData.smokingHabit,
    work_hours: frontendData.workHours,
    travel_time: frontendData.travelTime,
    social_interactions: frontendData.socialInteractions,
    meditation_practice: frontendData.meditationPractice,
    exercise_type: frontendData.exerciseType
  }),

  // Validate individual field values
  validateField: (field: keyof StressPredictionData, value: any): string | null => {
    switch (field) {
      case 'age':
        if (typeof value !== 'number' || value < ValidationRanges.age.min || value > ValidationRanges.age.max) {
          return `Age must be between ${ValidationRanges.age.min} and ${ValidationRanges.age.max}`;
        }
        break;
      case 'sleepDuration':
        if (typeof value !== 'number' || value < ValidationRanges.sleepDuration.min || value > ValidationRanges.sleepDuration.max) {
          return `Sleep duration must be between ${ValidationRanges.sleepDuration.min} and ${ValidationRanges.sleepDuration.max} hours`;
        }
        break;
      case 'sleepQuality':
        if (typeof value !== 'number' || value < ValidationRanges.sleepQuality.min || value > ValidationRanges.sleepQuality.max) {
          return `Sleep quality must be between ${ValidationRanges.sleepQuality.min} and ${ValidationRanges.sleepQuality.max}`;
        }
        break;
      case 'physicalActivity':
        if (typeof value !== 'number' || value < ValidationRanges.physicalActivity.min || value > ValidationRanges.physicalActivity.max) {
          return `Physical activity must be between ${ValidationRanges.physicalActivity.min} and ${ValidationRanges.physicalActivity.max}`;
        }
        break;
      case 'screenTime':
        if (typeof value !== 'number' || value < ValidationRanges.screenTime.min || value > ValidationRanges.screenTime.max) {
          return `Screen time must be between ${ValidationRanges.screenTime.min} and ${ValidationRanges.screenTime.max} hours`;
        }
        break;
      case 'caffeineIntake':
        if (typeof value !== 'number' || value < ValidationRanges.caffeineIntake.min || value > ValidationRanges.caffeineIntake.max) {
          return `Caffeine intake must be between ${ValidationRanges.caffeineIntake.min} and ${ValidationRanges.caffeineIntake.max} cups`;
        }
        break;
      case 'workHours':
        if (typeof value !== 'number' || value < ValidationRanges.workHours.min || value > ValidationRanges.workHours.max) {
          return `Work hours must be between ${ValidationRanges.workHours.min} and ${ValidationRanges.workHours.max} hours`;
        }
        break;
      case 'travelTime':
        if (typeof value !== 'number' || value < ValidationRanges.travelTime.min || value > ValidationRanges.travelTime.max) {
          return `Travel time must be between ${ValidationRanges.travelTime.min} and ${ValidationRanges.travelTime.max} hours`;
        }
        break;
      case 'socialInteractions':
        if (typeof value !== 'number' || value < ValidationRanges.socialInteractions.min || value > ValidationRanges.socialInteractions.max) {
          return `Social interactions must be between ${ValidationRanges.socialInteractions.min} and ${ValidationRanges.socialInteractions.max}`;
        }
        break;
      case 'gender':
        if (!ValidCategoricalValues.gender.includes(value)) {
          return `Gender must be one of: ${ValidCategoricalValues.gender.join(', ')}`;
        }
        break;
      case 'smokingHabit':
        if (!ValidCategoricalValues.smokingHabit.includes(value)) {
          return `Smoking habit must be one of: ${ValidCategoricalValues.smokingHabit.join(', ')}`;
        }
        break;
      case 'meditationPractice':
        if (!ValidCategoricalValues.meditationPractice.includes(value)) {
          return `Meditation practice must be one of: ${ValidCategoricalValues.meditationPractice.join(', ')}`;
        }
        break;
      case 'exerciseType':
        if (!ValidCategoricalValues.exerciseType.includes(value)) {
          return `Exercise type must be one of: ${ValidCategoricalValues.exerciseType.join(', ')}`;
        }
        break;
    }
    return null;
  },

  // Validate all fields in the form data
  validateFormData: (data: StressPredictionData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    (Object.keys(data) as Array<keyof StressPredictionData>).forEach(field => {
      const error = DataTransformUtils.validateField(field, data[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Cross-field validation for lifestyle consistency (matching backend validation)
    const totalStructuredTime = data.workHours + data.sleepDuration + data.travelTime;
    if (totalStructuredTime > 24) {
      errors.general = `Total time allocation (work: ${data.workHours}h, sleep: ${data.sleepDuration}h, travel: ${data.travelTime}h) exceeds 24 hours per day`;
    }

    // Additional validation for screen time vs work hours relationship
    if (data.screenTime > data.workHours + 6) {
      if (!errors.general) {
        errors.general = `Screen time (${data.screenTime}h) significantly exceeds work hours (${data.workHours}h) + 6h personal time`;
      }
    }

    return errors;
  }
};
