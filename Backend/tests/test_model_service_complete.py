#!/usr/bin/env python3
"""
Complete Model Service Test Suite
Tests all model service functionality for the checkpoint task.
"""

import logging
import sys
import os
from model_service import ModelService, initialize_model_service, get_model_service

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ModelServiceTester:
    def __init__(self):
        self.model_service = None
        
    def test_model_initialization(self) -> bool:
        """Test model service initialization."""
        try:
            logger.info("Testing model service initialization...")
            
            # Try with test model first
            if os.path.exists("pulse_ai_model_test.pkl"):
                success = initialize_model_service("pulse_ai_model_test.pkl")
                if success:
                    self.model_service = get_model_service()
                    logger.info("✓ Model service initialized with test model")
                    return True
            
            # Try with production model
            if os.path.exists("pulse_ai_model.pkl"):
                success = initialize_model_service("pulse_ai_model.pkl")
                if success:
                    self.model_service = get_model_service()
                    logger.info("✓ Model service initialized with production model")
                    return True
            
            logger.error("❌ No valid model files found")
            return False
            
        except Exception as e:
            logger.error(f"❌ Model initialization error: {e}")
            return False
    
    def test_model_info(self) -> bool:
        """Test getting model information."""
        try:
            logger.info("Testing model info retrieval...")
            
            if not self.model_service:
                logger.error("❌ Model service not initialized")
                return False
            
            info = self.model_service.get_model_info()
            
            required_fields = ['loaded', 'model_name', 'model_score', 'feature_count']
            missing_fields = [field for field in required_fields if field not in info]
            
            if missing_fields:
                logger.error(f"❌ Model info missing fields: {missing_fields}")
                return False
            
            if not info['loaded']:
                logger.error("❌ Model not loaded according to info")
                return False
            
            logger.info(f"✓ Model info retrieved - Name: {info['model_name']}, Score: {info['model_score']:.4f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Model info error: {e}")
            return False
    
    def test_valid_prediction(self) -> bool:
        """Test prediction with valid data."""
        try:
            logger.info("Testing valid prediction...")
            
            if not self.model_service:
                logger.error("❌ Model service not initialized")
                return False
            
            # Valid test data
            test_data = {
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
            
            result = self.model_service.predict(test_data)
            
            if not result:
                logger.error("❌ Prediction returned None")
                return False
            
            required_fields = ['level', 'score', 'confidence', 'insights', 'recommendations']
            missing_fields = [field for field in required_fields if field not in result]
            
            if missing_fields:
                logger.error(f"❌ Prediction result missing fields: {missing_fields}")
                return False
            
            # Validate field types and ranges
            if result['level'] not in ['Low', 'Medium', 'High']:
                logger.error(f"❌ Invalid stress level: {result['level']}")
                return False
            
            if not (0 <= result['score'] <= 100):
                logger.error(f"❌ Invalid score range: {result['score']}")
                return False
            
            if not (0.0 <= result['confidence'] <= 1.0):
                logger.error(f"❌ Invalid confidence range: {result['confidence']}")
                return False
            
            logger.info(f"✓ Valid prediction - Level: {result['level']}, Score: {result['score']}, Confidence: {result['confidence']:.3f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Valid prediction error: {e}")
            return False
    
    def test_invalid_prediction(self) -> bool:
        """Test prediction with invalid data."""
        try:
            logger.info("Testing invalid prediction handling...")
            
            if not self.model_service:
                logger.error("❌ Model service not initialized")
                return False
            
            # Test with missing fields
            invalid_data = {
                'Age': 30,
                'Gender': 'Male',
                # Missing required fields
            }
            
            result = self.model_service.predict(invalid_data)
            
            if result is not None:
                logger.error("❌ Invalid data should return None")
                return False
            
            logger.info("✓ Invalid data correctly rejected")
            return True
            
        except Exception as e:
            logger.error(f"❌ Invalid prediction test error: {e}")
            return False
    
    def test_edge_cases(self) -> bool:
        """Test edge cases and boundary values."""
        try:
            logger.info("Testing edge cases...")
            
            if not self.model_service:
                logger.error("❌ Model service not initialized")
                return False
            
            # Test with boundary values
            edge_data = {
                'Age': 18,  # Minimum age
                'Gender': 'Female',
                'Sleep_Duration': 4.0,  # Minimum sleep
                'Sleep_Quality': 1,  # Minimum quality
                'Physical_Activity': 0,  # Minimum activity
                'Screen_Time': 1.0,  # Minimum screen time
                'Caffeine_Intake': 0,  # Minimum caffeine
                'Smoking_Habit': 'Yes',
                'Work_Hours': 4.0,  # Minimum work hours
                'Travel_Time': 0.0,  # Minimum travel
                'Social_Interactions': 1,  # Minimum social
                'Meditation_Practice': 'No',
                'Exercise_Type': 'Walking'
            }
            
            result = self.model_service.predict(edge_data)
            
            if not result:
                logger.error("❌ Edge case prediction failed")
                return False
            
            logger.info(f"✓ Edge case handled - Level: {result['level']}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Edge case test error: {e}")
            return False
    
    def test_preprocessing(self) -> bool:
        """Test data preprocessing functionality."""
        try:
            logger.info("Testing data preprocessing...")
            
            if not self.model_service:
                logger.error("❌ Model service not initialized")
                return False
            
            test_data = {
                'Age': 30,
                'Gender': 'Male',
                'Sleep_Duration': 7.5,
                'Sleep_Quality': 4,
                'Physical_Activity': 3,
                'Screen_Time': 8.0,
                'Caffeine_Intake': 2,
                'Smoking_Habit': 'No',
                'Work_Hours': 8.0,
                'Travel_Time': 1.0,
                'Social_Interactions': 3,
                'Meditation_Practice': 'Yes',
                'Exercise_Type': 'Cardio'
            }
            
            processed = self.model_service.preprocess_input(test_data)
            
            if processed is None:
                logger.error("❌ Preprocessing returned None")
                return False
            
            if processed.shape != (1, len(self.model_service.expected_features)):
                logger.error(f"❌ Wrong preprocessing shape: {processed.shape}")
                return False
            
            logger.info(f"✓ Preprocessing successful - Shape: {processed.shape}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Preprocessing test error: {e}")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all model service tests."""
        logger.info("=" * 50)
        logger.info("MODEL SERVICE CHECKPOINT TESTS")
        logger.info("=" * 50)
        
        tests = [
            ("Model Initialization", self.test_model_initialization),
            ("Model Info", self.test_model_info),
            ("Valid Prediction", self.test_valid_prediction),
            ("Invalid Prediction", self.test_invalid_prediction),
            ("Edge Cases", self.test_edge_cases),
            ("Data Preprocessing", self.test_preprocessing),
        ]
        
        results = []
        for test_name, test_func in tests:
            logger.info(f"\n--- {test_name} ---")
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                logger.error(f"❌ {test_name} failed with exception: {e}")
                results.append((test_name, False))
        
        # Summary
        logger.info("\n" + "=" * 50)
        logger.info("TEST RESULTS SUMMARY")
        logger.info("=" * 50)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results:
            status = "✓ PASS" if result else "❌ FAIL"
            logger.info(f"{test_name}: {status}")
            if result:
                passed += 1
        
        logger.info(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 ALL MODEL SERVICE TESTS PASSED!")
            return True
        else:
            logger.error(f"❌ {total - passed} tests failed")
            return False


def main():
    """Main test execution."""
    tester = ModelServiceTester()
    
    try:
        success = tester.run_all_tests()
        return success
        
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
        return False
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)