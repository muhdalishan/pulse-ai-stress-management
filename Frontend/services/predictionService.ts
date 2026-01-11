/**
 * PULSE-AI Prediction Service - Backend API Client
 * 
 * This service replaces the Gemini AI service with a local backend API client
 * that communicates with the trained ML model. It provides HTTP client functionality
 * with timeout, retry configuration, and comprehensive error handling.
 * 
 * Features:
 * - HTTP client with timeout and retry configuration
 * - Request/response transformation logic
 * - Comprehensive error handling for network issues
 * - Response format transformation to maintain frontend compatibility
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { 
  StressPredictionData, 
  StressPredictionRequest, 
  PredictionResult, 
  StressLevel,
  DataTransformUtils 
} from '../types';

// Configuration constants
const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Error types for better error handling
export enum PredictionErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface PredictionError extends Error {
  type: PredictionErrorType;
  statusCode?: number;
  details?: any;
  retryable: boolean;
}

/**
 * HTTP Client class with timeout and retry configuration
 */
class HTTPClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createErrorFromResponse(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createPredictionError(
            PredictionErrorType.TIMEOUT_ERROR,
            `Request timeout after ${this.timeout}ms`,
            true
          );
        }
        
        if (error.message.includes('fetch')) {
          throw this.createPredictionError(
            PredictionErrorType.NETWORK_ERROR,
            'Network connection failed',
            true
          );
        }
      }

      throw error;
    }
  }

  /**
   * Create error from HTTP response
   */
  private async createErrorFromResponse(response: Response): Promise<PredictionError> {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { message: response.statusText };
    }

    const errorType = this.getErrorTypeFromStatus(response.status);
    const retryable = response.status >= 500 || response.status === 429;

    return this.createPredictionError(
      errorType,
      errorDetails.message || `HTTP ${response.status}: ${response.statusText}`,
      retryable,
      response.status,
      errorDetails
    );
  }

  /**
   * Get error type from HTTP status code
   */
  private getErrorTypeFromStatus(status: number): PredictionErrorType {
    if (status >= 400 && status < 500) {
      return status === 422 ? PredictionErrorType.VALIDATION_ERROR : PredictionErrorType.SERVER_ERROR;
    }
    if (status >= 500) {
      return PredictionErrorType.SERVER_ERROR;
    }
    return PredictionErrorType.UNKNOWN_ERROR;
  }

  /**
   * Create a structured prediction error
   */
  private createPredictionError(
    type: PredictionErrorType,
    message: string,
    retryable: boolean,
    statusCode?: number,
    details?: any
  ): PredictionError {
    const error = new Error(message) as PredictionError;
    error.type = type;
    error.retryable = retryable;
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY_BASE
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's not a retryable error
      if (error instanceof Error && 'retryable' in error && !error.retryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Prediction request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Transform frontend data to backend API format
 */
function transformRequestData(frontendData: StressPredictionData): StressPredictionRequest {
  return DataTransformUtils.toBackendFormat(frontendData);
}

/**
 * Transform backend response to frontend format
 * Requirements: 3.2
 */
function transformResponseData(backendResponse: any): PredictionResult {
  // Validate required fields
  if (!backendResponse.level || typeof backendResponse.score !== 'number') {
    throw new Error('Invalid response format from backend API');
  }

  // Map stress level to enum
  let stressLevel: StressLevel;
  switch (backendResponse.level) {
    case 'Low':
      stressLevel = StressLevel.LOW;
      break;
    case 'Medium':
      stressLevel = StressLevel.MEDIUM;
      break;
    case 'High':
      stressLevel = StressLevel.HIGH;
      break;
    default:
      stressLevel = StressLevel.MEDIUM;
  }

  // Transform wellness plan to match frontend interface
  const wellnessPlan = {
    title: backendResponse.wellnessPlan?.title || backendResponse.wellness_plan?.title || 'Wellness Plan',
    summary: backendResponse.wellnessPlan?.summary || backendResponse.wellness_plan?.summary || 'Personalized wellness recommendations',
    tasks: (backendResponse.wellnessPlan?.tasks || backendResponse.wellness_plan?.tasks || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      type: task.type as 'article' | 'tool' | 'lifestyle',
      link: task.link,
      reward: task.reward
    }))
  };

  return {
    level: stressLevel,
    score: Math.round(backendResponse.score),
    confidence: backendResponse.confidence || 0.8,
    insights: backendResponse.insights || ['Analysis completed successfully'],
    recommendations: backendResponse.recommendations || ['Continue maintaining healthy habits'],
    wellnessPlan,
    modelName: backendResponse.model_name || backendResponse.modelName,
    modelScore: backendResponse.model_score || backendResponse.modelScore
  };
}

