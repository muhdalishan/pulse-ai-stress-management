#!/usr/bin/env python3
"""Test imports"""

try:
    import pickle
    print("✓ pickle imported")
except ImportError as e:
    print(f"❌ pickle import failed: {e}")

try:
    import logging
    print("✓ logging imported")
except ImportError as e:
    print(f"❌ logging import failed: {e}")

try:
    import numpy as np
    print("✓ numpy imported")
except ImportError as e:
    print(f"❌ numpy import failed: {e}")

try:
    import pandas as pd
    print("✓ pandas imported")
except ImportError as e:
    print(f"❌ pandas import failed: {e}")

try:
    from sklearn.ensemble import RandomForestClassifier
    print("✓ sklearn imported")
except ImportError as e:
    print(f"❌ sklearn import failed: {e}")

print("All imports tested")