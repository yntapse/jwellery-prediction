#!/bin/bash
# Setup script for macOS/Linux

set -e

echo "🚀 Setting up AI Jewellery Recommendation System..."
echo ""

# Backend Setup
echo "📦 Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "✓ Backend dependencies installed"
cd ..

# Frontend Setup
echo "📦 Setting up frontend..."
cd frontend
npm install
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the app:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
