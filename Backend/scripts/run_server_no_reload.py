#!/usr/bin/env python3
"""
Run the server without auto-reload to avoid global variable issues
"""

import uvicorn
import sys
import os

# Add the parent directory to the Python path so we can import from Backend root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=False)