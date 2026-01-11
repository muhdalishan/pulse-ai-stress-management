#!/usr/bin/env python3
"""
PULSE-AI Backend API - FastAPI Application

This module implements the main FastAPI application for serving the trained
machine learning model for stress prediction. It provides REST API endpoints
for the frontend React application.

Features:
- FastAPI application with automatic OpenAPI documentation
- CORS configuration for frontend integration
- Health check endpoint for service monitoring
- Async request handling for high concurrency
- ML model loading and prediction logic

Requirements covered: 1.1, 1.5
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from datetime import datetime, timedelta
import os
from pathlib import Path
import pickle
import numpy as np
from typing import Dict, Any, Optional, List
import hashlib
import json
from pydantic import ValidationError as PydanticValidationError

# Import schemas
from schemas import (
    StressPredictionRequest, 
    StressPredictionResponse, 
    ErrorResponse,
    WellnessPlan,
    WellnessTask
)

# Import sklearn classes for model loading
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.naive_bayes import GaussianNB
    from sklearn.neighbors import KNeighborsClassifier
except ImportError as e:
    logging.warning(f"Could not import some sklearn classes: {e}")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pulse_ai_backend.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# Set specific log levels for different components
logging.getLogger('uvicorn').setLevel(logging.INFO)
logging.getLogger('fastapi').setLevel(logging.INFO)


# ML Model Service Class
class ModelService:
    """Service class for handling ML model operations."""
    
    def __init__(self, model_path: str = "pulse_ai_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_names = None
        self.model_name = None
        self.model_score = None
        self.is_loaded = False
        
        # Expected feature names
        self.expected_features = [
            'Age', 'Gender', 'Sleep_Duration', 'Sleep_Quality', 
            'Physical_Activity', 'Screen_Time', 'Caffeine_Intake', 
            'Smoking_Habit', 'Work_Hours', 'Travel_Time', 
            'Social_Interactions', 'Meditation_Practice', 'Exercise_Type'
        ]
        
        # Categorical mappings
        self.categorical_mappings = {
            'Gender': {'Male': 0, 'Female': 1},
            'Smoking_Habit': {'No': 0, 'Yes': 1},
            'Meditation_Practice': {'No': 0, 'Yes': 1},
            'Exercise_Type': {
                'Cardio': 0, 'Yoga': 1, 'Strength Training': 2, 
                'Aerobics': 3, 'Walking': 4, 'Pilates': 5
            }
        }
    
    def load_model(self) -> bool:
        """Load the trained ML model from the pickle file."""
        try:
            logger.info(f"Loading ML model from: {self.model_path}")
            
            if not os.path.exists(self.model_path):
                logger.error(f"Model file not found: {self.model_path}")
                return False
            
            with open(self.model_path, 'rb') as f:
                model_artifacts = pickle.load(f)
            
            # Extract model components
            self.model = model_artifacts['model']
            self.feature_names = model_artifacts['feature_names']
            self.model_name = model_artifacts['model_name']
            self.model_score = model_artifacts['model_score']
            
            logger.info(f"Model loaded: {self.model_name} (score: {self.model_score:.4f})")
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def preprocess_input(self, input_data: Dict[str, Any]) -> Optional[np.ndarray]:
        """Preprocess input data for model prediction."""
        try:
            # Create feature array in the correct order
            processed_features = []
            
            for feature in self.feature_names:
                if feature in input_data:
                    value = input_data[feature]
                    
                    # Handle categorical features
                    if feature in self.categorical_mappings:
                        if value in self.categorical_mappings[feature]:
                            processed_value = self.categorical_mappings[feature][value]
                        else:
                            logger.error(f"Invalid categorical value for {feature}: {value}")
                            return None
                    else:
                        # Handle numerical features
                        try:
                            processed_value = float(value)
                        except (ValueError, TypeError):
                            logger.error(f"Invalid numerical value for {feature}: {value}")
                            return None
                    
                    processed_features.append(processed_value)
                else:
                    logger.error(f"Feature {feature} not found in input data")
                    return None
            
            # Convert to numpy array and reshape for single prediction
            feature_array = np.array(processed_features).reshape(1, -1)
            return feature_array
            
        except Exception as e:
            logger.error(f"Error preprocessing input data: {str(e)}")
            return None
    
    def predict(self, input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Generate stress level prediction with confidence scoring."""
        try:
            if not self.is_loaded:
                logger.error("Model not loaded")
                return None
            
            # Preprocess input data
            processed_features = self.preprocess_input(input_data)
            if processed_features is None:
                return None
            
            # Generate prediction
            prediction = self.model.predict(processed_features)[0]
            
            # Get confidence score
            confidence_score = 0.8  # Default confidence
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(processed_features)[0]
                confidence_score = float(np.max(probabilities))
            
            # Convert prediction to stress level
            stress_level = str(prediction)
            
            # Calculate numerical score
            if stress_level == 'Low':
                numerical_score = 25
            elif stress_level == 'Medium':
                numerical_score = 50
            elif stress_level == 'High':
                numerical_score = 75
            else:
                numerical_score = 50
            
            # Generate insights and recommendations
            insights = self._generate_insights(input_data, stress_level)
            recommendations = self._generate_recommendations(stress_level)
            
            result = {
                'level': stress_level,
                'score': numerical_score,
                'confidence': confidence_score,
                'insights': insights,
                'recommendations': recommendations,
                'model_name': self.model_name,
                'model_score': self.model_score
            }
            
            logger.info(f"Prediction generated: {stress_level} (confidence: {confidence_score:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error generating prediction: {str(e)}")
            return None
    
    def _generate_insights(self, input_data: Dict[str, Any], stress_level: str) -> List[str]:
        """Generate insights based on input data and prediction."""
        insights = []
        
        try:
            sleep_duration = input_data.get('Sleep_Duration', 0)
            if sleep_duration < 6:
                insights.append("Your sleep duration is below the recommended 7-9 hours")
            
            work_hours = input_data.get('Work_Hours', 0)
            if work_hours > 10:
                insights.append("Long work hours may be a significant stress factor")
            
            physical_activity = input_data.get('Physical_Activity', 0)
            if physical_activity < 1:
                insights.append("Increasing physical activity could help reduce stress")
            
            if not insights:
                insights.append(f"Your current stress level is {stress_level.lower()}")
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            insights = [f"Your current stress level is {stress_level.lower()}"]
        
        return insights
    
    def _generate_recommendations(self, stress_level: str) -> List[str]:
        """Generate recommendations based on stress level."""
        if stress_level == 'Low':
            return [
                "Maintain your current healthy lifestyle habits",
                "Continue regular physical activity and good sleep schedule"
            ]
        elif stress_level == 'Medium':
            return [
                "Focus on improving sleep quality and duration",
                "Incorporate regular physical exercise into your routine",
                "Practice stress-reduction techniques like deep breathing"
            ]
        elif stress_level == 'High':
            return [
                "Prioritize getting adequate sleep (7-9 hours per night)",
                "Engage in regular physical activity to reduce stress hormones",
                "Practice meditation or mindfulness exercises daily",
                "Consider speaking with a healthcare professional"
            ]
        else:
            return ["Focus on maintaining a balanced lifestyle"]
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        if not self.is_loaded:
            return {'loaded': False, 'error': 'Model not loaded'}
        
        return {
            'loaded': True,
            'model_name': self.model_name,
            'model_score': self.model_score,
            'feature_count': len(self.feature_names) if self.feature_names else 0,
            'feature_names': self.feature_names,
            'expected_features': self.expected_features
        }


