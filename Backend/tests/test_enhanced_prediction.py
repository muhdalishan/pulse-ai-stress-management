#!/usr/bin/env python3
"""Test enhanced prediction functionality"""

from model_service import initialize_model_service, get_model_service
import logging

# Configure logging to see output
logging.basicConfig(level=logging.INFO)

print("Testing Enhanced ModelService prediction...")

# Initialize model service with test model
if initialize_model_service("pulse_ai_model_test.pkl"):
    print("✓ Model service initialized successfully")
    
    model_service = get_model_service()
    
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
    
    print(f"Testing prediction with sample data...")
    result = model_service.predict(sample_data)
    if result:
        print(f"✓ Enhanced prediction successful:")
        print(f"  - Stress Level: {result['level']}")
        print(f"  - Score: {result['score']}")
        print(f"  - Confidence: {result['confidence']:.3f}")
        print(f"  - Insights: {result['insights']}")
        print(f"  - Recommendations: {result['recommendations']}")
        if result.get('feature_importance'):
            print(f"  - Feature Importance Available: Yes")
            top_features = sorted(result['feature_importance'].items(), key=lambda x: x[1], reverse=True)[:3]
            print(f"  - Top 3 Important Features: {top_features}")
        else:
            print(f"  - Feature Importance Available: No")
    else:
        print("❌ Enhanced prediction failed")
    
    # Test input validation
    print("\nTesting input validation...")
    invalid_data = {
        'Age': 100,  # Invalid age
        'Gender': 'Male',
        'Sleep_Duration': 15,  # Invalid sleep duration
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
    
    result = model_service.predict(invalid_data)
    if result is None:
        print("✓ Input validation correctly rejected invalid data")
    else:
        print("❌ Input validation failed to reject invalid data")
        
else:
    print("❌ Model service initialization failed")