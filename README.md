# PULSE AI - Stress Management Platform

A comprehensive stress management platform with AI-powered stress prediction, breathing exercises, and wellness tools.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite (deployed on Netlify)
- **Backend**: FastAPI + Python + ML Model (deployed on Render)

## 📁 Project Structure

```
├── Backend/           # FastAPI backend with ML model
│   ├── models/        # Trained ML models
│   ├── scripts/       # Deployment scripts
│   ├── app.py         # Main FastAPI application
│   ├── requirements.txt
│   └── render.yaml    # Render deployment config
├── Frontend/          # React frontend
│   ├── components/    # React components
│   ├── services/      # API services
│   ├── package.json
│   └── netlify.toml   # Netlify deployment config
└── README.md
```

## 🚀 Deployment

### Backend (Render)

1. Push to GitHub
2. Connect Render to your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python scripts/start_server.py`
5. Set environment variables:
   - `PYTHON_VERSION`: 3.11.0
   - `PORT`: 8000 (auto-set by Render)

### Frontend (Netlify)

1. Connect Netlify to your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL

## 🛠️ Local Development

### Backend Setup

```bash
cd Backend
pip install -r requirements.txt
python scripts/start_server.py
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `FRONTEND_URL`: Production frontend URL for CORS
- `NETLIFY_URL`: Netlify deployment URL for CORS

### Frontend
- `GEMINI_API_KEY`: Google Gemini API key for chatbot
- `REACT_APP_API_URL`: Backend API URL

## 📋 Features

- 🧠 AI-powered stress prediction using ML model
- 💬 Intelligent chatbot with stress management guidance
- 🫁 Breathing exercises and meditation tools
- 📊 Personalized wellness plans
- 📱 Responsive design for all devices

## 🔒 Security

- CORS properly configured for production
- Environment variables for sensitive data
- Input validation and sanitization
- Error handling and logging

## 📈 Monitoring

- Health check endpoint: `/health`
- Comprehensive logging
- Error tracking and debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request