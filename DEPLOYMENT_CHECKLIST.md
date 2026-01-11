# 🚀 Deployment Checklist

## Pre-Deployment Setup

### 1. Repository Preparation
- [x] Clean project structure (only Backend/ and Frontend/ folders)
- [x] Created .gitignore files for both Backend and Frontend
- [x] Updated README.md with deployment instructions
- [x] Removed unnecessary files (logs, test files, IDE configs)

### 2. Backend (Render) Preparation
- [x] Updated app.py to handle environment variables (PORT, HOST)
- [x] Updated CORS configuration for production URLs
- [x] Created render.yaml configuration file
- [x] Updated start_server.py to handle environment variables
- [x] Ensured requirements.txt is up to date

### 3. Frontend (Netlify) Preparation
- [x] Created netlify.toml configuration file
- [x] Created .env.example template
- [x] Updated predictionService.ts with production-ready API URL handling
- [x] Ensured build command works (npm run build)

## Deployment Steps

### Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Backend" folder as root directory
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python scripts/start_server.py`

3. **Environment Variables**
   - `PYTHON_VERSION`: 3.11.0
   - `PORT`: (auto-set by Render)
   - `FRONTEND_URL`: (will be set after frontend deployment)

### Frontend Deployment (Netlify)

1. **Create Netlify Site**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Select "Frontend" folder as base directory
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   - `REACT_APP_API_URL`: Your Render backend URL
   - `GEMINI_API_KEY`: Your Google Gemini API key

### Post-Deployment Configuration

1. **Update CORS Settings**
   - Add your Netlify URL to backend CORS configuration
   - Set `FRONTEND_URL` environment variable in Render

2. **Test Deployment**
   - Test health endpoint: `https://your-backend.onrender.com/health`
   - Test frontend: `https://your-frontend.netlify.app`
   - Test stress prediction functionality
   - Test chatbot functionality

## Environment Variables Reference

### Backend (Render)
```
PYTHON_VERSION=3.11.0
PORT=8000
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend.netlify.app
NETLIFY_URL=https://your-frontend.netlify.app
```

### Frontend (Netlify)
```
REACT_APP_API_URL=https://your-backend.onrender.com
GEMINI_API_KEY=your_gemini_api_key_here
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is added to backend CORS configuration
   - Check environment variables are set correctly

2. **Build Failures**
   - Check requirements.txt for backend
   - Check package.json for frontend
   - Verify Node.js and Python versions

3. **API Connection Issues**
   - Verify REACT_APP_API_URL is set correctly
   - Check backend health endpoint
   - Review network logs in browser

### Monitoring

- Backend health: `https://your-backend.onrender.com/health`
- Backend docs: `https://your-backend.onrender.com/docs`
- Check Render logs for backend issues
- Check Netlify deploy logs for frontend issues

## Success Criteria

- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Stress prediction works with different input values
- [ ] Chatbot responds correctly
- [ ] No CORS errors in browser console
- [ ] All features work on mobile devices