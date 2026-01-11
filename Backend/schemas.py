#!/usr/bin/env python3
"""
PULSE-AI Backend API - Pydantic Schemas

This module defines Pydantic models for request/response validation and serialization.
These schemas ensure data integrity and provide automatic validation for the FastAPI
endpoints, matching the frontend interface requirements.

Features:
- StressPredictionRequest schema with comprehensive field validation
- StressPredictionResponse schema matching frontend interface
- Custom validators for business logic constraints
- Error response schemas for standardized error handling

Requirements covered: 2.4, 4.1, 4.2
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Dict, Any, Optional, Union
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class GenderEnum(str, Enum):
    """Valid gender options for the stress prediction model."""
    MALE = "Male"
    FEMALE = "Female"


class SmokingHabitEnum(str, Enum):
    """Valid smoking habit options."""
    YES = "Yes"
    NO = "No"


class MeditationPracticeEnum(str, Enum):
    """Valid meditation practice options."""
    YES = "Yes"
    NO = "No"


class ExerciseTypeEnum(str, Enum):
    """Valid exercise type options matching the ML model categories."""
    CARDIO = "Cardio"
    YOGA = "Yoga"
    STRENGTH_TRAINING = "Strength Training"
    AEROBICS = "Aerobics"
    WALKING = "Walking"
    PILATES = "Pilates"


class StressLevelEnum(str, Enum):
    """Valid stress level categories."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class StressPredictionRequest(BaseModel):
    """
    Request schema for stress prediction endpoint.
    
    This schema validates all input data required by the ML model,
    ensuring data integrity and proper type conversion.
    
    Requirements: 2.4, 4.1
    """
    
    # Demographic information
    age: int = Field(
        ...,
        ge=18,
        le=65,
        description="Age in years (18-65)"
    )
    
    gender: GenderEnum = Field(
        ...,
        description="Gender (Male or Female)"
    )
    
    # Sleep-related metrics
    sleep_duration: float = Field(
        ...,
        ge=4.0,
        le=12.0,
        description="Sleep duration in hours (4-12)"
    )
    
    sleep_quality: int = Field(
        ...,
        ge=1,
        le=5,
        description="Sleep quality rating (1-5 scale)"
    )
    
    # Activity and lifestyle metrics
    physical_activity: int = Field(
        ...,
        ge=0,
        le=5,
        description="Physical activity level (0-5 scale)"
    )
    
    screen_time: float = Field(
        ...,
        ge=1.0,
        le=14.0,
        description="Daily screen time in hours (1-14)"
    )
    
    caffeine_intake: int = Field(
        ...,
        ge=0,
        le=8,
        description="Daily caffeine intake in cups (0-8)"
    )
    
    smoking_habit: SmokingHabitEnum = Field(
        ...,
        description="Smoking habit (Yes or No)"
    )
    
    # Work and travel metrics
    work_hours: float = Field(
        ...,
        ge=4.0,
        le=16.0,
        description="Daily work hours (4-16)"
    )
    
    travel_time: float = Field(
        ...,
        ge=0.0,
        le=4.0,
        description="Daily travel time in hours (0-4)"
    )
    
    # Social and wellness metrics
    social_interactions: int = Field(
        ...,
        ge=1,
        le=5,
        description="Social interactions level (1-5 scale)"
    )
    
    meditation_practice: MeditationPracticeEnum = Field(
        ...,
        description="Meditation practice (Yes or No)"
    )
    
    exercise_type: ExerciseTypeEnum = Field(
        ...,
        description="Primary exercise type"
    )
    
    @field_validator('sleep_duration')
    @classmethod
    def validate_sleep_duration(cls, v):
        """Custom validator for sleep duration with business logic."""
        if v < 4.0:
            raise ValueError('Sleep duration cannot be less than 4 hours')
        if v > 12.0:
            raise ValueError('Sleep duration cannot exceed 12 hours')
        return round(v, 1)  # Round to 1 decimal place
    
    @field_validator('work_hours')
    @classmethod
    def validate_work_hours(cls, v):
        """Custom validator for work hours with business logic."""
        if v < 4.0:
            raise ValueError('Work hours cannot be less than 4 hours')
        if v > 16.0:
            raise ValueError('Work hours cannot exceed 16 hours per day')
        return round(v, 1)  # Round to 1 decimal place
    
    @field_validator('screen_time')
    @classmethod
    def validate_screen_time(cls, v):
        """Custom validator for screen time with business logic."""
        if v < 1.0:
            raise ValueError('Screen time cannot be less than 1 hour')
        if v > 14.0:
            raise ValueError('Screen time cannot exceed 14 hours per day')
        return round(v, 1)  # Round to 1 decimal place
    
    @field_validator('travel_time')
    @classmethod
    def validate_travel_time(cls, v):
        """Custom validator for travel time with business logic."""
        if v < 0.0:
            raise ValueError('Travel time cannot be negative')
        if v > 4.0:
            raise ValueError('Travel time cannot exceed 4 hours per day')
        return round(v, 1)  # Round to 1 decimal place
    
    @model_validator(mode='after')
    def validate_lifestyle_consistency(self):
        """Cross-field validation for lifestyle consistency."""
        work_hours = self.work_hours
        sleep_duration = self.sleep_duration
        screen_time = self.screen_time
        travel_time = self.travel_time
        
        # Check if total time allocation is reasonable (allowing for overlap)
        total_structured_time = work_hours + sleep_duration + travel_time
        if total_structured_time > 24:
            raise ValueError(
                f'Total time allocation (work: {work_hours}h, sleep: {sleep_duration}h, '
                f'travel: {travel_time}h) exceeds 24 hours per day'
            )
        
        # Validate screen time vs work hours relationship
        if screen_time > work_hours + 6:  # Allow 6 hours personal screen time
            logger.warning(
                f'Screen time ({screen_time}h) significantly exceeds work hours ({work_hours}h)'
            )
        
        return self
    
    def to_model_format(self) -> Dict[str, Any]:
        """
        Convert the request data to the format expected by the ML model.
        
        This method transforms the Pydantic model to match the exact field names
        and format expected by the trained ML model.
        """
        return {
            'Age': self.age,
            'Gender': self.gender if isinstance(self.gender, str) else self.gender.value,
            'Sleep_Duration': self.sleep_duration,
            'Sleep_Quality': self.sleep_quality,
            'Physical_Activity': self.physical_activity,
            'Screen_Time': self.screen_time,
            'Caffeine_Intake': self.caffeine_intake,
            'Smoking_Habit': self.smoking_habit if isinstance(self.smoking_habit, str) else self.smoking_habit.value,
            'Work_Hours': self.work_hours,
            'Travel_Time': self.travel_time,
            'Social_Interactions': self.social_interactions,
            'Meditation_Practice': self.meditation_practice if isinstance(self.meditation_practice, str) else self.meditation_practice.value,
            'Exercise_Type': self.exercise_type if isinstance(self.exercise_type, str) else self.exercise_type.value
        }
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        validate_assignment = True
        extra = "forbid"  # Reject extra fields
        json_schema_extra = {
            "example": {
                "age": 30,
                "gender": "Male",
                "sleep_duration": 7.5,
                "sleep_quality": 4,
                "physical_activity": 3,
                "screen_time": 8.0,
                "caffeine_intake": 2,
                "smoking_habit": "No",
                "work_hours": 8.0,
                "travel_time": 1.0,
                "social_interactions": 3,
                "meditation_practice": "Yes",
                "exercise_type": "Cardio"
            }
        }


