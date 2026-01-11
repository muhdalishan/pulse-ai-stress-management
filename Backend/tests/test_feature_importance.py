#!/usr/bin/env python3
"""Test feature importance"""

from model_service import initialize_model_service, get_model_service

initialize_model_service('pulse_ai_model_test.pkl')
service = get_model_service()

print(f'Model type: {type(service.model)}')
print(f'Has feature_importances_: {hasattr(service.model, "feature_importances_")}')

if hasattr(service.model, 'feature_importances_'):
    print(f'Feature importances shape: {service.model.feature_importances_.shape}')
    print(f'Feature importances: {service.model.feature_importances_}')
    
    # Test the method
    importance = service._get_feature_importance()
    print(f'Method result: {importance}')
else:
    print('Model does not have feature_importances_ attribute')