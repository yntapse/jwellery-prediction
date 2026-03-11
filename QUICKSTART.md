# AI Jewellery Recommendation System - Quick Start Guide

## ⚡ 2-Minute Setup

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies (will take 1-2 min for first-time OpenCLIP download)
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload
```

✅ Backend should start and load models. Watch for this message:
```
✓ All models loaded successfully!
Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend should open automatically at `http://localhost:5173`

### Step 3: Test the App

1. Go to `http://localhost:5173`
2. Upload a dress image
3. See recommendations!

---

## 🔗 Important URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## ✅ Checklist

- [ ] Python installed (check: `python --version`)
- [ ] Node.js installed (check: `node --version`)
- [ ] Backend running and showing "models loaded successfully"
- [ ] Frontend running on localhost:5173
- [ ] Can upload image and get recommendations
- [ ] No CORS errors in browser console
- [ ] Backend health check passes

---

## 🆘 Common Issues

### Backend won't start
```bash
# Delete cache and reinstall
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend won't load
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### "Backend is not running" error
- Make sure backend terminal shows `Uvicorn running`
- Try: `curl http://localhost:8000/health` in new terminal

### Port already in use
```bash
# Backend on different port
uvicorn main:app --port 8001

# Frontend on different port
npm run dev -- --port 5174

# Update frontend .env with new backend URL
```

---

## 📁 File Your Data

The `jewellery_index.faiss` and `image_paths.npy` files are already in the backend directory.

Images referenced in `image_paths.npy` should be placed in the `dataset/necklace_images/` folder.

---

## 🚀 That's it!

Your production-ready AI Jewellery Recommendation System is running!

For detailed information, see [README.md](README.md)
