# Development & Debugging Guide

## 🛠️ Development Setup

### IDE Setup

**VS Code (Recommended)**
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

**PyCharm**
- Built-in Python support
- FastAPI support via plugin
- Professional debugging

**WebStorm**
- React/JavaScript debugging
- Vite integration
- Built-in Node support

## 📝 Adding Environment Variables

### Backend (.env)
```bash
cd backend
cat > .env << 'EOF'
MODEL_NAME=ViT-B-32
MODEL_PRETRAINED=laion2b_s34b_b79k
FAISS_INDEX_PATH=jewellery_index.faiss
IMAGE_PATHS_FILE=image_paths.npy
DEVICE=cpu
HOST=0.0.0.0
PORT=8000
RELOAD=true
EOF
```

### Frontend (.env)
```bash
cd frontend
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
EOF
```

## 🔍 Debugging Backend

### Enable Debug Logging

**Add to main.py**:
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/recommend")
async def recommend_necklaces(file: UploadFile = File(...)):
    logger.debug(f"Received file: {file.filename}")
    logger.debug(f"File size: {file.size}")
    # ... rest of code
    logger.debug(f"Generated embedding shape: {embedding.shape}")
```

### Inspect Variables

**FastAPI Debug Mode**:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="debug"
    )
```

### Print Model Information

**test_model.py**:
```python
import torch
from model_loader import ModelLoader

loader = ModelLoader()
loader.load_model()
model = loader.get_model()

print(f"Model: {model}")
print(f"Device: {loader.get_device()}")
print(f"Model parameters: {sum(p.numel() for p in model.parameters())}")

# Test inference
import numpy as np
test_embedding = np.random.randn(1, 512).astype(np.float32)
print(f"Test embedding shape: {test_embedding.shape}")
```

### Inspect FAISS Index

**test_faiss.py**:
```python
import faiss
import numpy as np

# Load index
index = faiss.read_index("jewellery_index.faiss")
print(f"Index structure: {index}")
print(f"Number of vectors: {index.ntotal}")
print(f"Vector dimension: {index.d}")

# Load image paths
paths = np.load("image_paths.npy", allow_pickle=True)
print(f"Number of paths: {len(paths)}")
print(f"Sample paths: {paths[:5]}")

# Test search
query = np.random.randn(1, 512).astype(np.float32)
distances, indices = index.search(query, 5)
print(f"Top 5 distances: {distances}")
print(f"Top 5 paths: {[paths[i] for i in indices[0]]}")
```

### API Debugging

**test_api.py**:
```python
import requests
import json

# Test health
response = requests.get("http://localhost:8000/health")
print(f"Health: {response.json()}")

# Test recommendation with real image
with open("test_dress.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:8000/recommend", files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
```

### Network Inspection

**Use cURL with Verbose Output**:
```bash
# See all HTTP details
curl -v -X POST "http://localhost:8000/recommend" \
  -F "file=@dress.jpg"

# Only headers
curl -I "http://localhost:8000/health"

# Save response to file
curl -X POST "http://localhost:8000/recommend" \
  -F "file=@dress.jpg" \
  -o response.json
```

### Profiling Performance

**Profile Backend**:
```python
import cProfile
import pstats

def test_recommendation():
    # Code to profile
    ...

profiler = cProfile.Profile()
profiler.enable()
test_recommendation()
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)  # Top 20 functions
```

## 🐛 Debugging Frontend

### Browser DevTools

**Open DevTools**:
- Windows/Linux: F12
- macOS: Cmd + Option + I

**Tabs**:
- **Elements**: Inspect DOM
- **Console**: See errors & logs
- **Network**: See API calls
- **Performance**: Profile rendering
- **Application**: Storage, cookies

### Console Logging

**In React Components**:
```javascript
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log("Component mounted");
    return () => console.log("Component unmounted");
  }, []);

  const handleUpload = (file) => {
    console.log("File:", file);
    console.log("File type:", file.type);
    console.log("File size:", file.size);
  };

  return (...);
}
```

### Network Debugging

**Browser Network Tab**:
1. Open DevTools → Network
2. Upload image
3. See POST request details:
   - Headers sent
   - Request payload
   - Response data
   - Response time

**Common Issues**:
```javascript
// CORS error in browser
// Solution: Check backend CORS config

// 404 error
// Solution: Verify backend URL in .env

// Timeout
// Solution: Check if backend is running

// Empty response
// Solution: Check backend logs
```

### React DevTools

**Install Extension**:
- Chrome: React Developer Tools
- Firefox: React Developer Tools

**Use for**:
- Inspect component tree
- Check props and state
- Trace re-renders
- Performance profiling

### API Debugging

**Mock API for Testing**:
```javascript
// In api.js for testing
if (process.env.VITE_MOCK_API === 'true') {
  export const uploadImageForRecommendation = async () => {
    return {
      recommended_necklaces: [
        "dataset/necklace/1.jpg",
        "dataset/necklace/2.jpg",
        "dataset/necklace/3.jpg",
        "dataset/necklace/4.jpg",
        "dataset/necklace/5.jpg"
      ]
    };
  };
}
```

**Use in .env.local**:
```
VITE_API_URL=http://localhost:8000
VITE_MOCK_API=true
```

