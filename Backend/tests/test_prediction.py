#!/usr/bin/env python3
"""Test prediction functionality"""

from model_service import initialize_model_service, get_model_service
import logging

# Configure logging to see output
logging.basicConfig(level=logging.INFO)

print("Testing ModelService prediction...")

# Initialize model service with test model
if initialize_model_service("pulse_ai_model_test.pkl"):
    print("+ Model service initialized successfully")
    
    model_service = get_model_service()
    
    # Get model info
    info = model_service.get_model_info()
    print(f"+ Model info: {info}")
    
    # Test prediction with sample data
    sample_data = {
        'Age': 30,
        'Gender': 'Male',
        'Sleep_Duration': 7,
        'Sleep_Quality': 4,
        'Physical_Activity': 2,
        'Screen_Time': 4,
        'Caffeine_Intake': 1,
        'Smoking_Habit': 'No',
        'Work_Hours': 8,
        'Travel_Time': 1,
        'Social_Interactions': 5,
        'Meditation_Practice': 'Yes',
        'Exercise_Type': 'Cardio'
    }
    
    print(f"Testing prediction with sample data: {sample_data}")
    result = model_service.predict(sample_data)
    if result:
        print(f"+ Sample prediction successful:")
        print(f"  - Stress Level: {result['level']}")
        print(f"  - Score: {result['score']}")
        print(f"  - Confidence: {result['confidence']:.3f}")
        print(f"  - Insights: {result['insights']}")
        print(f"  - Recommendations: {result['recommendations']}")
    else:
        print("- Sample prediction failed")
else:
    print("- Model service initialization failed")