class WellnessTask(BaseModel):
    """Individual wellness task within a wellness plan."""
    
    id: str = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title")
    type: str = Field(..., description="Task type (article, tool, lifestyle)")
    link: str = Field(..., description="Link to task resource")
    reward: int = Field(..., ge=0, description="Reward points for completing task")


class WellnessPlan(BaseModel):
    """Wellness plan structure matching frontend interface."""
    
    title: str = Field(..., description="Wellness plan title")
    summary: str = Field(..., description="Plan summary description")
    tasks: List[WellnessTask] = Field(..., description="List of wellness tasks")


class StressPredictionResponse(BaseModel):
    """
    Response schema for stress prediction endpoint.
    
    This schema ensures the response format matches the existing frontend
    interface requirements, maintaining compatibility with existing components.
    
    Requirements: 4.1, 4.2
    """
    
    level: StressLevelEnum = Field(
        ...,
        description="Categorical stress level (Low, Medium, High)"
    )
    
    score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Numerical stress score (0-100)"
    )
    
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Prediction confidence score (0.0-1.0)"
    )
    
    insights: List[str] = Field(
        ...,
        description="List of insights based on input data and feature importance"
    )
    
    recommendations: List[str] = Field(
        ...,
        description="List of recommendations based on stress level"
    )
    
    wellness_plan: WellnessPlan = Field(
        ...,
        alias="wellnessPlan",
        description="Structured wellness plan compatible with frontend"
    )
    
    # Optional metadata fields
    model_name: Optional[str] = Field(
        None,
        description="Name of the ML model used for prediction"
    )
    
    model_score: Optional[float] = Field(
        None,
        description="Accuracy score of the ML model"
    )
    
    feature_importance: Optional[Dict[str, float]] = Field(
        None,
        description="Feature importance scores from the model"
    )
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        populate_by_name = True  # Allow both field name and alias
        json_schema_extra = {
            "example": {
                "level": "Medium",
                "score": 65,
                "confidence": 0.85,
                "insights": [
                    "Your sleep duration is below the recommended 7-9 hours",
                    "Long work hours may be a significant stress factor"
                ],
                "recommendations": [
                    "Focus on improving sleep quality and duration",
                    "Incorporate regular physical exercise into your routine",
                    "Practice stress-reduction techniques like deep breathing"
                ],
                "wellnessPlan": {
                    "title": "Personalized Stress Management Plan",
                    "summary": "A comprehensive plan to help reduce your stress levels",
                    "tasks": [
                        {
                            "id": "sleep-1",
                            "title": "Improve Sleep Hygiene",
                            "type": "lifestyle",
                            "link": "/wellness/sleep-hygiene",
                            "reward": 20
                        },
                        {
                            "id": "exercise-1",
                            "title": "Daily 30-minute Walk",
                            "type": "tool",
                            "link": "/tools/exercise-tracker",
                            "reward": 15
                        }
                    ]
                },
                "model_name": "RandomForestClassifier",
                "model_score": 0.92
            }
        }