### Performance Profiling

**React Profiler**:
```javascript
import { Profiler } from 'react';

<Profiler id="ResultsGrid" onRender={onRenderCallback}>
  <ResultsGrid results={results} />
</Profiler>
```

## 🧪 Testing

### Backend Testing

**pytest Setup**:
```bash
pip install pytest pytest-asyncio
```

**tests/test_api.py**:
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200

def test_recommend_success():
    with open("test_image.jpg", "rb") as f:
        response = client.post("/recommend", files={"file": f})
    assert response.status_code == 200
    assert len(response.json()["recommended_necklaces"]) == 5

def test_recommend_no_file():
    response = client.post("/recommend")
    assert response.status_code != 200

def test_large_file():
    large_data = b"x" * (11 * 1024 * 1024)  # 11MB
    response = client.post("/recommend", files={"file": large_data})
    assert response.status_code == 413
```

**Run Tests**:
```bash
pytest tests/
pytest tests/test_api.py::test_health -v
```

### Frontend Testing

**Jest Setup**:
```bash
npm install --save-dev jest @testing-library/react
```

**tests/App.test.jsx**:
```javascript
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders header', () => {
  render(<App />);
  expect(screen.getByText(/AI Jewellery Stylist/i)).toBeInTheDocument();
});
```

**Run Tests**:
```bash
npm test
```

## 📊 Monitoring & Logging

### Backend Logging

**Add Logging to main.py**:
```python
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

@app.post("/recommend")
async def recommend_necklaces(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing file: {file.filename}")
        # ... code ...
        logger.info(f"Recommendation completed for {file.filename}")
        return result
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        raise
```

### Frontend Error Tracking

**Global Error Handler**:
```javascript
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // Send to error tracking service
  // Example: Sentry, LogRocket, etc.
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

## 🔄 Git Workflows

### Ignoring Files

**backend/.gitignore**:
```
venv/
__pycache__/
*.pyc
.env
.DS_Store
```

**frontend/.gitignore**:
```
node_modules/
dist/
.env
.env.local
.DS_Store
```

### Committing Code

```bash
# Backend changes
cd backend
git add -A
git commit -m "feat: add image preprocessing"

# Frontend changes
cd frontend
git add -A
git commit -m "feat: improve UI responsiveness"
```

## 🚀 Using Docker for Development

**Dockerfile.dev** (backend):
```dockerfile
FROM python:3.10
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
```

**Dockerfile.dev** (frontend):
```dockerfile
FROM node:18
WORKDIR /app
RUN npm install
CMD ["npm", "run", "dev"]
```

**Docker Compose** (dev):
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
```

## 📈 Performance Optimization

### Profile Bottlenecks

**Identify slow code**:
```python
import time

@app.post("/recommend")
async def recommend_necklaces(file: UploadFile = File(...)):
    start = time.time()
    
    # Step 1
    step1_start = time.time()
    image_tensor = recommender.preprocess_image(image_bytes, preprocess)
    print(f"Preprocess: {time.time() - step1_start:.3f}s")
    
    # Step 2
    step2_start = time.time()
    embedding = recommender.get_embedding(image_tensor, model, device)
    print(f"Embedding: {time.time() - step2_start:.3f}s")
    
    # Step 3
    step3_start = time.time()
    recommendations = recommender.get_recommendations(embedding)
    print(f"Search: {time.time() - step3_start:.3f}s")
    
    print(f"Total: {time.time() - start:.3f}s")
```

### Optimize Rendering

```javascript
// Avoid unnecessary re-renders
import { memo } from 'react';

const ResultsGrid = memo(({ results }) => {
  return (
    <div>
      {results.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
}, (prev, next) => {
  return JSON.stringify(prev.results) === JSON.stringify(next.results);
});
```

## 🆘 Troubleshooting Commands

```bash
# Check Python version
python --version

# Check Node version
node --version

# Check if ports are in use
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :8000
lsof -i :5173

# Clear all caches
rm -rf backend/venv
rm -rf frontend/node_modules
rm -rf frontend/dist

# Check backend startup
cd backend
python -c "from model_loader import ModelLoader; m = ModelLoader(); print(m.load_model())"

# Test API connectivity
curl -v http://localhost:8000/health

# Check environment
python -m pip list
npm list
```

## 📚 Useful Commands Reference

### Backend
```bash
# Run with auto-reload
uvicorn main:app --reload

# Run with custom port
uvicorn main:app --port 8001

# Run tests
pytest tests/ -v

# Run specific test
pytest tests/test_api.py::test_health

# Check import errors
python -m py_compile main.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎯 Development Best Practices

1. **Use type hints** (Python) and JSDoc (JavaScript)
2. **Add logging** at key checkpoints
3. **Test edge cases** (large files, invalid types)
4. **Profile before optimizing**
5. **Document APIs** with examples
6. **Use version control** frequently
7. **Code review** before production
8. **Monitor in production** (logs, errors, metrics)

## 📞 When to Ask for Help

- README.md - For general questions
- API_REFERENCE.md - For API details
- ARCHITECTURE.md - For system understanding
- Stack Overflow - For specific technical issues
- GitHub Issues - For known bugs
- Official docs - For library-specific questions

---

Happy developing! 🚀