# Global model service instance
model_service = None

# Initialize FastAPI application
app = FastAPI(
    title="PULSE-AI Stress Prediction API",
    description="REST API for stress level prediction using trained ML model",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend integration
# Allow requests from the React frontend (typically running on port 3000 or 5173)
allowed_origins = [
    "http://localhost:3000",  # React development server (Create React App)
    "http://localhost:3001",  # Vite development server (alternative port)
    "http://localhost:5173",  # Vite development server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
]

# Add production origins from environment variables
production_frontend_url = os.getenv("FRONTEND_URL")
if production_frontend_url:
    allowed_origins.append(production_frontend_url)

# Add common Netlify patterns
netlify_url = os.getenv("NETLIFY_URL")
if netlify_url:
    allowed_origins.append(netlify_url)
    # Also allow deploy previews
    allowed_origins.append(f"https://*.netlify.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global variables for application state
app_start_time = datetime.now()
model_loaded = False
model_path = "models/pulse_ai_model_test.pkl"  # Use the working test model in models folder

# Cache for prediction results
prediction_cache = {}
cache_ttl = timedelta(minutes=5)  # 5-minute cache TTL


@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    
    This function runs when the FastAPI application starts up.
    It performs initialization tasks like loading the ML model.
    """
    global model_loaded, model_service
    
    startup_id = f"startup_{datetime.now().timestamp()}"
    logger.info(f"[{startup_id}] Starting PULSE-AI Backend API...")
    logger.info(f"[{startup_id}] Application started at: {app_start_time}")
    
    # Initialize model service with comprehensive error handling
    try:
        # Check for available model files
        model_files = []
        if os.path.exists("models/pulse_ai_model_test.pkl"):
            model_files.append(("models/pulse_ai_model_test.pkl", "test"))
        if os.path.exists("models/pulse_ai_model.pkl"):
            model_files.append(("models/pulse_ai_model.pkl", "production"))
        
        if not model_files:
            logger.error(f"[{startup_id}] No model files found in current directory")
            logger.error(f"[{startup_id}] Current directory: {os.getcwd()}")
            logger.error(f"[{startup_id}] Directory contents: {os.listdir('.')}")
            model_loaded = False
            return
        
        logger.info(f"[{startup_id}] Found model files: {[f[0] for f in model_files]}")
        
        # Try to load models in order of preference
        for model_file, model_type in model_files:
            try:
                logger.info(f"[{startup_id}] Attempting to load {model_type} model: {model_file}")
                
                # Check file integrity
                file_size = os.path.getsize(model_file)
                if file_size == 0:
                    logger.warning(f"[{startup_id}] Model file {model_file} is empty, skipping")
                    continue
                
                logger.info(f"[{startup_id}] Model file size: {file_size} bytes")
                
                # Initialize model service
                model_service = ModelService(model_file)
                
                # Attempt to load the model
                if model_service.load_model():
                    model_loaded = True
                    # Update the global model_path to reflect the actually loaded model
                    global model_path
                    model_path = model_file
                    logger.info(f"[{startup_id}] Successfully loaded {model_type} model: {model_file}")
                    logger.info(f"[{startup_id}] Updated global model_path to: {model_path}")
                    logger.info(f"[{startup_id}] Global model_loaded set to: {model_loaded}")
                    
                    # Log model information
                    model_info = model_service.get_model_info()
                    logger.info(f"[{startup_id}] Model info: {model_info}")
                    break
                else:
                    logger.warning(f"[{startup_id}] Failed to load {model_type} model: {model_file}")
                    model_service = None
                    
            except FileNotFoundError as e:
                logger.warning(f"[{startup_id}] Model file not found: {model_file} - {str(e)}")
                continue
                
            except PermissionError as e:
                logger.error(f"[{startup_id}] Permission denied accessing model file: {model_file} - {str(e)}")
                continue
                
            except Exception as e:
                logger.error(f"[{startup_id}] Error loading {model_type} model {model_file}: {str(e)}")
                logger.error(f"[{startup_id}] Error type: {type(e).__name__}")
                continue
        
        # Final status check
        if model_loaded and model_service:
            logger.info(f"[{startup_id}] ML model initialization completed successfully")
            logger.info(f"[{startup_id}] Model ready for predictions")
        else:
            logger.error(f"[{startup_id}] Failed to initialize any ML model")
            logger.error(f"[{startup_id}] API will use fallback responses for all predictions")
            model_loaded = False
            model_service = None
            
    except Exception as e:
        logger.error(f"[{startup_id}] Critical error during model initialization: {str(e)}")
        logger.error(f"[{startup_id}] Exception type: {type(e).__name__}")
        
        # Log system information for debugging
        try:
            import sys
            logger.error(f"[{startup_id}] Python version: {sys.version}")
            logger.error(f"[{startup_id}] Working directory: {os.getcwd()}")
            logger.error(f"[{startup_id}] Environment variables: {dict(os.environ)}")
        except Exception as sys_error:
            logger.error(f"[{startup_id}] Could not log system info: {str(sys_error)}")
        
        model_loaded = False
        model_service = None
    
    logger.info(f"[{startup_id}] PULSE-AI Backend API startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler.
    
    This function runs when the FastAPI application shuts down.
    It performs cleanup tasks and logs shutdown information.
    """
    logger.info("Shutting down PULSE-AI Backend API...")
    uptime = datetime.now() - app_start_time
    logger.info(f"Application uptime: {uptime}")
    logger.info("PULSE-AI Backend API shutdown complete")


@app.get("/")
async def root():
    """
    Root endpoint that provides basic API information.
    
    Returns:
        dict: Basic API information including name, version, and status
    """
    return {
        "name": "PULSE-AI Stress Prediction API",
        "version": "1.0.0",
        "status": "running",
        "message": "Welcome to the PULSE-AI Backend API"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for service monitoring.
    
    This endpoint provides detailed health information about the API service,
    including uptime, model status, and system information. It's designed
    for use by monitoring systems and load balancers.
    
    Returns:
        dict: Comprehensive health status information
        
    Requirements: 1.1, 1.5
    """
    health_id = f"health_{datetime.now().timestamp()}"
    
    try:
        # Calculate uptime
        uptime = datetime.now() - app_start_time
        uptime_seconds = int(uptime.total_seconds())
        
        # Debug logging for health check
        logger.info(f"[{health_id}] Health check - model_loaded: {model_loaded}")
        logger.info(f"[{health_id}] Health check - model_path: {model_path}")
        logger.info(f"[{health_id}] Health check - model_service exists: {model_service is not None}")
        logger.info(f"[{health_id}] Health check - model_service.is_loaded: {model_service.is_loaded if model_service else 'N/A'}")
        
        # Check model file status
        model_file_exists = os.path.exists(model_path)
        model_file_size = os.path.getsize(model_path) if model_file_exists else 0
        
        # Check model service status
        model_service_status = model_service is not None and model_service.is_loaded
        
        # Get system resource information
        try:
            import psutil
            memory_info = psutil.virtual_memory()
            disk_info = psutil.disk_usage('.')
            cpu_percent = psutil.cpu_percent(interval=1)
            
            system_resources = {
                "memory_total_gb": round(memory_info.total / (1024**3), 2),
                "memory_available_gb": round(memory_info.available / (1024**3), 2),
                "memory_percent": memory_info.percent,
                "disk_total_gb": round(disk_info.total / (1024**3), 2),
                "disk_free_gb": round(disk_info.free / (1024**3), 2),
                "disk_percent": round((disk_info.used / disk_info.total) * 100, 2),
                "cpu_percent": cpu_percent
            }
        except ImportError:
            system_resources = {"note": "psutil not available for resource monitoring"}
        except Exception as resource_error:
            logger.warning(f"[{health_id}] Error getting system resources: {str(resource_error)}")
            system_resources = {"error": "Could not retrieve system resources"}
        
        # Prepare health status
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "uptime": {
                "seconds": uptime_seconds,
                "human_readable": str(uptime).split('.')[0]  # Remove microseconds
            },
            "service": {
                "name": "PULSE-AI Backend API",
                "version": "1.0.0",
                "environment": os.getenv("ENVIRONMENT", "development")
            },
            "model": {
                "loaded": model_loaded,
                "service_ready": model_service_status,
                "file_exists": model_file_exists,
                "file_path": model_path,
                "file_size_bytes": model_file_size
            },
            "system": {
                "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
                "working_directory": str(Path.cwd()),
                "resources": system_resources
            },
            "cache": {
                "entries": len(prediction_cache),
                "ttl_minutes": int(cache_ttl.total_seconds() / 60)
            }
        }
        
        # Add model details if available
        if model_service and model_service.is_loaded:
            try:
                model_info = model_service.get_model_info()
                health_status["model"].update({
                    "model_name": model_info.get("model_name"),
                    "model_score": model_info.get("model_score"),
                    "feature_count": model_info.get("feature_count")
                })
            except Exception as model_info_error:
                logger.warning(f"[{health_id}] Error getting model info: {str(model_info_error)}")
        
        # Determine overall health status
        warnings = []
        if not model_file_exists:
            warnings.append("ML model file not found")
        if not model_service_status:
            warnings.append("ML model service not ready")
        if len(prediction_cache) > 1000:  # Arbitrary threshold
            warnings.append("Prediction cache is large")
        
        if warnings:
            health_status["status"] = "degraded"
            health_status["warnings"] = warnings
        
        logger.debug(f"[{health_id}] Health check completed successfully")
        return health_status
        
    except Exception as e:
        logger.error(f"[{health_id}] Health check failed: {str(e)}")
        logger.error(f"[{health_id}] Exception type: {type(e).__name__}")
        
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": "Health check failed",
                "details": str(e),
                "health_id": health_id
            }
        )


def _generate_cache_key(request_data: Dict[str, Any]) -> str:
    """Generate a cache key for the prediction request."""
    # Sort the dictionary to ensure consistent key generation
    sorted_data = json.dumps(request_data, sort_keys=True)
    return hashlib.md5(sorted_data.encode()).hexdigest()


def _is_cache_valid(timestamp: datetime) -> bool:
    """Check if a cache entry is still valid."""
    return datetime.now() - timestamp < cache_ttl


def _create_fallback_response() -> StressPredictionResponse:
    """
    Create a fallback response when model prediction fails.
    
    This provides a safe default response that maintains the expected
    interface while indicating that the prediction could not be completed.
    
    Requirements: 1.4, 5.2
    """
    try:
        fallback_wellness_plan = WellnessPlan(
            title="Basic Wellness Plan",
            summary="General wellness recommendations while we resolve technical issues",
            tasks=[
                WellnessTask(
                    id="fallback-1",
                    title="Practice Deep Breathing",
                    type="tool",
                    link="/tools/breathing",
                    reward=10
                ),
                WellnessTask(
                    id="fallback-2",
                    title="Take a Short Walk",
                    type="lifestyle", 
                    link="/wellness/walking",
                    reward=10
                ),
                WellnessTask(
                    id="fallback-3",
                    title="Stay Hydrated",
                    type="lifestyle",
                    link="/wellness/hydration",
                    reward=5
                )
            ]
        )
        
        fallback_response = StressPredictionResponse(
            level="Medium",
            score=50,
            confidence=0.5,
            insights=[
                "We're experiencing technical difficulties with our analysis",
                "Please try again in a few minutes for a personalized assessment"
            ],
            recommendations=[
                "Focus on basic wellness practices",
                "Maintain regular sleep and exercise routines",
                "Practice stress-reduction techniques"
            ],
            wellness_plan=fallback_wellness_plan,
            model_name="Fallback Response",
            model_score=None
        )
        
        logger.info("Fallback response created successfully")
        return fallback_response
        
    except Exception as e:
        logger.error(f"Error creating fallback response: {str(e)}")
        
        # Create minimal fallback if even the standard fallback fails
        try:
            minimal_plan = WellnessPlan(
                title="Emergency Wellness Plan",
                summary="Basic recommendations",
                tasks=[
                    WellnessTask(
                        id="emergency-1",
                        title="Take Deep Breaths",
                        type="tool",
                        link="/tools/breathing",
                        reward=5
                    )
                ]
            )
            
            return StressPredictionResponse(
                level="Medium",
                score=50,
                confidence=0.5,
                insights=["Service temporarily unavailable"],
                recommendations=["Please try again later"],
                wellness_plan=minimal_plan,
                model_name="Emergency Fallback",
                model_score=None
            )
            
        except Exception as critical_error:
            logger.critical(f"Critical error creating minimal fallback: {str(critical_error)}")
            # This should never happen, but if it does, we need to raise an exception
            # so the global exception handler can deal with it
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "ServiceUnavailable",
                    "message": "Service is temporarily unavailable",
                    "timestamp": datetime.now().isoformat()
                }
            )


def _log_prediction_request(request_data: Dict[str, Any], client_ip: str = None):
    """Log prediction request details for monitoring and debugging."""
    try:
        request_id = f"req_{datetime.now().timestamp()}_{hash(str(request_data)) % 10000:04d}"
        
        # Log basic request info without sensitive data
        logger.info(f"[{request_id}] Prediction request received from {client_ip or 'unknown'}")
        logger.info(f"[{request_id}] Request features: {list(request_data.keys())}")
        
        # Log key metrics for analysis (anonymized)
        age = request_data.get('Age', 'unknown')
        sleep_duration = request_data.get('Sleep_Duration', 'unknown')
        work_hours = request_data.get('Work_Hours', 'unknown')
        physical_activity = request_data.get('Physical_Activity', 'unknown')
        stress_indicators = []
        
        # Identify potential stress indicators for monitoring
        if isinstance(sleep_duration, (int, float)) and sleep_duration < 6:
            stress_indicators.append("low_sleep")
        if isinstance(work_hours, (int, float)) and work_hours > 10:
            stress_indicators.append("long_work_hours")
        if isinstance(physical_activity, (int, float)) and physical_activity < 2:
            stress_indicators.append("low_activity")
        
        logger.info(f"[{request_id}] Key metrics - Age: {age}, Sleep: {sleep_duration}h, "
                   f"Work: {work_hours}h, Activity: {physical_activity}")
        
        if stress_indicators:
            logger.info(f"[{request_id}] Stress indicators detected: {', '.join(stress_indicators)}")
        
        # Log request timing for performance monitoring
        logger.debug(f"[{request_id}] Request processing started at {datetime.now().isoformat()}")
        
        return request_id
        
    except Exception as e:
        logger.error(f"Error logging prediction request: {str(e)}")
        return f"req_error_{datetime.now().timestamp()}"


def _log_prediction_result(result: Dict[str, Any], cache_hit: bool = False, request_id: str = None):
    """Log prediction result for monitoring and analysis."""
    try:
        level = result.get('level', 'unknown')
        confidence = result.get('confidence', 0)
        model_name = result.get('model_name', 'unknown')
        
        cache_status = "cache_hit" if cache_hit else "fresh_prediction"
        log_id = request_id or f"result_{datetime.now().timestamp()}"
        
        logger.info(f"[{log_id}] Prediction result - Level: {level}, Confidence: {confidence:.3f}, "
                   f"Model: {model_name}, Status: {cache_status}")
        
        # Log performance metrics
        processing_time = datetime.now()
        logger.debug(f"[{log_id}] Result generated at {processing_time.isoformat()}")
        
        # Log stress level distribution for monitoring
        if level in ['Low', 'Medium', 'High']:
            logger.info(f"[{log_id}] Stress level distribution: {level}")
        
        # Log confidence score ranges for model performance monitoring
        if confidence < 0.5:
            logger.warning(f"[{log_id}] Low confidence prediction: {confidence:.3f}")
        elif confidence > 0.9:
            logger.info(f"[{log_id}] High confidence prediction: {confidence:.3f}")
        
    except Exception as e:
        logger.error(f"Error logging prediction result: {str(e)}")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors.
    
    This handler catches any unhandled exceptions and provides
    a consistent error response format while logging the error
    for debugging purposes.
    
    Requirements: 1.4, 5.2
    """
    # Generate unique error ID for tracking
    error_id = f"err_{datetime.now().timestamp()}_{hash(str(exc)) % 10000:04d}"
    
    # Log comprehensive error information
    logger.error(f"[{error_id}] Unhandled exception in {request.method} {request.url}")
    logger.error(f"[{error_id}] Exception type: {type(exc).__name__}")
    logger.error(f"[{error_id}] Exception message: {str(exc)}")
    
    # Log request details for debugging
    try:
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get('user-agent', 'unknown')
        content_type = request.headers.get('content-type', 'unknown')
        
        logger.error(f"[{error_id}] Request from: {client_ip}")
        logger.error(f"[{error_id}] User-Agent: {user_agent}")
        logger.error(f"[{error_id}] Content-Type: {content_type}")
        
        # Log request body for POST requests (but limit size)
        if request.method == "POST":
            try:
                body = await request.body()
                if len(body) > 0:
                    body_preview = body[:500].decode('utf-8', errors='ignore')
                    logger.error(f"[{error_id}] Request body preview: {body_preview}")
            except Exception as body_error:
                logger.error(f"[{error_id}] Could not read request body: {str(body_error)}")
                
    except Exception as log_error:
        logger.error(f"[{error_id}] Error logging request details: {str(log_error)}")
    
    # Log stack trace for debugging
    import traceback
    logger.error(f"[{error_id}] Stack trace:\n{traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please try again later.",
            "error_id": error_id,
            "timestamp": datetime.now().isoformat(),
        }
    )


def _create_wellness_plan(stress_level: str, insights: List[str]) -> WellnessPlan:
    """Create a wellness plan based on stress level and insights."""
    if stress_level == "Low":
        title = "Maintenance Wellness Plan"
        summary = "Keep up your great habits with these maintenance activities"
        tasks = [
            WellnessTask(
                id="maintain-1",
                title="Continue Regular Exercise",
                type="lifestyle",
                link="/wellness/exercise",
                reward=10
            ),
            WellnessTask(
                id="maintain-2", 
                title="Maintain Sleep Schedule",
                type="lifestyle",
                link="/wellness/sleep",
                reward=10
            )
        ]
    elif stress_level == "Medium":
        title = "Balanced Stress Management Plan"
        summary = "Targeted activities to help reduce your moderate stress levels"
        tasks = [
            WellnessTask(
                id="medium-1",
                title="Daily Meditation Practice",
                type="tool",
                link="/tools/meditation",
                reward=15
            ),
            WellnessTask(
                id="medium-2",
                title="Improve Sleep Hygiene",
                type="article",
                link="/articles/sleep-hygiene",
                reward=10
            ),
            WellnessTask(
                id="medium-3",
                title="30-Minute Daily Walk",
                type="lifestyle",
                link="/wellness/walking",
                reward=15
            )
        ]
    else:  # High stress
        title = "Intensive Stress Relief Plan"
        summary = "Comprehensive plan to help manage your high stress levels"
        tasks = [
            WellnessTask(
                id="high-1",
                title="Deep Breathing Exercises",
                type="tool",
                link="/tools/breathing",
                reward=20
            ),
            WellnessTask(
                id="high-2",
                title="Professional Stress Management",
                type="article",
                link="/articles/professional-help",
                reward=15
            ),
            WellnessTask(
                id="high-3",
                title="Sleep Optimization Program",
                type="lifestyle",
                link="/wellness/sleep-program",
                reward=20
            ),
            WellnessTask(
                id="high-4",
                title="Regular Exercise Routine",
                type="lifestyle",
                link="/wellness/exercise-routine",
                reward=20
            )
        ]
    
    return WellnessPlan(title=title, summary=summary, tasks=tasks)
    """Create a wellness plan based on stress level and insights."""
    if stress_level == "Low":
        title = "Maintenance Wellness Plan"
        summary = "Keep up your great habits with these maintenance activities"
        tasks = [
            WellnessTask(
                id="maintain-1",
                title="Continue Regular Exercise",
                type="lifestyle",
                link="/wellness/exercise",
                reward=10
            ),
            WellnessTask(
                id="maintain-2", 
                title="Maintain Sleep Schedule",
                type="lifestyle",
                link="/wellness/sleep",
                reward=10
            )
        ]
    elif stress_level == "Medium":
        title = "Balanced Stress Management Plan"
        summary = "Targeted activities to help reduce your moderate stress levels"
        tasks = [
            WellnessTask(
                id="medium-1",
                title="Daily Meditation Practice",
                type="tool",
                link="/tools/meditation",
                reward=15
            ),
            WellnessTask(
                id="medium-2",
                title="Improve Sleep Hygiene",
                type="article",
                link="/articles/sleep-hygiene",
                reward=10
            ),
            WellnessTask(
                id="medium-3",
                title="30-Minute Daily Walk",
                type="lifestyle",
                link="/wellness/walking",
                reward=15
            )
        ]
    else:  # High stress
        title = "Intensive Stress Relief Plan"
        summary = "Comprehensive plan to help manage your high stress levels"
        tasks = [
            WellnessTask(
                id="high-1",
                title="Deep Breathing Exercises",
                type="tool",
                link="/tools/breathing",
                reward=20
            ),
            WellnessTask(
                id="high-2",
                title="Professional Stress Management",
                type="article",
                link="/articles/professional-help",
                reward=15
            ),
            WellnessTask(
                id="high-3",
                title="Sleep Optimization Program",
                type="lifestyle",
                link="/wellness/sleep-program",
                reward=20
            ),
            WellnessTask(
                id="high-4",
                title="Regular Exercise Routine",
                type="lifestyle",
                link="/wellness/exercise-routine",
                reward=20
            )
        ]
    
    return WellnessPlan(title=title, summary=summary, tasks=tasks)


@app.get("/debug/logs")
async def get_recent_logs():
    """
    Debug endpoint to retrieve recent log entries.
    
    This endpoint provides access to recent log entries for debugging purposes.
    It should be secured in production environments.
    
    Returns:
        dict: Recent log entries and system status
    """
    debug_id = f"debug_{datetime.now().timestamp()}"
    
    try:
        # Read recent log entries from the log file
        log_entries = []
        log_file_path = "pulse_ai_backend.log"
        
        if os.path.exists(log_file_path):
            try:
                with open(log_file_path, 'r') as log_file:
                    lines = log_file.readlines()
                    # Get last 50 lines
                    recent_lines = lines[-50:] if len(lines) > 50 else lines
                    log_entries = [line.strip() for line in recent_lines if line.strip()]
            except Exception as file_error:
                logger.warning(f"[{debug_id}] Could not read log file: {str(file_error)}")
                log_entries = ["Could not read log file"]
        else:
            log_entries = ["Log file not found"]
        
        # Get current application state
        app_state = {
            "model_loaded": model_loaded,
            "model_service_ready": model_service is not None and model_service.is_loaded,
            "cache_entries": len(prediction_cache),
            "uptime_seconds": int((datetime.now() - app_start_time).total_seconds()),
            "current_time": datetime.now().isoformat()
        }
        
        # Get model information if available
        model_debug_info = {}
        if model_service and model_service.is_loaded:
            try:
                model_debug_info = model_service.get_model_info()
            except Exception as model_error:
                model_debug_info = {"error": f"Could not get model info: {str(model_error)}"}
        
        debug_response = {
            "debug_id": debug_id,
            "timestamp": datetime.now().isoformat(),
            "application_state": app_state,
            "model_info": model_debug_info,
            "recent_logs": log_entries,
            "log_file_path": log_file_path,
            "note": "This endpoint should be secured in production"
        }
        
        logger.info(f"[{debug_id}] Debug information requested")
        return debug_response
        
    except Exception as e:
        logger.error(f"[{debug_id}] Error retrieving debug information: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "DebugError",
                "message": "Could not retrieve debug information",
                "debug_id": debug_id,
                "timestamp": datetime.now().isoformat()
            }
        )


@app.get("/debug/model")
async def get_model_debug_info():
    """
    Debug endpoint to retrieve detailed model information.
    
    This endpoint provides detailed information about the loaded model
    for debugging and monitoring purposes.
    
    Returns:
        dict: Detailed model information and status
    """
    debug_id = f"model_debug_{datetime.now().timestamp()}"
    
    try:
        if not model_service:
            return {
                "debug_id": debug_id,
                "timestamp": datetime.now().isoformat(),
                "status": "no_model_service",
                "message": "Model service not initialized"
            }
        
        if not model_service.is_loaded:
            return {
                "debug_id": debug_id,
                "timestamp": datetime.now().isoformat(),
                "status": "model_not_loaded",
                "message": "Model service exists but model not loaded",
                "model_path": model_service.model_path
            }
        
        # Get comprehensive model information
        model_info = model_service.get_model_info()
        
        # Add additional debug information
        debug_info = {
            "debug_id": debug_id,
            "timestamp": datetime.now().isoformat(),
            "status": "model_loaded",
            "model_info": model_info,
            "model_path": model_service.model_path,
            "expected_features": model_service.expected_features,
            "categorical_mappings": model_service.categorical_mappings,
            "file_stats": {
                "exists": os.path.exists(model_service.model_path),
                "size_bytes": os.path.getsize(model_service.model_path) if os.path.exists(model_service.model_path) else 0,
                "modified_time": datetime.fromtimestamp(os.path.getmtime(model_service.model_path)).isoformat() if os.path.exists(model_service.model_path) else None
            }
        }
        
        logger.info(f"[{debug_id}] Model debug information requested")
        return debug_info
        
    except Exception as e:
        logger.error(f"[{debug_id}] Error retrieving model debug information: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "ModelDebugError",
                "message": "Could not retrieve model debug information",
                "debug_id": debug_id,
                "timestamp": datetime.now().isoformat(),
                "details": str(e)
            }
        )


