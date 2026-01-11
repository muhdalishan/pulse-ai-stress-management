# PULSE-AI Backend API

This is the backend API for the PULSE-AI stress prediction application.

## Project Structure

```
Backend/
├── app.py                 # Main FastAPI application
├── schemas.py             # Pydantic models and schemas
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── pulse_ai_backend.log  # Application log file
│
├── data/                 # Data files
│   └── stress_detection_data.csv
│
├── models/               # ML models and training scripts
│   ├── pulse_ai_model.pkl
│   ├── pulse_ai_model_test.pkl
│   ├── train_model.py
│   └── create_test_model.py
│
├── services/             # Business logic services
│   ├── model_service.py
│   └── response_formatter.py
│
├── scripts/              # Utility scripts
│   ├── start_server.py
│   └── run_server_no_reload.py
│
├── tests/                # Test files
│   ├── test_*.py
│   └── minimal_test.py
│
├── debug/                # Debug and backup files
│   ├── debug_*.py
│   ├── model_service_backup.py
│   ├── model_service_broken*.py
│   └── checkpoint_summary.py
│
└── logs/                 # Log files
    └── pulse_ai_backend.log
```

## Quick Start

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   # From Backend directory
   python app.py
   
   # Or using the script (from scripts directory)
   python scripts/start_server.py
   
   # Or without auto-reload (recommended for production)
   python scripts/run_server_no_reload.py
   ```

3. Access the API:
   - API: http://localhost:8001
   - Documentation: http://localhost:8001/docs
   - Health Check: http://localhost:8001/health

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check with detailed system status
- `POST /predict` - Stress level prediction endpoint
- `GET /debug/logs` - Debug endpoint for recent logs
- `GET /debug/model` - Debug endpoint for model information

## Development

- Main application: `app.py`
- Model service: `services/model_service.py`
- Response formatting: `services/response_formatter.py`
- Data schemas: `schemas.py`

## Testing

Run tests from the Backend directory:
```bash
python -m pytest tests/
```

## Deployment

Use the production script without auto-reload:
```bash
python scripts/run_server_no_reload.py --port 8001
```

## Features

- FastAPI application with automatic OpenAPI documentation
- CORS configuration for frontend integration
- Health check endpoint for service monitoring
- Async request handling for high concurrency
- Comprehensive error handling and logging
- Organized folder structure for maintainability