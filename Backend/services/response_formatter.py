#!/usr/bin/env python3
"""
PULSE-AI Response Formatter - Response Formatting Logic

This module handles the formatting of ML model predictions into structured responses
that match the frontend interface requirements. It includes stress level categorization,
insights generation, recommendations, and wellness plan creation.

Features:
- Stress level categorization (Low/Medium/High)
- Insights generation based on feature importance and input data
- Personalized recommendations based on stress level and user profile
- Wellness plan creation compatible with frontend interface

Requirements covered: 4.2, 4.3, 4.4, 4.5
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from schemas import (
    StressPredictionResponse, 
    WellnessPlan, 
    WellnessTask, 
    StressLevelEnum
)

logger = logging.getLogger(__name__)


class ResponseFormatter:
    """
    Service class for formatting ML model predictions into structured responses.
    
    This class takes raw model predictions and user input data, then generates
    comprehensive responses including insights, recommendations, and wellness plans
    that are compatible with the existing frontend interface.
    
    Requirements: 4.2, 4.3, 4.4, 4.5
    """
    
    def __init__(self):
        """Initialize the ResponseFormatter."""
        self.wellness_task_templates = self._initialize_wellness_templates()
        self.recommendation_templates = self._initialize_recommendation_templates()
    
    def format_prediction_response(
        self,
        prediction_result: Dict[str, Any],
        input_data: Dict[str, Any]
    ) -> StressPredictionResponse:
        """
        Format a complete prediction response from model output and input data.
        
        Args:
            prediction_result: Raw output from the ML model service
            input_data: Original user input data
            
        Returns:
            StressPredictionResponse: Formatted response matching frontend interface
            
        Requirements: 4.2, 4.3, 4.4, 4.5
        """
        try:
            # Extract basic prediction data
            stress_level = self._categorize_stress_level(prediction_result.get('level', 'Medium'))
            numerical_score = self._calculate_numerical_score(stress_level, prediction_result)
            confidence = prediction_result.get('confidence', 0.8)
            
            # Generate enhanced insights
            insights = self._generate_enhanced_insights(
                input_data, 
                stress_level, 
                prediction_result.get('feature_importance', {})
            )
            
            # Generate personalized recommendations
            recommendations = self._generate_personalized_recommendations(
                stress_level, 
                input_data
            )
            
            # Create wellness plan
            wellness_plan = self._create_wellness_plan(
                stress_level, 
                input_data, 
                insights
            )
            
            # Create response object
            response = StressPredictionResponse(
                level=stress_level,
                score=numerical_score,
                confidence=confidence,
                insights=insights,
                recommendations=recommendations,
                wellness_plan=wellness_plan,
                model_name=prediction_result.get('model_name'),
                model_score=prediction_result.get('model_score'),
                feature_importance=prediction_result.get('feature_importance')
            )
            
            logger.info(f"Response formatted successfully for stress level: {stress_level}")
            return response
            
        except Exception as e:
            logger.error(f"Error formatting prediction response: {str(e)}")
            # Return fallback response
            return self._create_fallback_response()
    
    def _categorize_stress_level(self, raw_level: Any) -> StressLevelEnum:
        """
        Categorize stress level into standard enum values.
        
        Requirements: 4.2
        """
        try:
            if isinstance(raw_level, str):
                level_str = raw_level.strip().title()
                if level_str in ['Low', 'Medium', 'High']:
                    return StressLevelEnum(level_str)
            
            # Handle numerical predictions
            if isinstance(raw_level, (int, float)):
                if raw_level <= 0.33:
                    return StressLevelEnum.LOW
                elif raw_level <= 0.66:
                    return StressLevelEnum.MEDIUM
                else:
                    return StressLevelEnum.HIGH
            
            # Default fallback
            logger.warning(f"Unknown stress level format: {raw_level}, defaulting to Medium")
            return StressLevelEnum.MEDIUM
            
        except Exception as e:
            logger.error(f"Error categorizing stress level: {str(e)}")
            return StressLevelEnum.MEDIUM
    
    def _calculate_numerical_score(
        self, 
        stress_level: StressLevelEnum, 
        prediction_result: Dict[str, Any]
    ) -> int:
        """
        Calculate numerical stress score (0-100) based on stress level and confidence.
        
        Requirements: 4.2
        """
        try:
            # Base scores for each level
            base_scores = {
                StressLevelEnum.LOW: 25,
                StressLevelEnum.MEDIUM: 50,
                StressLevelEnum.HIGH: 75
            }
            
            base_score = base_scores.get(stress_level, 50)
            confidence = prediction_result.get('confidence', 0.8)
            
            # Adjust score based on confidence
            # Higher confidence can push scores toward extremes
            if stress_level == StressLevelEnum.LOW:
                adjusted_score = max(10, base_score - (1 - confidence) * 15)
            elif stress_level == StressLevelEnum.HIGH:
                adjusted_score = min(90, base_score + (1 - confidence) * 15)
            else:
                adjusted_score = base_score
            
            return int(round(adjusted_score))
            
        except Exception as e:
            logger.error(f"Error calculating numerical score: {str(e)}")
            return 50
    
    def _generate_enhanced_insights(
        self, 
        input_data: Dict[str, Any], 
        stress_level: StressLevelEnum,
        feature_importance: Dict[str, float]
    ) -> List[str]:
        """
        Generate enhanced insights based on input data and feature importance.
        
        Requirements: 4.3
        """
        insights = []
        
        try:
            # Feature importance insights
            if feature_importance:
                top_features = sorted(
                    feature_importance.items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:3]
                
                for feature_name, importance in top_features:
                    if importance > 0.1:  # Only include significant features
                        insight = self._generate_feature_insight(
                            feature_name, 
                            input_data.get(feature_name), 
                            importance
                        )
                        if insight:
                            insights.append(insight)
            
            # Lifestyle-based insights
            lifestyle_insights = self._generate_lifestyle_insights(input_data)
            insights.extend(lifestyle_insights)
            
            # Stress level specific insights
            level_insights = self._generate_level_specific_insights(stress_level, input_data)
            insights.extend(level_insights)
            
            # Ensure we have at least one insight
            if not insights:
                insights.append(f"Your current stress level is {stress_level.value.lower()}")
            
            # Limit to most relevant insights (max 5)
            return insights[:5]
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return [f"Your current stress level is {stress_level.value.lower()}"]
    
    def _generate_feature_insight(
        self, 
        feature_name: str, 
        feature_value: Any, 
        importance: float
    ) -> Optional[str]:
        """Generate insight for a specific feature based on its importance and value."""
        try:
            insight_templates = {
                'Sleep_Duration': {
                    'low': "Your sleep duration appears to be a key factor affecting your stress levels",
                    'high': "Your adequate sleep duration is helping maintain lower stress levels"
                },
                'Work_Hours': {
                    'low': "Your work hours are a significant factor in your stress assessment",
                    'high': "Long work hours appear to be a major contributor to your stress levels"
                },
                'Physical_Activity': {
                    'low': "Your physical activity level is significantly impacting your stress levels",
                    'high': "Your active lifestyle is positively influencing your stress management"
                },
                'Screen_Time': {
                    'low': "Screen time usage appears to be affecting your stress levels",
                    'high': "High screen time may be contributing to your elevated stress levels"
                },
                'Sleep_Quality': {
                    'low': "Sleep quality is a key factor in your stress level assessment",
                    'high': "Good sleep quality is helping you manage stress effectively"
                }
            }
            
            if feature_name in insight_templates:
                templates = insight_templates[feature_name]
                
                # Determine if value is high or low based on feature type
                if feature_name in ['Sleep_Duration', 'Physical_Activity', 'Sleep_Quality']:
                    # Higher is generally better
                    if isinstance(feature_value, (int, float)):
                        template_key = 'high' if feature_value >= 3 else 'low'
                    else:
                        template_key = 'low'
                else:
                    # Lower is generally better (work hours, screen time)
                    if isinstance(feature_value, (int, float)):
                        template_key = 'high' if feature_value >= 8 else 'low'
                    else:
                        template_key = 'low'
                
                return templates.get(template_key)
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating feature insight: {str(e)}")
            return None
    
    def _generate_lifestyle_insights(self, input_data: Dict[str, Any]) -> List[str]:
        """Generate insights based on lifestyle patterns."""
        insights = []
        
        try:
            # Sleep insights
            sleep_duration = input_data.get('Sleep_Duration', 0)
            if sleep_duration < 6:
                insights.append("Your sleep duration is below the recommended 7-9 hours")
            elif sleep_duration > 9:
                insights.append("You're getting plenty of sleep, which supports stress management")
            
            # Work-life balance insights
            work_hours = input_data.get('Work_Hours', 0)
            travel_time = input_data.get('Travel_Time', 0)
            total_work_time = work_hours + travel_time
            
            if total_work_time > 10:
                insights.append("Your total work and commute time may be impacting your stress levels")
            
            # Physical activity insights
            physical_activity = input_data.get('Physical_Activity', 0)
            exercise_type = input_data.get('Exercise_Type', '')
            
            if physical_activity < 2:
                insights.append("Increasing physical activity could help reduce stress")
            elif physical_activity >= 4:
                insights.append(f"Your regular {exercise_type.lower()} routine is excellent for stress management")
            
            # Screen time insights
            screen_time = input_data.get('Screen_Time', 0)
            if screen_time > 10:
                insights.append("High screen time may be contributing to your stress levels")
            
            # Wellness practices insights
            meditation = input_data.get('Meditation_Practice', 'No')
            if meditation == 'Yes':
                insights.append("Your meditation practice is a valuable tool for stress management")
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating lifestyle insights: {str(e)}")
            return []
    
    def _generate_level_specific_insights(
        self, 
        stress_level: StressLevelEnum, 
        input_data: Dict[str, Any]
    ) -> List[str]:
        """Generate insights specific to the stress level."""
        insights = []
        
        try:
            if stress_level == StressLevelEnum.LOW:
                insights.append("You're managing stress well - keep up the good work!")
                
            elif stress_level == StressLevelEnum.MEDIUM:
                insights.append("There's room for improvement in your stress management")
                
            elif stress_level == StressLevelEnum.HIGH:
                insights.append("Your stress levels indicate a need for immediate attention")
                
                # Add specific high-stress insights
                caffeine = input_data.get('Caffeine_Intake', 0)
                if caffeine > 3:
                    insights.append("High caffeine intake may be exacerbating your stress")
                
                social_interactions = input_data.get('Social_Interactions', 0)
                if social_interactions < 2:
                    insights.append("Limited social interactions may be affecting your stress levels")
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating level-specific insights: {str(e)}")
            return []
    
    def _generate_personalized_recommendations(
        self, 
        stress_level: StressLevelEnum, 
        input_data: Dict[str, Any]
    ) -> List[str]:
        """
        Generate personalized recommendations based on stress level and user profile.
        
        Requirements: 4.4
        """
        try:
            recommendations = []
            
            # Base recommendations by stress level
            base_recommendations = self.recommendation_templates.get(stress_level, [])
            recommendations.extend(base_recommendations)
            
            # Personalized recommendations based on input data
            personal_recommendations = self._generate_personal_recommendations(input_data)
            recommendations.extend(personal_recommendations)
            
            # Remove duplicates while preserving order
            seen = set()
            unique_recommendations = []
            for rec in recommendations:
                if rec not in seen:
                    seen.add(rec)
                    unique_recommendations.append(rec)
            
            return unique_recommendations[:6]  # Limit to 6 recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return ["Focus on maintaining a balanced lifestyle"]
    
    def _generate_personal_recommendations(self, input_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on specific user data patterns."""
        recommendations = []
        
        try:
            # Sleep-based recommendations
            sleep_duration = input_data.get('Sleep_Duration', 0)
            sleep_quality = input_data.get('Sleep_Quality', 0)
            
            if sleep_duration < 7:
                recommendations.append("Aim for 7-9 hours of sleep per night")
            if sleep_quality < 3:
                recommendations.append("Focus on improving sleep quality through better sleep hygiene")
            
            # Exercise recommendations
            physical_activity = input_data.get('Physical_Activity', 0)
            exercise_type = input_data.get('Exercise_Type', '')
            
            if physical_activity < 2:
                recommendations.append("Start with 30 minutes of daily physical activity")
            elif exercise_type in ['Walking', 'Yoga']:
                recommendations.append("Consider adding more vigorous exercise to your routine")
            
            # Work-life balance recommendations
            work_hours = input_data.get('Work_Hours', 0)
            if work_hours > 10:
                recommendations.append("Try to establish better work-life boundaries")
            
            # Screen time recommendations
            screen_time = input_data.get('Screen_Time', 0)
            if screen_time > 8:
                recommendations.append("Consider reducing screen time, especially before bed")
            
            # Wellness practice recommendations
            meditation = input_data.get('Meditation_Practice', 'No')
            if meditation == 'No':
                recommendations.append("Try incorporating 10 minutes of daily meditation or mindfulness")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating personal recommendations: {str(e)}")
            return []
    
    def _create_wellness_plan(
        self, 
        stress_level: StressLevelEnum, 
        input_data: Dict[str, Any],
        insights: List[str]
    ) -> WellnessPlan:
        """
        Create a structured wellness plan compatible with frontend interface.
        
        Requirements: 4.5
        """
        try:
            # Generate plan title and summary
            plan_title = self._generate_plan_title(stress_level)
            plan_summary = self._generate_plan_summary(stress_level, input_data)
            
            # Generate wellness tasks
            tasks = self._generate_wellness_tasks(stress_level, input_data)
            
            return WellnessPlan(
                title=plan_title,
                summary=plan_summary,
                tasks=tasks
            )
            
        except Exception as e:
            logger.error(f"Error creating wellness plan: {str(e)}")
            return self._create_fallback_wellness_plan()
    
    def _generate_plan_title(self, stress_level: StressLevelEnum) -> str:
        """Generate appropriate wellness plan title."""
        titles = {
            StressLevelEnum.LOW: "Stress Maintenance Plan",
            StressLevelEnum.MEDIUM: "Stress Reduction Plan",
            StressLevelEnum.HIGH: "Intensive Stress Management Plan"
        }
        return titles.get(stress_level, "Personalized Wellness Plan")
    
    def _generate_plan_summary(
        self, 
        stress_level: StressLevelEnum, 
        input_data: Dict[str, Any]
    ) -> str:
        """Generate wellness plan summary."""
        summaries = {
            StressLevelEnum.LOW: "A maintenance plan to help you continue managing stress effectively",
            StressLevelEnum.MEDIUM: "A focused plan to help reduce your stress levels through targeted interventions",
            StressLevelEnum.HIGH: "An intensive plan designed to significantly reduce your stress levels"
        }
        
        base_summary = summaries.get(stress_level, "A personalized plan to help manage your stress")
        
        # Add personalization based on key factors
        sleep_duration = input_data.get('Sleep_Duration', 0)
        physical_activity = input_data.get('Physical_Activity', 0)
        
        if sleep_duration < 6:
            base_summary += " with a focus on improving sleep quality"
        elif physical_activity < 2:
            base_summary += " emphasizing increased physical activity"
        
        return base_summary
    
    def _generate_wellness_tasks(
        self, 
        stress_level: StressLevelEnum, 
        input_data: Dict[str, Any]
    ) -> List[WellnessTask]:
        """Generate appropriate wellness tasks based on stress level and user data."""
        tasks = []
        
        try:
            # Get base tasks for stress level
            base_tasks = self.wellness_task_templates.get(stress_level, [])
            
            # Add personalized tasks based on input data
            personal_tasks = self._generate_personal_tasks(input_data)
            
            # Combine and prioritize tasks
            all_tasks = base_tasks + personal_tasks
            
            # Convert to WellnessTask objects and limit to 4-6 tasks
            for i, task_data in enumerate(all_tasks[:6]):
                task = WellnessTask(
                    id=f"task-{i+1}-{uuid.uuid4().hex[:8]}",
                    title=task_data['title'],
                    type=task_data['type'],
                    link=task_data['link'],
                    reward=task_data['reward']
                )
                tasks.append(task)
            
            return tasks
            
        except Exception as e:
            logger.error(f"Error generating wellness tasks: {str(e)}")
            return self._get_fallback_tasks()
    
    def _generate_personal_tasks(self, input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized tasks based on user input data."""
        tasks = []
        
        try:
            # Sleep-related tasks
            sleep_duration = input_data.get('Sleep_Duration', 0)
            if sleep_duration < 7:
                tasks.append({
                    'title': 'Establish Better Sleep Schedule',
                    'type': 'lifestyle',
                    'link': '/wellness/sleep-schedule',
                    'reward': 25
                })
            
            # Exercise tasks
            physical_activity = input_data.get('Physical_Activity', 0)
            if physical_activity < 2:
                tasks.append({
                    'title': 'Start Daily Walking Routine',
                    'type': 'tool',
                    'link': '/tools/walking-tracker',
                    'reward': 20
                })
            
            # Meditation tasks
            meditation = input_data.get('Meditation_Practice', 'No')
            if meditation == 'No':
                tasks.append({
                    'title': 'Begin Mindfulness Practice',
                    'type': 'tool',
                    'link': '/tools/meditation-guide',
                    'reward': 15
                })
            
            # Screen time tasks
            screen_time = input_data.get('Screen_Time', 0)
            if screen_time > 8:
                tasks.append({
                    'title': 'Digital Detox Challenge',
                    'type': 'lifestyle',
                    'link': '/wellness/digital-detox',
                    'reward': 30
                })
            
            return tasks
            
        except Exception as e:
            logger.error(f"Error generating personal tasks: {str(e)}")
            return []
    
    def _initialize_wellness_templates(self) -> Dict[StressLevelEnum, List[Dict[str, Any]]]:
        """Initialize wellness task templates for each stress level."""
        return {
            StressLevelEnum.LOW: [
                {
                    'title': 'Maintain Current Healthy Habits',
                    'type': 'lifestyle',
                    'link': '/wellness/habit-maintenance',
                    'reward': 10
                },
                {
                    'title': 'Weekly Stress Check-in',
                    'type': 'tool',
                    'link': '/tools/stress-tracker',
                    'reward': 15
                }
            ],
            StressLevelEnum.MEDIUM: [
                {
                    'title': 'Deep Breathing Exercises',
                    'type': 'tool',
                    'link': '/tools/breathing-exercises',
                    'reward': 20
                },
                {
                    'title': 'Improve Sleep Hygiene',
                    'type': 'article',
                    'link': '/articles/sleep-hygiene',
                    'reward': 25
                },
                {
                    'title': 'Regular Exercise Routine',
                    'type': 'lifestyle',
                    'link': '/wellness/exercise-plan',
                    'reward': 30
                }
            ],
            StressLevelEnum.HIGH: [
                {
                    'title': 'Immediate Stress Relief Techniques',
                    'type': 'tool',
                    'link': '/tools/emergency-calm',
                    'reward': 35
                },
                {
                    'title': 'Professional Support Resources',
                    'type': 'article',
                    'link': '/articles/professional-help',
                    'reward': 40
                },
                {
                    'title': 'Comprehensive Lifestyle Changes',
                    'type': 'lifestyle',
                    'link': '/wellness/lifestyle-overhaul',
                    'reward': 45
                },
                {
                    'title': 'Daily Meditation Practice',
                    'type': 'tool',
                    'link': '/tools/meditation-program',
                    'reward': 30
                }
            ]
        }
    
    def _initialize_recommendation_templates(self) -> Dict[StressLevelEnum, List[str]]:
        """Initialize recommendation templates for each stress level."""
        return {
            StressLevelEnum.LOW: [
                "Maintain your current healthy lifestyle habits",
                "Continue regular physical activity and good sleep schedule",
                "Keep practicing stress-prevention techniques"
            ],
            StressLevelEnum.MEDIUM: [
                "Focus on improving sleep quality and duration",
                "Incorporate regular physical exercise into your routine",
                "Practice stress-reduction techniques like deep breathing",
                "Consider time management strategies to reduce daily pressure"
            ],
            StressLevelEnum.HIGH: [
                "Prioritize getting adequate sleep (7-9 hours per night)",
                "Engage in regular physical activity to reduce stress hormones",
                "Practice meditation or mindfulness exercises daily",
                "Consider speaking with a healthcare professional",
                "Implement immediate stress-relief techniques",
                "Review and adjust your daily schedule to reduce pressure"
            ]
        }
    
    def _get_fallback_tasks(self) -> List[WellnessTask]:
        """Get fallback wellness tasks in case of errors."""
        return [
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
                reward=15
            )
        ]
    
    def _create_fallback_wellness_plan(self) -> WellnessPlan:
        """Create a fallback wellness plan in case of errors."""
        return WellnessPlan(
            title="Basic Wellness Plan",
            summary="A simple plan to help manage stress",
            tasks=self._get_fallback_tasks()
        )
    
    def _create_fallback_response(self) -> StressPredictionResponse:
        """Create a fallback response in case of formatting errors."""
        return StressPredictionResponse(
            level=StressLevelEnum.MEDIUM,
            score=50,
            confidence=0.5,
            insights=["Unable to analyze data at this time"],
            recommendations=["Please try again later"],
            wellness_plan=self._create_fallback_wellness_plan()
        )


# Global formatter instance
response_formatter = ResponseFormatter()


def format_prediction_response(
    prediction_result: Dict[str, Any],
    input_data: Dict[str, Any]
) -> StressPredictionResponse:
    """
    Convenience function to format prediction responses.
    
    Args:
        prediction_result: Raw output from the ML model service
        input_data: Original user input data
        
    Returns:
        StressPredictionResponse: Formatted response
    """
    return response_formatter.format_prediction_response(prediction_result, input_data)