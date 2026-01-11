#!/usr/bin/env python3
"""
Create a test model for development purposes.
"""
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd

# Load the dataset
print("Loading dataset...")
df = pd.read_csv('stress_detection_data.csv')

# Prepare features and target
feature_columns = [
    'Age', 'Gender', 'Sleep_Duration', 'Sleep_Quality', 
    'Physical_Activity', 'Screen_Time', 'Caffeine_Intake', 
    'Smoking_Habit', 'Work_Hours', 'Travel_Time', 
    'Social_Interactions', 'Meditation_Practice', 'Exercise_Type'
]

# Encode categorical variables
df_encoded = df.copy()
categorical_mappings = {
    'Gender': {'Male': 0, 'Female': 1},
    'Smoking_Habit': {'No': 0, 'Yes': 1},
    'Meditation_Practice': {'No': 0, 'Yes': 1},
    'Exercise_Type': {
        'Cardio': 0, 'Yoga': 1, 'Strength Training': 2, 
        'Aerobics': 3, 'Walking': 4, 'Pilates': 5
    }
}

for col, mapping in categorical_mappings.items():
    if col in df_encoded.columns:
        df_encoded[col] = df_encoded[col].map(mapping)

# Prepare features and target
X = df_encoded[feature_columns]
y = df_encoded['Stress_Level']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a simple model
print("Training model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Calculate accuracy
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.4f}")

# Create model artifacts
model_artifacts = {
    'model': model,
    'feature_names': feature_columns,
    'model_name': 'RandomForestClassifier',
    'model_score': accuracy,
    'categorical_mappings': categorical_mappings
}

# Save the model
print("Saving model...")
with open('pulse_ai_model_test.pkl', 'wb') as f:
    pickle.dump(model_artifacts, f)

print("Test model created successfully!")