/**
 * Fallback response structure matching existing interface
 * Requirements: 5.1, 5.5
 */
function createFallbackResponse(): PredictionResult {
  return {
    level: StressLevel.MEDIUM,
    score: 50,
    confidence: 0.5,
    insights: [
      "Unable to connect to our analysis service at the moment",
      "Please check your internet connection and try again"
    ],
    recommendations: [
      "Maintain consistent sleep schedule (7-9 hours)",
      "Stay hydrated throughout the day",
      "Take short breaks from screen time",
      "Practice deep breathing exercises"
    ],
    wellnessPlan: {
      title: "Basic Wellness Plan",
      summary: "Essential wellness practices while we restore full service",
      tasks: [
        {
          id: "fallback-1",
          title: "Practice Deep Breathing",
          type: "tool",
          link: "/tools",
          reward: 10
        },
        {
          id: "fallback-2",
          title: "Take a 10-Minute Walk",
          type: "lifestyle",
          link: "/wellness",
          reward: 15
        },
        {
          id: "fallback-3",
          title: "Read Stress Management Tips",
          type: "article",
          link: "/articles",
          reward: 10
        }
      ]
    }
  };
}

/**
 * Detect if user is offline
 */
function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Main prediction service class
 */
class PredictionService {
  private httpClient: HTTPClient;
  private isBackendHealthy: boolean = true;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 60000; // 60 seconds (less aggressive)

  constructor() {
    this.httpClient = new HTTPClient(API_BASE_URL);
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Start with backend assumed healthy to avoid immediate fallbacks
    this.isBackendHealthy = true;
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('Connection restored - backend health will be rechecked');
    this.isBackendHealthy = true; // Optimistically assume backend is healthy
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('Connection lost - will use fallback responses');
    this.isBackendHealthy = false;
  }

