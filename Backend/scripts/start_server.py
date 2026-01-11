#!/usr/bin/env python3
"""
PULSE-AI Backend API - Server Startup Script

This script provides a convenient way to start the FastAPI server
with proper configuration and error handling.

Usage:
    python start_server.py [--port PORT] [--host HOST] [--reload]
"""

import argparse
import sys
import os
import uvicorn
import logging

# Add the parent directory to the Python path so we can import from Backend root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main function to start the FastAPI server with command line arguments."""
    
    parser = argparse.ArgumentParser(description="Start PULSE-AI Backend API Server")
    
    # Get defaults from environment variables (for Render deployment)
    default_host = os.getenv("HOST", "0.0.0.0")
    default_port = int(os.getenv("PORT", 8000))
    default_reload = os.getenv("RELOAD", "false").lower() == "true"
    default_log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    parser.add_argument(
        "--host", 
        type=str, 
        default=default_host,
        help=f"Host to bind the server to (default: {default_host})"
    )
    parser.add_argument(
        "--port", 
        type=int, 
        default=default_port,
        help=f"Port to bind the server to (default: {default_port})"
    )
    parser.add_argument(
        "--reload", 
        action="store_true",
        default=default_reload,
        help="Enable auto-reload during development"
    )
    parser.add_argument(
        "--log-level", 
        type=str, 
        default=default_log_level,
        choices=["debug", "info", "warning", "error"],
        help=f"Log level (default: {default_log_level})"
    )
    
    args = parser.parse_args()
    
    # Check if app.py exists in parent directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app_path = os.path.join(backend_dir, "app.py")
    
    if not os.path.exists(app_path):
        logger.error("app.py not found in Backend directory")
        logger.error(f"Expected path: {app_path}")
        sys.exit(1)
    
    # Check if model file exists (warning only)
    model_path = os.path.join(backend_dir, "models", "pulse_ai_model_test.pkl")
    if not os.path.exists(model_path):
        logger.warning(f"Model file not found at {model_path}")
        logger.warning("Model endpoints will not work until model is available")
    
    logger.info(f"Starting PULSE-AI Backend API server...")
    logger.info(f"Host: {args.host}")
    logger.info(f"Port: {args.port}")
    logger.info(f"Reload: {args.reload}")
    logger.info(f"Log Level: {args.log_level}")
    
    try:
        # Change to backend directory before starting server
        os.chdir(backend_dir)
        
        # Start the server
        uvicorn.run(
            "app:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level=args.log_level,
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server failed to start: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()