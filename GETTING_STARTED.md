# Getting Started - Step by Step

## 🎯 Goal
Get the AI Jewellery Recommendation System running in 5 minutes.

---

## Step 1️⃣: Verify Requirements

### Check Python
```bash
python --version
```
✅ Should be Python 3.8 or higher

### Check Node.js
```bash
node --version
npm --version
```
✅ Should be Node 16+ and npm 8+

---

## Step 2️⃣: Backend Setup

### Open Terminal/Command Prompt
Navigate to the project directory:
```bash
cd f:\assignment
cd backend
```

### Create Virtual Environment
**Windows**:
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**:
```bash
python -m venv venv
source venv/bin/activate
```

✅ You should see `(venv)` at the start of your terminal line

### Install Dependencies
```bash
pip install -r requirements.txt
```

⏳ This will take 2-3 minutes (downloads OpenCLIP model)

✅ Wait for completion. You should see "Successfully installed..."

### Verify Installation
```bash
python -c "import torch; import open_clip; import faiss; print('✅ All imports OK')"
```

---

## Step 3️⃣: Start Backend Server

In the same terminal:
```bash
uvicorn main:app --reload
```

✅ You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Keep this terminal open!

### Test Backend Health
Open new terminal and run:
```bash
curl http://localhost:8000/health
```

✅ Should return:
```json
{"status": "healthy", "models_loaded": true}
```

---

## Step 4️⃣: Frontend Setup

### Open NEW Terminal
Navigate to frontend:
```bash
cd f:\assignment\frontend
```

### Install Dependencies
```bash
npm install
```

⏳ This will take 1-2 minutes

✅ Should complete with "added XX packages"

---

## Step 5️⃣: Start Frontend Server

```bash
npm run dev
```

✅ You should see:
```
Local:   http://localhost:5173/
```

✅ Browser should open automatically!

---

## 🎉 Success!

### You should now see:
1. **Beautiful UI** with "AI Jewellery Stylist" header
2. **Upload area** for dragging/dropping images
3. **"Backend Ready"** status in top right

---

## 🧪 Test It Out

### Upload an Image
1. Drag & drop a dress image into the upload area
   - OR click "Browse Files"
   - Recommended: 224x224+ pixels
   - Any format: PNG, JPG, GIF

2. See image preview

3. Wait ~1 second

4. See **Top 5 Recommended Necklaces** appear!

---

## 🔗 Important URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Your app |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | API documentation |
| http://localhost:8000/health | Backend status |

---

## ✅ Troubleshooting

### "Backend is not available" Error
✅ **Solution**: Check backend terminal shows "Uvicorn running"

### Port 8000 or 5173 already in use
✅ **Solution**: 
```bash
# Backend different port
uvicorn main:app --port 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001
```

### "ModuleNotFoundError: No module named 'torch'"
✅ **Solution**: 
```bash
pip install -r requirements.txt
```

### "Cannot find module" in frontend
✅ **Solution**:
```bash
rm -rf node_modules
npm install
```

### Image won't upload
✅ Check:
- File is an image (PNG, JPG, GIF)
- File is less than 10MB
- Check browser console (F12) for errors

---

## 📁 Terminal Layout

**Ideal Setup**:

```
┌─────────────────────┬──────────────────────┐
│   Terminal 1        │    Terminal 2        │
│   (Backend)         │    (Frontend)        │
├─────────────────────┼──────────────────────┤
│                     │                      │
│  Backend running    │  Frontend running    │
│  port 8000          │  port 5173           │
│  Stay open!         │  Stay open!          │
│                     │                      │
│ (venv) $ uvicorn   │ $ npm run dev        │
│   main:app          │                      │
│   --reload          │  ➜ Local:           │
│                     │   http://localhost   │
│ ✓ Models loaded     │   :5173/             │
│ ✓ Running on        │                      │
│   8000              │                      │
│                     │                      │
└─────────────────────┴──────────────────────┘
         ↓                      ↓
    Runs in background    Opens in browser
```

---

## 🛑 When You're Done

### To Stop
- Press `Ctrl + C` in both terminals

### To Start Again
1. Terminal 1: `uvicorn main:app --reload`
2. Terminal 2: `npm run dev`

---

## 📚 Next Steps

- ✅ Read **QUICKSTART.md** for 2-minute overview
- ✅ Read **README.md** for full documentation
- ✅ Check **API_REFERENCE.md** to understand the API
- ✅ See **ARCHITECTURE.md** for system design
- ✅ View **DEVELOPMENT.md** for debugging tips

---

## 💡 Pro Tips

### Faster Restarts
- Keep both terminals open
- Changes auto-reload in both backend and frontend

### Access API Docs
- Open http://localhost:8000/docs (Swagger UI)
- Try endpoints directly
- See request/response examples

### Android/Tablet Testing
- Use IP instead of localhost
- Find your machine IP: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
- Visit: `http://<YOUR_IP>:5173`

### Share Your App Locally
- Others on same network can access:
- `http://<YOUR_IP>:5173`

---

## 🎓 Understanding the Flow

```
You upload dress image
   ↓ (React)
Browser shows preview
   ↓ (Axios POST)
Sends to http://localhost:8000/recommend
   ↓ (FastAPI)
Backend processes image
   ↓ (OpenCLIP + FAISS)
Finds 5 matching necklaces
   ↓ (JSON response)
React displays results
   ↓
You see recommendations!
```

---

## ✨ Features You Can Try

1. **Drag & Drop**: Try dragging multiple images
2. **Different Formats**: PNG, JPG, GIF, WebP
3. **Different Images**: Dresses, shirts, any clothing
4. **Reset**: Click "Change Image" to try another
5. **Error Handling**: Try uploading non-image file (shows error)
6. **Responsive**: Resize browser to see mobile layout

---

## 🚀 Performance

- **First upload**: ~1-2 seconds (model warming up)
- **Subsequent uploads**: ~500ms-1sec typical
- **GPU users**: ~200-400ms

---

## 📞 Quick Help

| Issue | Quick Fix |
|-------|-----------|
| Backend not running | Check terminal 1, error messages |
| Frontend not running | Check terminal 2, run `npm install` |
| Port in use | Change port in startup command |
| CORS error | Backend is not running on 8000 |
| Slow inference | Normal, OpenCLIP is thorough |
| Image won't upload | Check file type and size |

---

## 🎯 What to Do Next

### Immediate Next (5 min)
1. ✅ Get it running (this guide)
2. ✅ Upload a sample image
3. ✅ See results appear

### Short Term (30 min)
1. Read QUICKSTART.md
2. Understand the API (API_REFERENCE.md)
3. Check system design (ARCHITECTURE.md)

### Medium Term (1-2 hours)
1. Customize the UI colors
2. Add more necklace images
3. Deploy locally with Docker

### Long Term (next session)
1. Deploy to production
2. Add authentication
3. Add database
4. Monitor performance

---

## 🎉 You're All Set!

Your AI Jewellery Recommendation System is now running!

**Next action**: 
1. Open http://localhost:5173
2. Upload a dress image
3. Get necklace recommendations!

Enjoy! 🎨✨

---

**Questions?**
- Setup: See QUICKSTART.md
- Features: See README.md
- API: See API_REFERENCE.md
- Architecture: See ARCHITECTURE.md
- Debugging: See DEVELOPMENT.md
