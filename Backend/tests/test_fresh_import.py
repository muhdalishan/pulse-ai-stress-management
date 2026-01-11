#!/usr/bin/env python3
"""Test fresh import"""

import sys
import importlib

# Remove any cached modules
if 'model_service' in sys.modules:
    del sys.modules['model_service']

# Fresh import
from model_service import initialize_model_service, get_model_service

initialize_model_service('pulse_ai_model_test.pkl')
service = get_model_service()

print(f'Model type: {type(service.model)}')
print(f'Has feature_importances_: {hasattr(service.model, "feature_importances_")}')
print(f'Service methods: {[m for m in dir(service) if not m.startswith("__")]}')

if hasattr(service, '_get_feature_importance'):
    print('✓ _get_feature_importance method found')
    importance = service._get_feature_importance()
    print(f'Method result: {importance}')
else:
    print('❌ _get_feature_importance method NOT found')