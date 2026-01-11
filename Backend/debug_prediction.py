#!/usr/bin/env python3
"""
Debug script to test model predictions directly
"""
import pickle
import numpy as np

# Load the model
print("Loading model...")
with open('models/pulse_ai_model_test.pkl', 'rb') as f:
    model_artifacts = pickle.load(f)

model = model_artifacts['model']
feature_names = model_artifacts['feature_names']

print(f"Model: {model_artifacts['model_name']}")
print(f"Features: {feature_names}")

# Create test input (similar to what frontend sends)
test_input = {
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

# Categorical mappings
categorical_mappings = {
    'Gender': {'Male': 0, 'Female': 1},
    'Smoking_Habit': {'No': 0, 'Yes': 1},
    'Meditation_Practice': {'No': 0, 'Yes': 1},
    'Exercise_Type': {
        'Cardio': 0, 'Yoga': 1, 'Strength Training': 2, 
        'Aerobics': 3, 'Walking': 4, 'Pilates': 5
    }
}

# Process input
processed_features = []
for feature in feature_names:
    value = test_input[feature]
    
    # Handle categorical features
    if feature in categorical_mappings:
        if value in categorical_mappings[feature]:
            processed_value = categorical_mappings[feature][value]
        else:
            print(f"ERROR: Invalid categorical value for {feature}: {value}")
            processed_value = 0
    else:
        processed_value = float(value)
    
    processed_features.append(processed_value)
    print(f"{feature}: {value} -> {processed_value}")

# Convert to numpy array
feature_array = np.array(processed_features).reshape(1, -1)
print(f"\nFeature array: {feature_array}")

# Make prediction
prediction = model.predict(feature_array)[0]
print(f"\nRaw prediction: {prediction}")
print(f"Prediction type: {type(prediction)}")

# Get probabilities if available
if hasattr(model, 'predict_proba'):
    probabilities = model.predict_proba(feature_array)[0]
    print(f"Probabilities: {probabilities}")
    print(f"Max probability: {np.max(probabilities)}")
    
    # Get class labels
    classes = model.classes_
    print(f"Classes: {classes}")
    
    for i, (cls, prob) in enumerate(zip(classes, probabilities)):
        print(f"  {cls}: {prob:.4f}")

print(f"\nFinal prediction: {prediction}")