class ValidationError(BaseModel):
    """Individual field validation error."""
    
    field: str = Field(..., description="Field name that failed validation")
    message: str = Field(..., description="Validation error message")
    value: Optional[Any] = Field(None, description="Invalid value that was provided")


class ErrorResponse(BaseModel):
    """
    Standardized error response schema.
    
    This schema provides consistent error formatting across all API endpoints,
    making it easier for the frontend to handle and display errors.
    
    Requirements: 1.3, 5.3
    """
    
    error: str = Field(..., description="Error type or category")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[Union[str, List[ValidationError]]] = Field(
        None,
        description="Additional error details or validation errors"
    )
    timestamp: Optional[str] = Field(None, description="Error timestamp")
    request_id: Optional[str] = Field(None, description="Request identifier for debugging")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "error": "ValidationError",
                "message": "Invalid input data provided",
                "details": [
                    {
                        "field": "age",
                        "message": "Age must be between 18 and 65",
                        "value": 17
                    }
                ],
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class HealthCheckResponse(BaseModel):
    """Health check response schema."""
    
    status: str = Field(..., description="Overall health status")
    timestamp: str = Field(..., description="Health check timestamp")
    uptime: Dict[str, Any] = Field(..., description="Service uptime information")
    service: Dict[str, Any] = Field(..., description="Service information")
    model: Dict[str, Any] = Field(..., description="ML model status")
    system: Dict[str, Any] = Field(..., description="System information")
    warnings: Optional[List[str]] = Field(None, description="Health warnings")