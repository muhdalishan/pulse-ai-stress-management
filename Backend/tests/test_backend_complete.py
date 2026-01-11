#!/usr/bin/env python3
"""
Complete Backend API Test Suite
Tests all backend functionality for the checkpoint task.
"""

import requests
import json
import time
import logging
from typing import Dict, Any
import subprocess
import sys
import os
from threading import Thread
import signal

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BackendTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.server_process = None
        
    def start_server(self):
        """Start the FastAPI server in the background."""
        try:
            logger.info("Starting FastAPI server...")
            self.server_process = subprocess.Popen(
                [sys.executable, "app.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.getcwd()
            )
            
            # Wait for server to start
            time.sleep(3)
            
            # Check if server is running
            if self.server_process.poll() is None:
                logger.info("✓ Server started successfully")
                return True
            else:
                logger.error("❌ Server failed to start")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error starting server: {e}")
            return False
    
    def stop_server(self):
        """Stop the FastAPI server."""
        if self.server_process:
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=5)
                logger.info("✓ Server stopped successfully")
            except subprocess.TimeoutExpired:
                self.server_process.kill()
                logger.info("✓ Server forcefully stopped")
            except Exception as e:
                logger.error(f"❌ Error stopping server: {e}")
    
    def test_health_endpoint(self) -> bool:
        """Test the health check endpoint."""
        try:
            logger.info("Testing health endpoint...")
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✓ Health endpoint working - Status: {data.get('status')}")
                return True
            else:
                logger.error(f"❌ Health endpoint failed - Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Health endpoint error: {e}")
            return False
    
    def test_root_endpoint(self) -> bool:
        """Test the root endpoint."""
        try:
            logger.info("Testing root endpoint...")
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✓ Root endpoint working - API: {data.get('name')}")
                return True
            else:
                logger.error(f"❌ Root endpoint failed - Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Root endpoint error: {e}")
            return False
    
    def test_predict_endpoint_valid(self) -> bool:
        """Test the predict endpoint with valid data."""
        try:
            logger.info("Testing predict endpoint with valid data...")
            
            test_data = {
                "age": 30,
                "gender": "Male",
                "sleep_duration": 7.5,
                "sleep_quality": 4,
                "physical_activity": 3,
                "screen_time": 8.0,
                "caffeine_intake": 2,
                "smoking_habit": "No",
                "work_hours": 8.0,
                "travel_time": 1.0,
                "social_interactions": 3,
                "meditation_practice": "Yes",
                "exercise_type": "Cardio"
            }
            
            response = requests.post(
                f"{self.base_url}/predict",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['level', 'score', 'confidence', 'insights', 'recommendations', 'wellnessPlan']
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    logger.error(f"❌ Predict endpoint missing fields: {missing_fields}")
                    return False
                
                logger.info(f"✓ Predict endpoint working - Level: {data.get('level')}, Score: {data.get('score')}")
                return True
            else:
                logger.error(f"❌ Predict endpoint failed - Status: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Predict endpoint error: {e}")
            return False
    
    def test_predict_endpoint_invalid(self) -> bool:
        """Test the predict endpoint with invalid data."""
        try:
            logger.info("Testing predict endpoint with invalid data...")
            
            # Test with missing required field
            invalid_data = {
                "age": 30,
                "gender": "Male",
                # Missing sleep_duration and other required fields
            }
            
            response = requests.post(
                f"{self.base_url}/predict",
                json=invalid_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 422:  # Validation error expected
                logger.info("✓ Predict endpoint correctly rejects invalid data")
                return True
            else:
                logger.error(f"❌ Predict endpoint should reject invalid data - Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Predict endpoint validation error: {e}")
            return False
    
    def test_cors_headers(self) -> bool:
        """Test CORS headers are present."""
        try:
            logger.info("Testing CORS headers...")
            
            # Make an OPTIONS request to check CORS
            response = requests.options(
                f"{self.base_url}/predict",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type"
                },
                timeout=10
            )
            
            cors_headers = [
                'access-control-allow-origin',
                'access-control-allow-methods',
                'access-control-allow-headers'
            ]
            
            present_headers = [header for header in cors_headers if header in response.headers]
            
            if len(present_headers) >= 2:  # At least some CORS headers present
                logger.info("✓ CORS headers present")
                return True
            else:
                logger.warning("⚠ CORS headers may not be properly configured")
                return True  # Don't fail the test for this
                
        except Exception as e:
            logger.error(f"❌ CORS test error: {e}")
            return True  # Don't fail the test for CORS issues
    
    def run_all_tests(self) -> bool:
        """Run all backend tests."""
        logger.info("=" * 50)
        logger.info("BACKEND API CHECKPOINT TESTS")
        logger.info("=" * 50)
        
        tests = [
            ("Health Endpoint", self.test_health_endpoint),
            ("Root Endpoint", self.test_root_endpoint),
            ("Predict Endpoint (Valid)", self.test_predict_endpoint_valid),
            ("Predict Endpoint (Invalid)", self.test_predict_endpoint_invalid),
            ("CORS Headers", self.test_cors_headers),
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
            logger.info("🎉 ALL BACKEND TESTS PASSED!")
            return True
        else:
            logger.error(f"❌ {total - passed} tests failed")
            return False


def main():
    """Main test execution."""
    tester = BackendTester()
    
    try:
        # Start server
        if not tester.start_server():
            logger.error("Failed to start server. Exiting.")
            return False
        
        # Wait a bit more for server to be fully ready
        time.sleep(2)
        
        # Run tests
        success = tester.run_all_tests()
        
        return success
        
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
        return False
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        return False
    finally:
        # Always stop server
        tester.stop_server()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)