@app.post("/predict", response_model=StressPredictionResponse)
async def predict_stress(request: StressPredictionRequest, http_request: Request):
    """
    Predict stress level based on user input data.
    
    This endpoint accepts user stress-related data and returns a prediction
    using the trained ML model. It includes comprehensive validation,
    error handling, and response caching for identical requests.
    
    Requirements: 1.2, 1.3, 6.4
    """
    logger.info("=== PREDICT ENDPOINT CALLED ===")
    client_ip = http_request.client.host if http_request.client else "unknown"
    logger.info(f"Prediction request from {client_ip}")
    
    try:
        # Convert request to model format
        model_input = request.to_model_format()
        
        # Log the prediction request
        request_id = _log_prediction_request(model_input, client_ip)
        
        # Check if model is loaded
        logger.info(f"Model loaded status: {model_loaded}")
        logger.info(f"Model service status: {model_service is not None}")
        logger.info(f"Model service loaded: {model_service.is_loaded if model_service else 'N/A'}")
        
        if not model_loaded or model_service is None:
            logger.error("ML model not available - returning fallback response")
            fallback_response = _create_fallback_response()
            _log_prediction_result({"level": "Medium", "confidence": 0.5, "model_name": "Fallback"})
            return fallback_response
        
        # Generate cache key
        cache_key = _generate_cache_key(model_input)
        
        # Check cache first
        if cache_key in prediction_cache:
            cached_entry = prediction_cache[cache_key]
            if _is_cache_valid(cached_entry['timestamp']):
                logger.info(f"Returning cached prediction for key: {cache_key[:8]}...")
                _log_prediction_result(
                    {"level": cached_entry['response'].level, 
                     "confidence": cached_entry['response'].confidence,
                     "model_name": cached_entry['response'].model_name or "cached"},
                    cache_hit=True
                )
                return cached_entry['response']
            else:
                # Remove expired cache entry
                del prediction_cache[cache_key]
                logger.debug(f"Removed expired cache entry: {cache_key[:8]}...")
        
        # Generate prediction using model service
        try:
            logger.debug(f"Generating prediction for request from {client_ip}")
            prediction_result = model_service.predict(model_input)
            
        except ValueError as validation_error:
            # Handle data validation errors from model service
            logger.warning(f"Model validation error from {client_ip}: {str(validation_error)}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "ModelValidationError",
                    "message": "Input data failed model validation",
                    "details": str(validation_error),
                    "timestamp": datetime.now().isoformat(),
                    "request_id": f"req_{datetime.now().timestamp()}"
                }
            )
            
        except FileNotFoundError as file_error:
            # Handle missing model files
            logger.error(f"Model file not found: {str(file_error)}")
            fallback_response = _create_fallback_response()
            _log_prediction_result({"level": "Medium", "confidence": 0.5, "model_name": "Fallback (File Not Found)"})
            return fallback_response
            
        except MemoryError as memory_error:
            # Handle memory issues during prediction
            logger.error(f"Memory error during prediction: {str(memory_error)}")
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "ServiceUnavailable",
                    "message": "Service temporarily unavailable due to resource constraints",
                    "timestamp": datetime.now().isoformat(),
                    "request_id": f"req_{datetime.now().timestamp()}"
                }
            )
            
        except Exception as model_error:
            # Handle all other model prediction errors
            error_id = f"model_err_{datetime.now().timestamp()}_{hash(str(model_error)) % 10000:04d}"
            logger.error(f"[{error_id}] Model prediction failed from {client_ip}: {str(model_error)}")
            logger.error(f"[{error_id}] Model error type: {type(model_error).__name__}")
            
            # Log model state for debugging
            if model_service:
                logger.error(f"[{error_id}] Model loaded: {model_service.is_loaded}")
                logger.error(f"[{error_id}] Model name: {getattr(model_service, 'model_name', 'unknown')}")
            
            # Return fallback response on model failure
            fallback_response = _create_fallback_response()
            _log_prediction_result({"level": "Medium", "confidence": 0.5, "model_name": f"Fallback ({error_id})"})
            return fallback_response
        
        if prediction_result is None:
            logger.error("Model prediction returned None - returning fallback response")
            fallback_response = _create_fallback_response()
            _log_prediction_result({"level": "Medium", "confidence": 0.5, "model_name": "Fallback (None Result)"})
            return fallback_response
        
        # Log successful prediction
        _log_prediction_result(prediction_result, request_id=request_id)
        
        # Create wellness plan
        try:
            wellness_plan = _create_wellness_plan(
                prediction_result['level'], 
                prediction_result['insights']
            )
        except Exception as wellness_error:
            logger.error(f"Error creating wellness plan: {str(wellness_error)}")
            # Create a basic wellness plan as fallback
            wellness_plan = WellnessPlan(
                title="Basic Wellness Plan",
                summary="General wellness recommendations",
                tasks=[
                    WellnessTask(
                        id="basic-1",
                        title="Practice Mindfulness",
                        type="tool",
                        link="/tools/mindfulness",
                        reward=10
                    )
                ]
            )
        
        # Format response
        try:
            response = StressPredictionResponse(
                level=prediction_result['level'],
                score=prediction_result['score'],
                confidence=prediction_result['confidence'],
                insights=prediction_result['insights'],
                recommendations=prediction_result['recommendations'],
                wellness_plan=wellness_plan,
                model_name=prediction_result.get('model_name'),
                model_score=prediction_result.get('model_score'),
                feature_importance=prediction_result.get('feature_importance')
            )
        except Exception as response_error:
            logger.error(f"Error formatting response: {str(response_error)}")
            # Return fallback response if formatting fails
            fallback_response = _create_fallback_response()
            _log_prediction_result({"level": "Medium", "confidence": 0.5, "model_name": "Fallback (Format Error)"})
            return fallback_response
        
        # Cache the response
        try:
            prediction_cache[cache_key] = {
                'response': response,
                'timestamp': datetime.now()
            }
            
            # Clean up old cache entries (simple cleanup)
            current_time = datetime.now()
            expired_keys = [
                key for key, entry in prediction_cache.items()
                if current_time - entry['timestamp'] > cache_ttl
            ]
            for key in expired_keys:
                del prediction_cache[key]
            
            if expired_keys:
                logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
                
        except Exception as cache_error:
            logger.warning(f"Error managing cache: {str(cache_error)}")
            # Continue without caching if cache operations fail
        
        logger.info(f"Prediction successful: {prediction_result['level']} (cached with key: {cache_key[:8]}...)")
        return response
        
    except PydanticValidationError as e:
        logger.warning(f"Validation error in prediction request from {client_ip}: {str(e)}")
        
        # Format validation errors
        validation_errors = []
        for error in e.errors():
            field_name = '.'.join(str(loc) for loc in error['loc'])
            validation_errors.append({
                "field": field_name,
                "message": error['msg'],
                "value": error.get('input')
            })
        
        raise HTTPException(
            status_code=422,
            detail={
                "error": "ValidationError",
                "message": "Invalid input data provided",
                "details": validation_errors,
                "timestamp": datetime.now().isoformat(),
                "request_id": f"req_{datetime.now().timestamp()}"
            }
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    
    except Exception as e:
        logger.error(f"Unexpected error in prediction endpoint from {client_ip}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        
        # Return fallback response for unexpected errors
        try:
            fallback_response = _create_fallback_response()
            _log_prediction_result({"level": "Medium", "confidence": 0.5, "model_name": "Fallback (Unexpected Error)"})
            return fallback_response
        except Exception as fallback_error:
            logger.critical(f"Fallback response creation failed: {str(fallback_error)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "InternalServerError",
                    "message": "An unexpected error occurred while processing your request",
                    "timestamp": datetime.now().isoformat(),
                    "request_id": f"req_{datetime.now().timestamp()}"
                }
            )


if __name__ == "__main__":
    """
    Main entry point for running the FastAPI application.
    
    This section runs when the script is executed directly.
    It starts the Uvicorn server with appropriate configuration.
    """
    import os
    
    logger.info("Starting PULSE-AI Backend API server...")
    
    # Get port from environment variable (for Render deployment) or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Server will run on {host}:{port}")
    
    # Run the application with Uvicorn
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level="info",
        access_log=True
    )