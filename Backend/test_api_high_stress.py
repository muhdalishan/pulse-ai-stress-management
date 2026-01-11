#!/usr/bin/env python3
"""
Test the API with high stress inputs
"""
import requests
import json

# Test data for high stress
test_data = {
    "age": 45,
    "gender": "Male",
    "sleep_duration": 4,  # Low sleep
    "sleep_quality": 2,   # Poor quality
    "physical_activity": 0, # No activity
    "screen_time": 12,    # High screen time
    "caffeine_intake": 6, # High caffeine
    "smoking_habit": "Yes", # Smoking
    "work_hours": 14,     # Long work hours
    "travel_time": 3,     # Long commute
    "social_interactions": 1, # Low social
    "meditation_practice": "No", # No meditation
    "exercise_type": "Walking"
}

print("Testing API endpoint with high stress inputs...")
print(f"Sending data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(
        "http://localhost:8000/predict",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    result = response.json()
    print(f"Level: {result['level']}")
    print(f"Score: {result['score']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Model: {result['model_name']}")
    
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50)

# Test data for medium stress
test_data_medium = {
    "age": 35,
    "gender": "Female",
    "sleep_duration": 6,
    "sleep_quality": 3,
    "physical_activity": 1,
    "screen_time": 6,
    "caffeine_intake": 3,
    "smoking_habit": "No",
    "work_hours": 9,
    "travel_time": 2,
    "social_interactions": 3,
    "meditation_practice": "No",
    "exercise_type": "Aerobics"
}

print("Testing API endpoint with medium stress inputs...")
print(f"Sending data: {json.dumps(test_data_medium, indent=2)}")

try:
    response = requests.post(
        "http://localhost:8000/predict",
        json=test_data_medium,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    result = response.json()
    print(f"Level: {result['level']}")
    print(f"Score: {result['score']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Model: {result['model_name']}")
    
except Exception as e:
    print(f"Error: {e}")