  /**
   * Predict stress level using backend ML model with fallback and error recovery
   * Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.5
   */
  async predictStressLevel(data: StressPredictionData): Promise<PredictionResult> {
    console.log('=== PREDICTION SERVICE DEBUG ===');
    console.log('Input data:', data);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Is offline:', isOffline());
    console.log('Backend healthy:', this.isBackendHealthy);
    
    try {
      // Check if user is offline first
      if (isOffline()) {
        console.warn('User is offline - returning fallback response');
        return this.createOfflineFallbackResponse();
      }

      // Check backend health periodically
      await this.ensureBackendHealth();
      console.log('After health check - Backend healthy:', this.isBackendHealthy);

      // If backend is known to be unhealthy, return fallback immediately
      if (!this.isBackendHealthy) {
        console.warn('Backend is unhealthy - returning fallback response');
        return this.createServiceUnavailableFallbackResponse();
      }

      // Validate input data
      const validationErrors = DataTransformUtils.validateFormData(data);
      if (Object.keys(validationErrors).length > 0) {
        console.error('Validation errors:', validationErrors);
        throw this.createValidationError(validationErrors);
      }

      // Transform data to backend format
      const requestData = transformRequestData(data);
      console.log('Transformed request data:', requestData);

      // Make API request with retry logic
      console.log('Making API request to /predict...');
      const backendResponse = await retryWithBackoff(async () => {
        return await this.httpClient.request('/predict', {
          method: 'POST',
          body: JSON.stringify(requestData),
        });
      });

      console.log('Backend response received:', backendResponse);

      // Mark backend as healthy after successful request
      this.isBackendHealthy = true;

      // Transform response to frontend format
      const result = transformResponseData(backendResponse);

      console.log('Final transformed result:', result);
      console.log('Stress prediction completed successfully:', {
        level: result.level,
        score: result.score,
        confidence: result.confidence
      });

      return result;

    } catch (error) {
      console.error('=== PREDICTION ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      
      // Handle different error types with appropriate fallbacks
      return this.handlePredictionError(error, data);
    }
  }

  /**
   * Handle prediction errors with appropriate fallback responses
   * Requirements: 5.1, 5.5
   */
  private handlePredictionError(error: any, originalData: StressPredictionData): PredictionResult {
    if (error instanceof Error && 'type' in error) {
      const predictionError = error as PredictionError;
      
      switch (predictionError.type) {
        case PredictionErrorType.NETWORK_ERROR:
        case PredictionErrorType.TIMEOUT_ERROR:
          // Mark backend as unhealthy for network/timeout errors
          this.isBackendHealthy = false;
          return this.createNetworkErrorFallbackResponse();
          
        case PredictionErrorType.SERVER_ERROR:
          // Mark backend as unhealthy for server errors
          this.isBackendHealthy = false;
          return this.createServerErrorFallbackResponse();
          
        case PredictionErrorType.VALIDATION_ERROR:
          // Don't mark backend as unhealthy for validation errors
          return this.createValidationErrorFallbackResponse(predictionError.details);
          
        default:
          return this.createGenericErrorFallbackResponse();
      }
    }

    // For unknown errors, provide generic fallback
    return this.createGenericErrorFallbackResponse();
  }

  /**
   * Ensure backend health is checked periodically
   */
  private async ensureBackendHealth(): Promise<void> {
    const now = Date.now();
    
    // Only check health if enough time has passed since last check
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return;
    }

    this.lastHealthCheck = now;
    
    try {
      const isHealthy = await this.checkHealth();
      this.isBackendHealthy = isHealthy;
      
      if (!isHealthy) {
        console.warn('Backend health check failed - will use fallback responses');
      }
    } catch (error) {
      console.warn('Health check failed:', error);
      this.isBackendHealthy = false;
    }
  }

  /**
   * Create fallback response for offline scenarios
   */
  private createOfflineFallbackResponse(): PredictionResult {
    const fallback = createFallbackResponse();
    return {
      ...fallback,
      insights: [
        "You appear to be offline",
        "Connect to the internet for personalized analysis",
        "These are general wellness recommendations"
      ],
      wellnessPlan: {
        ...fallback.wellnessPlan,
        title: "Offline Wellness Plan",
        summary: "Basic wellness practices while offline"
      }
    };
  }

  /**
   * Create fallback response for service unavailable scenarios
   */
  private createServiceUnavailableFallbackResponse(): PredictionResult {
    const fallback = createFallbackResponse();
    return {
      ...fallback,
      insights: [
        "Our analysis service is temporarily unavailable",
        "We're working to restore full functionality",
        "Please try again in a few minutes"
      ],
      wellnessPlan: {
        ...fallback.wellnessPlan,
        title: "Temporary Wellness Plan",
        summary: "Essential practices while we restore service"
      }
    };
  }

  /**
   * Create fallback response for network errors
   */
  private createNetworkErrorFallbackResponse(): PredictionResult {
    const fallback = createFallbackResponse();
    return {
      ...fallback,
      insights: [
        "Unable to connect to our servers",
        "Please check your internet connection",
        "Try again when connection is restored"
      ],
      recommendations: [
        ...fallback.recommendations,
        "Check your internet connection",
        "Try refreshing the page"
      ]
    };
  }

