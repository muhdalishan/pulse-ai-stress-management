#!/usr/bin/env python3
"""
Test the ModelService functionality.
"""
import logging
from model_service import initialize_model_service, get_model_service

# Configure logging for testing
logging.basicConfig(level=logging.INFO)

print("Testing ModelService...")

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
    
    result = model_service.predict(sample_data)
    if result:
        print(f"+ Sample prediction: {result}")
    else:
        print("- Sample prediction failed")
else:
    print("- Model service initialization failed")