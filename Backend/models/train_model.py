#!/usr/bin/env python3
"""
PULSE-AI ML System - Complete Training Pipeline

This script integrates all preprocessing and training components to create
a complete machine learning pipeline for stress level prediction.

The pipeline includes:
1. Data loading and preprocessing using DataProcessor
2. Model training using ModelTrainer (Naive Bayes, KNN, MLPClassifier)
3. Model evaluation and selection
4. Model serialization with all preprocessing components

Requirements covered: 1.1, 1.2, 1.4, 1.5, 1.6
"""

import os
import sys
import argparse
from pathlib import Path

# Add src directory to Python path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from data_processor import DataProcessor
from model_trainer import ModelTrainer


def main(dataset_path: str = "stress_detection_data.csv", output_path: str = "pulse_ai_model.pkl"):
    """
    Complete training pipeline that integrates DataProcessor and ModelTrainer.
    
    Args:
        dataset_path (str): Path to the training dataset CSV file
        output_path (str): Path where to save the trained model artifacts
    """
    print("=" * 60)
    print("PULSE-AI ML System - Training Pipeline")
    print("=" * 60)
    
    try:
        # Step 1: Initialize components
        print("\n1. Initializing components...")
        data_processor = DataProcessor()
        model_trainer = ModelTrainer(random_state=42)
        print("✓ DataProcessor and ModelTrainer initialized")
        
        # Step 2: Load and preprocess training data
        print(f"\n2. Loading and preprocessing data from {dataset_path}...")
        if not os.path.exists(dataset_path):
            print(f"❌ Dataset file not found: {dataset_path}")
            print("Please ensure the dataset file exists or provide the correct path.")
            return False
        
        # Complete preprocessing pipeline (includes feature scaling)
        X, y = data_processor.preprocess_training_data(dataset_path)
        print(f"✓ Data preprocessing completed")
        print(f"  - Features shape: {X.shape}")
        print(f"  - Target shape: {y.shape}")
        print(f"  - Feature names: {data_processor.feature_names}")
        
        # Step 3: Train multiple models
        print(f"\n3. Training multiple ML models...")
        model_scores = model_trainer.train_models(X, y, test_size=0.2)
        print("✓ Model training completed")
        
        # Display all model scores
        print("\nModel Performance Summary:")
        print("-" * 40)
        for model_name, score in model_scores.items():
            print(f"  {model_name:<15}: {score:.4f}")
        
        # Step 4: Select best model
        print(f"\n4. Selecting best performing model...")
        best_name, best_model, best_score = model_trainer.select_best_model()
        print(f"✓ Best model selected: {best_name} (accuracy: {best_score:.4f})")
        
        # Step 5: Save model artifacts
        print(f"\n5. Saving model artifacts to {output_path}...")
        model_trainer.save_model_artifacts(data_processor, output_path)
        print(f"✓ Model artifacts saved successfully")
        
        # Step 6: Verify saved model
        print(f"\n6. Verifying saved model...")
        try:
            loaded_artifacts = model_trainer.load_model_artifacts(output_path)
            print("✓ Model verification successful")
            print(f"  - Saved model: {loaded_artifacts['model_name']}")
            print(f"  - Model score: {loaded_artifacts['model_score']:.4f}")
            print(f"  - Feature count: {len(loaded_artifacts['feature_names'])}")
        except Exception as e:
            print(f"❌ Model verification failed: {str(e)}")
            return False
        
        print("\n" + "=" * 60)
        print("🎉 TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Best model: {best_name}")
        print(f"Accuracy: {best_score:.4f}")
        print(f"Model saved to: {output_path}")
        print(f"Ready for deployment in web application!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Training pipeline failed: {str(e)}")
        print("\nPlease check the error message above and ensure:")
        print("1. Dataset file exists and is properly formatted")
        print("2. All required columns are present in the dataset")
        print("3. Dataset contains valid data types")
        return False


def create_sample_dataset():
    """
    Create a sample dataset for testing if no dataset is provided.
    This is useful for development and testing purposes.
    """
    import pandas as pd
    import numpy as np
    
    print("Creating sample dataset for testing...")
    
    # Set random seed for reproducible sample data
    np.random.seed(42)
    
    # Generate sample data
    n_samples = 1000
    
    # Define categorical options
    genders = ['Male', 'Female']
    occupations = ['Student', 'Engineer', 'Teacher', 'Doctor', 'Artist', 'Manager']
    conditions = ['Anxiety', 'Depression', 'Bipolar', 'None', 'PTSD']
    severities = ['Low', 'Medium', 'High']
    
    # Generate sample data
    data = {
        'User_ID': range(1, n_samples + 1),  # Will be dropped
        'Age': np.random.randint(18, 65, n_samples),
        'Gender': np.random.choice(genders, n_samples),
        'Occupation': np.random.choice(occupations, n_samples),
        'Sleep_Hours': np.random.uniform(4, 12, n_samples).round(1),
        'Work_Hours': np.random.uniform(4, 16, n_samples).round(1),
        'Physical_Activity_Hours': np.random.uniform(0, 4, n_samples).round(1),
        'Mental_Health_Condition': np.random.choice(conditions, n_samples),
        'Severity': np.random.choice(severities, n_samples),
        'Country': np.random.choice(['USA', 'UK', 'Canada'], n_samples),  # Will be dropped
        'Consultation_History': np.random.choice(['Yes', 'No'], n_samples),  # Will be dropped
        'Stress_Level': np.random.randint(1, 11, n_samples)  # Target variable
    }
    
    # Create DataFrame and save
    df = pd.DataFrame(data)
    df.to_csv('sample_dataset.csv', index=False)
    print(f"✓ Sample dataset created: sample_dataset.csv ({n_samples} samples)")
    return 'sample_dataset.csv'


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PULSE-AI ML System Training Pipeline")
    parser.add_argument(
        "--dataset", 
        type=str, 
        default="stress_detection_data.csv",
        help="Path to the training dataset CSV file (default: stress_detection_data.csv)"
    )
    parser.add_argument(
        "--output", 
        type=str, 
        default="pulse_ai_model.pkl",
        help="Path where to save the trained model (default: pulse_ai_model.pkl)"
    )
    parser.add_argument(
        "--create-sample", 
        action="store_true",
        help="Create a sample dataset for testing"
    )
    
    args = parser.parse_args()
    
    # Create sample dataset if requested
    if args.create_sample:
        dataset_path = create_sample_dataset()
    else:
        dataset_path = args.dataset
    
    # Run the training pipeline
    success = main(dataset_path, args.output)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)