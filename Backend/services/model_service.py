#!/usr/bin/env python3
"""
PULSE-AI Model Service - ML Model Loading and Prediction

This module handles the loading, initialization, and prediction logic for the
trained machine learning model. It provides a clean interface for the FastAPI
application to interact with the ML model.

Features:
- Model loading with comprehensive error handling
- Preprocessing pipeline initialization
- Prediction logic with confidence scoring
- Feature importance analysis for insights generation

Requirements covered: 1.1, 1.2, 4.3, 6.1
"""

import pickle
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List
import os

# Import sklearn classes that might be needed for unpickling
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.naive_bayes import GaussianNB
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.svm import SVC
    from sklearn.linear_model import LogisticRegression
    from sklearn.tree import DecisionTreeClassifier
except ImportError as e:
    logging.warning(f"Could not import some sklearn classes: {e}")

# Configure logging
logger = logging.getLogger(__name__)


class ModelService:
    """
    Service class for handling ML model operations.
    
    This class provides a clean interface for loading the trained ML model,
    preprocessing input data, and generating predictions with confidence scores.
    It handles all model-related operations and error handling.
    """
    
    def __init__(self, model_path: str = "pulse_ai_model.pkl"):
        """Initialize the ModelService."""
        self.model_path = model_path
        self.model = None
        self.feature_names = None
        self.model_name = None
        self.model_score = None
        self.is_loaded = False
        
        # Expected feature names based on the dataset structure
        self.expected_features = [
            'Age', 'Gender', 'Sleep_Duration', 'Sleep_Quality', 
            'Physical_Activity', 'Screen_Time', 'Caffeine_Intake', 
            'Smoking_Habit', 'Work_Hours', 'Travel_Time', 
            'Social_Interactions', 'Meditation_Practice', 'Exercise_Type'
        ]
        
        # Categorical mappings for preprocessing
        self.categorical_mappings = {
            'Gender': {'Male': 0, 'Female': 1},
            'Smoking_Habit': {'No': 0, 'Yes': 1},
            'Meditation_Practice': {'No': 0, 'Yes': 1},
            'Exercise_Type': {
                'Cardio': 0, 'Yoga': 1, 'Strength Training': 2, 
                'Aerobics': 3, 'Walking': 4, 'Pilates': 5
            }
        }
        
        # Stress level mappings for output
        self.stress_level_mappings = {
            'Low': 0, 'Medium': 1, 'High': 2
        }
        self.reverse_stress_mappings = {v: k for k, v in self.stress_level_mappings.items()}
    
    def load_model(self) -> bool:
        """
        Load the trained ML model from the pickle file.
        
        Requirements: 1.1, 6.1
        """
        try:
            logger.info(f"Loading ML model from: {self.model_path}")
            
            # Check if model file exists
            if not os.path.exists(self.model_path):
                logger.error(f"Model file not found: {self.model_path}")
                return False
            
            # Check file size (basic validation)
            file_size = os.path.getsize(self.model_path)
            if file_size == 0:
                logger.error(f"Model file is empty: {self.model_path}")
                return False
            
            logger.info(f"Model file size: {file_size} bytes")
            
            # Load model artifacts
            with open(self.model_path, 'rb') as f:
                model_artifacts = pickle.load(f)
            
            # Validate model artifacts structure
            required_keys = ['model', 'feature_names', 'model_name', 'model_score']
            for key in required_keys:
                if key not in model_artifacts:
                    logger.error(f"Missing required key in model artifacts: {key}")
                    return False
            
            # Extract model components
            self.model = model_artifacts['model']
            self.feature_names = model_artifacts['feature_names']
            self.model_name = model_artifacts['model_name']
            self.model_score = model_artifacts['model_score']
            
            # Validate model object
            if not hasattr(self.model, 'predict'):
                logger.error("Loaded model does not have predict method")
                return False
            
            # Log model information
            logger.info(f"Model loaded successfully:")
            logger.info(f"  - Model name: {self.model_name}")
            logger.info(f"  - Model score: {self.model_score:.4f}")
            logger.info(f"  - Feature count: {len(self.feature_names)}")
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def preprocess_input(self, input_data: Dict[str, Any]) -> Optional[np.ndarray]:
        """
        Preprocess input data for model prediction.
        
        This method implements a comprehensive preprocessing pipeline that matches
        the training process, including data validation, type conversion, and
        categorical encoding.
        
        Requirements: 1.2, 4.3
        """
        try:
            logger.debug(f"Preprocessing input data: {input_data}")
            
            # Validate required features are present
            missing_features = []
            for feature in self.expected_features:
                if feature not in input_data:
                    missing_features.append(feature)
            
            if missing_features:
                logger.error(f"Missing required features: {missing_features}")
                return None
            
            # Validate data ranges and types BEFORE processing
            validation_errors = self._validate_input_ranges(input_data)
            if validation_errors:
                logger.error(f"Input validation errors: {validation_errors}")
                return None
            
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
                            logger.error(f"Valid values are: {list(self.categorical_mappings[feature].keys())}")
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
            
            logger.debug(f"Preprocessed features shape: {feature_array.shape}")
            logger.debug(f"Preprocessed features: {feature_array[0]}")
            
            return feature_array
            
        except Exception as e:
            logger.error(f"Error preprocessing input data: {str(e)}")
            return None
    
    def _validate_input_ranges(self, input_data: Dict[str, Any]) -> List[str]:
        """Validate input data ranges based on dataset boundaries."""
        errors = []
        
        try:
            # Age validation
            age = input_data.get('Age', 0)
            if not (18 <= age <= 65):
                errors.append(f"Age must be between 18 and 65, got {age}")
            
            # Sleep duration validation
            sleep_duration = input_data.get('Sleep_Duration', 0)
            if not (4 <= sleep_duration <= 12):
                errors.append(f"Sleep_Duration must be between 4 and 12 hours, got {sleep_duration}")
            
            # Sleep quality validation
            sleep_quality = input_data.get('Sleep_Quality', 0)
            if not (1 <= sleep_quality <= 5):
                errors.append(f"Sleep_Quality must be between 1 and 5, got {sleep_quality}")
            
            # Physical activity validation
            physical_activity = input_data.get('Physical_Activity', 0)
            if not (0 <= physical_activity <= 5):
                errors.append(f"Physical_Activity must be between 0 and 5, got {physical_activity}")
            
            # Screen time validation
            screen_time = input_data.get('Screen_Time', 0)
            if not (1 <= screen_time <= 14):
                errors.append(f"Screen_Time must be between 1 and 14 hours, got {screen_time}")
            
            # Caffeine intake validation
            caffeine_intake = input_data.get('Caffeine_Intake', 0)
            if not (0 <= caffeine_intake <= 8):
                errors.append(f"Caffeine_Intake must be between 0 and 8 cups, got {caffeine_intake}")
            
            # Work hours validation
            work_hours = input_data.get('Work_Hours', 0)
            if not (4 <= work_hours <= 16):
                errors.append(f"Work_Hours must be between 4 and 16 hours, got {work_hours}")
            
            # Travel time validation
            travel_time = input_data.get('Travel_Time', 0)
            if not (0 <= travel_time <= 4):
                errors.append(f"Travel_Time must be between 0 and 4 hours, got {travel_time}")
            
            # Social interactions validation
            social_interactions = input_data.get('Social_Interactions', 0)
            if not (1 <= social_interactions <= 5):
                errors.append(f"Social_Interactions must be between 1 and 5, got {social_interactions}")
            
        except Exception as e:
            errors.append(f"Error during validation: {str(e)}")
        
        return errors
    
    def predict(self, input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Generate stress level prediction with confidence scoring.
        
        Requirements: 1.2, 4.3
        """
        try:
            if not self.is_loaded:
                logger.error("Model not loaded. Call load_model() first.")
                return None
            
            # Preprocess input data
            processed_features = self.preprocess_input(input_data)
            if processed_features is None:
                logger.error("Failed to preprocess input data")
                return None
            
            # Generate prediction
            prediction = self.model.predict(processed_features)[0]
            
            # Get prediction probabilities for confidence scoring
            confidence_score = 0.0
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(processed_features)[0]
                confidence_score = float(np.max(probabilities))
            else:
                confidence_score = 0.8  # Default confidence
            
            # Convert prediction to stress level
            if isinstance(prediction, (int, np.integer)):
                if prediction in self.reverse_stress_mappings:
                    stress_level = self.reverse_stress_mappings[prediction]
                else:
                    logger.error(f"Invalid prediction value: {prediction}")
                    return None
            else:
                stress_level = str(prediction)
            
            # Calculate numerical score (0-100)
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
            
            # Get feature importance for additional analysis
            feature_importance = self._get_feature_importance()
            
            result = {
                'level': stress_level,
                'score': numerical_score,
                'confidence': confidence_score,
                'insights': insights,
                'recommendations': recommendations,
                'model_name': self.model_name,
                'model_score': self.model_score,
                'feature_importance': feature_importance
            }
            
            logger.info(f"Prediction generated: {stress_level} (confidence: {confidence_score:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error generating prediction: {str(e)}")
            return None
    
    def _generate_insights(self, input_data: Dict[str, Any], stress_level: str) -> List[str]:
        """Generate insights based on input data, prediction, and feature importance analysis."""
        insights = []
        
        try:
            # Get feature importance if available
            feature_importance = self._get_feature_importance()
            
            # Sleep-related insights
            sleep_duration = input_data.get('Sleep_Duration', 0)
            if sleep_duration < 6:
                insights.append("Your sleep duration is below the recommended 7-9 hours")
            elif sleep_duration > 9:
                insights.append("You're getting plenty of sleep, which is great for stress management")
            
            # Work-related insights
            work_hours = input_data.get('Work_Hours', 0)
            if work_hours > 10:
                insights.append("Long work hours may be a significant stress factor")
            
            # Physical activity insights
            physical_activity = input_data.get('Physical_Activity', 0)
            if physical_activity < 1:
                insights.append("Increasing physical activity could help reduce stress")
            
            # Feature importance insights
            if feature_importance:
                top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
                if len(top_features) > 0:
                    top_feature_name = top_features[0][0]
                    if top_feature_name in input_data:
                        insights.append(f"Your {top_feature_name.lower().replace('_', ' ')} appears to be a key factor in your stress level")
            
            # Screen time insights
            screen_time = input_data.get('Screen_Time', 0)
            if screen_time > 8:
                insights.append("High screen time may be contributing to your stress levels")
            
            # Caffeine insights
            caffeine_intake = input_data.get('Caffeine_Intake', 0)
            if caffeine_intake > 3:
                insights.append("High caffeine intake might be affecting your stress levels")
            
            # Default insight if none generated
            if not insights:
                insights.append(f"Your current stress level is {stress_level.lower()}")
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            insights = [f"Your current stress level is {stress_level.lower()}"]
        
        return insights
    
    def _get_feature_importance(self) -> Optional[Dict[str, float]]:
        """Get feature importance from the model if available."""
        try:
            if not self.is_loaded or not hasattr(self.model, 'feature_importances_'):
                return None
            
            importance_scores = self.model.feature_importances_
            feature_importance = {}
            
            for i, feature_name in enumerate(self.feature_names):
                if i < len(importance_scores):
                    feature_importance[feature_name] = float(importance_scores[i])
            
            return feature_importance
            
        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return None
    
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
            'feature_count': len(self.feature_names),
            'feature_names': self.feature_names,
            'expected_features': self.expected_features
        }


# Global model service instance
model_service = None


def initialize_model_service(model_path: str = "pulse_ai_model.pkl") -> bool:
    """
    Initialize the global model service instance.
    
    Requirements: 1.1, 6.1
    """
    global model_service
    
    try:
        logger.info("Initializing ModelService...")
        model_service = ModelService(model_path)
        
        if model_service.load_model():
            logger.info("ModelService initialized successfully")
            return True
        else:
            logger.error("Failed to load model during initialization")
            model_service = None
            return False
            
    except Exception as e:
        logger.error(f"Error initializing ModelService: {str(e)}")
        model_service = None
        return False


def get_model_service() -> Optional[ModelService]:
    """Get the global model service instance."""
    return model_service


def is_model_ready() -> bool:
    """Check if the model service is ready for predictions."""
    return model_service is not None and model_service.is_loaded