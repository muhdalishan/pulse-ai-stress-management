#!/usr/bin/env python3
"""Minimal test to debug model_service"""

print("Starting test...")

# Test basic imports
try:
    import pickle
    print("✓ pickle imported")
except Exception as e:
    print(f"❌ pickle: {e}")

try:
    import numpy as np
    print("✓ numpy imported")
except Exception as e:
    print(f"❌ numpy: {e}")

try:
    import pandas as pd
    print("✓ pandas imported")
except Exception as e:
    print(f"❌ pandas: {e}")

try:
    from sklearn.ensemble import RandomForestClassifier
    print("✓ sklearn imported")
except Exception as e:
    print(f"❌ sklearn: {e}")

# Test model_service import step by step
print("\nTesting model_service import...")

try:
    import sys
    import os
    print(f"Current directory: {os.getcwd()}")
    print(f"Python path: {sys.path[:3]}")  # First 3 entries
    
    # Try importing the module
    import model_service
    print("✓ model_service imported")
    
    # Check what's in the module
    attrs = [attr for attr in dir(model_service) if not attr.startswith('_')]
    print(f"Module attributes: {attrs}")
    
except Exception as e:
    print(f"❌ model_service import failed: {e}")
    import traceback
    traceback.print_exc()

print("Test complete.")