  /**
   * Create fallback response for server errors
   */
  private createServerErrorFallbackResponse(): PredictionResult {
    const fallback = createFallbackResponse();
    return {
      ...fallback,
      insights: [
        "Our servers are experiencing technical difficulties",
        "Our team has been notified and is working on a fix",
        "Please try again in a few minutes"
      ],
      recommendations: [
        ...fallback.recommendations,
        "Try again in a few minutes",
        "Contact support if the issue persists"
      ]
    };
  }

  /**
   * Create fallback response for validation errors
   */
  private createValidationErrorFallbackResponse(validationDetails?: any): PredictionResult {
    const fallback = createFallbackResponse();
    
    const validationInsights = validationDetails 
      ? Object.entries(validationDetails).map(([field, error]) => `${field}: ${error}`)
      : ["Some input values are outside expected ranges"];

    return {
      ...fallback,
      insights: [
        "Input validation failed",
        ...validationInsights.slice(0, 3), // Limit to 3 validation errors
        "Please check your input values and try again"
      ],
      recommendations: [
        "Review and correct the highlighted fields",
        "Ensure all values are within valid ranges",
        ...fallback.recommendations.slice(0, 2) // Keep first 2 general recommendations
      ]
    };
  }

  /**
   * Create fallback response for generic errors
   */
  private createGenericErrorFallbackResponse(): PredictionResult {
    const fallback = createFallbackResponse();
    return {
      ...fallback,
      insights: [
        "An unexpected error occurred during analysis",
        "This might be a temporary issue",
        "Please try again or contact support if the problem persists"
      ]
    };
  }

  /**
   * Check if backend API is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      console.log('Checking backend health at:', `${API_BASE_URL}/health`);
      const response = await this.httpClient.request<{ status: string }>('/health', {
        method: 'GET',
      });
      
      console.log('Health check response:', response);
      // Consider backend healthy if status is "healthy" or "degraded"
      const isHealthy = response.status === 'healthy' || response.status === 'degraded';
      console.log('Backend is healthy:', isHealthy);
      return isHealthy;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Get detailed backend status information
   */
  async getBackendStatus(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const response = await this.httpClient.request<{ status: string; [key: string]: any }>('/health', {
        method: 'GET',
      });
      
      return {
        healthy: response.status === 'healthy' || response.status === 'degraded',
        details: response
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Create validation error
   */
  private createValidationError(validationErrors: Record<string, string>): PredictionError {
    const error = new Error('Input validation failed') as PredictionError;
    error.type = PredictionErrorType.VALIDATION_ERROR;
    error.retryable = false;
    error.details = validationErrors;
    return error;
  }

  /**
   * Create unknown error
   */
  private createUnknownError(originalError: any): PredictionError {
    const error = new Error(
      originalError?.message || 'An unexpected error occurred'
    ) as PredictionError;
    error.type = PredictionErrorType.UNKNOWN_ERROR;
    error.retryable = false;
    error.details = originalError;
    return error;
  }
}

// Create singleton instance
const predictionService = new PredictionService();

/**
 * Main function to analyze stress level - replaces analyzeStressLevel from geminiService
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export const analyzeStressLevel = async (data: StressPredictionData): Promise<PredictionResult> => {
  return await predictionService.predictStressLevel(data);
};

/**
 * Health check function
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  return await predictionService.checkHealth();
};

/**
 * Get detailed backend status
 */
export const getBackendStatus = async (): Promise<{ healthy: boolean; details?: any }> => {
  return await predictionService.getBackendStatus();
};

/**
 * Check if user is currently offline
 */
export const isUserOffline = (): boolean => {
  return isOffline();
};

/**
 * Export the service instance for advanced usage
 */
export default predictionService;