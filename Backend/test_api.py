#!/usr/bin/env python3
"""
Test the actual API endpoint
"""
import requests
import json

# Test data
test_data = {
    "age": 30,
    "gender": "Male",
    "sleep_duration": 7,
    "sleep_quality": 4,
    "physical_activity": 2,
    "screen_time": 4,
    "caffeine_intake": 1,
    "smoking_habit": "No",
    "work_hours": 8,
    "travel_time": 1,
    "social_interactions": 5,
    "meditation_practice": "Yes",
    "exercise_type": "Cardio"
}

print("Testing API endpoint...")
print(f"Sending data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(
        "http://localhost:8000/predict",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
except Exception as e:
    print(f"Error: {e}")