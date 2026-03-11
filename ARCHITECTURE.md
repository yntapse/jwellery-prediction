# Architecture & System Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AI JEWELLERY RECOMMENDATION SYSTEM              │
└─────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │   USER BROWSER  │
                          │   (React App)   │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            HTTP GET/POST      Upload     GET /health
                    │              │              │
                    ↓              ↓              ↓
            ┌────────────────────────────────────────┐
            │         FastAPI Backend Server         │
            │      (Uvicorn @ localhost:8000)        │
            └─────────────┬──────────────────────────┘
                          │
        ┌─────────────────┼──────────────────────┐
        │                 │                      │
        ↓                 ↓                      ↓
    ┌────────────┐  ┌──────────────┐  ┌──────────────┐
    │ OpenCLIP   │  │    FAISS     │  │ Image Paths  │
    │  ViT-B-32  │  │ Vector Index │  │   (NumPy)    │
    │   Model    │  │              │  │              │
    └────────────┘  └──────────────┘  └──────────────┘
```

## Request Flow Diagram

```
1. User Upload
   ┌────────────────────────┐
   │ Select Dress Image     │
   │ (PNG, JPG, GIF < 10MB) │
   └────────────┬───────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Browser Preview & Validation   │
   │ (React UploadForm Component)   │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Axios POST to /recommend       │
   │ FormData with image file       │
   │ (Show loading spinner)         │
   └────────────┬───────────────────┘
                │
                │ HTTP POST with multipart/form-data
                │
                ↓
2. Backend Processing
   ┌────────────────────────────────┐
   │ FastAPI Receives Request       │
   │ Check file type & size         │
   │ Extract binary image data      │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Preprocess Image               │
   │ Using OpenCLIP transforms      │
   │ Resize, normalize, tensor      │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Generate Image Embedding       │
   │ OpenCLIP model.encode_image()  │
   │ Output: 512-dim float32 vector │
   │ Normalize L2 norm = 1.0        │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ FAISS Vector Search            │
   │ Query: [normalized embedding]  │
   │ Top-K: 5                       │
   │ Metric: L2 (Euclidean)        │
   │ Result: [idx1, idx2, ...]      │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Map Indices to Paths           │
   │ image_paths.npy[idx] → "path"  │
   │ Return JSON response           │
   └────────────┬───────────────────┘
                │
                │ HTTP 200 with JSON
                │ {
                │   "recommended_necklaces": [
                │     "dataset/necklace/1.jpg",
                │     "dataset/necklace/2.jpg",
                │     ...
                │   ]
                │ }
                │
                ↓
3. Frontend Display
   ┌────────────────────────────────┐
   │ Axios Receives Response        │
   │ Parse JSON                     │
   │ Hide loading spinner           │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Update React State             │
   │ setResults(recommendations)    │
   └────────────┬───────────────────┘
                │
                ↓
   ┌────────────────────────────────┐
   │ Render ResultsGrid Component   │
   │ Display 5 cards in grid layout │
   │ Each card: image + filename    │
   │ Smooth animations & hover      │
   └────────────────────────────────┘
```

## Component Architecture

### Backend Components

```
main.py (FastAPI App)
├── Startup Events
│   ├── Load OpenCLIP model
│   ├── Load FAISS index
│   └── Load image path mappings
│
├── API Endpoints
│   ├── GET /health
│   ├── GET /
│   ├── POST /recommend ← MAIN ENDPOINT
│   ├── GET /docs (Swagger)
│   └── GET /redoc
│
└── Middleware
    └── CORS (Cross-Origin Resource Sharing)

model_loader.py (ModelLoader Class)
├── load_model()
│   ├── Initialize OpenCLIP
│   ├── Download pretrained weights
│   └── Set device (CPU/GPU)
│
├── get_model()
├── get_preprocess()
└── get_device()

recommender.py (JewelleryRecommender Class)
├── load_index()
│   ├── Load FAISS index
│   └── Load image path mapping
│
├── preprocess_image()
│   ├── Load from bytes
│   ├── Convert to RGB
│   └── Apply transforms
│
├── get_embedding()
│   ├── Forward pass through model
│   ├── Extract features
│   └── Normalize vector
│
└── get_recommendations()
    ├── Query FAISS index
    ├── Retrieve top-5 indices
    └── Map to image paths
```

### Frontend Components

```
App.jsx (Main Component)
├── State Management
│   ├── results (recommended images)
│   ├── isLoading (API call status)
│   ├── error (error messages)
│   └── backendReady (connection status)
│
├── Effects
│   └── useEffect: Check backend health on mount
│
├── Handlers
│   ├── handleUpload
│   └── checkBackendHealth
│
└── Render
    ├── Header (title + status badge)
    ├── Error Alert (if present)
    ├── UploadForm (or preview)
    ├── ResultsGrid (if recommendations exist)
    ├── Feature Cards (how it works)
    └── Footer

UploadForm.jsx (Upload Component)
├── State
│   ├── dragActive (hover state)
│   ├── preview (image preview)
│   └── error (validation errors)
│
├── Handlers
│   ├── handleDrag (drag events)
│   ├── handleDrop (drop event)
│   ├── handleChange (file input)
│   ├── processFile (validation)
│   └── clearPreview (reset)
│
└── Features
    ├── Drag & drop zone
    ├── File input button
    ├── Image preview
    └── Error messages

ResultsGrid.jsx (Results Component)
├── Props
│   ├── results (image paths)
│   └── isLoading (loading state)
│
└── Features
    ├── Responsive grid (5 cols desktop, 2 mobile)
    ├── Image cards with ranking
    ├── Hover effects
    ├── Fallback for missing images
    └── Loading spinner

api.js (API Client)
├── uploadImageForRecommendation()
│   ├── Create FormData
│   ├── POST to /recommend
│   └── Handle errors
│
└── healthCheck()
    ├── GET /health
    └── Handle errors
```

## Data Flow

### Image Processing Pipeline

```
User Image (JPG/PNG/GIF)
    ↓
[FileReader] → Base64 Data URL
    ↓
[Upload] → FormData → Axios
    ↓
[Backend Receives] Image Bytes
    ↓
[PIL] → RGB Image
    ↓
[OpenCLIP Preprocessing]
├── Resize to 224x224
├── Normalize pixels
├── Convert to tensor
└── Add batch dimension
    ↓
[OpenCLIP Model]
├── ViT-B-32 Patch Embedding
├── Vision Transformer
├── Average pooling
└── Output 512-dim vector
    ↓
[Normalization]
├── Calculate L2 norm
└── Divide by norm → embedding ∈ [0, 1]
    ↓
[FAISS Query]
├── Find 5 nearest vectors
├── Euclidean distance
└── Return top-5 indices
    ↓
[Mapping]
├── image_paths[idx1] → path1
├── image_paths[idx2] → path2
└── ...
    ↓
[Response] JSON with 5 paths
    ↓
[Frontend] Render images
```

## Technology Stack Details

### Backend

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| Framework | FastAPI | 0.104.1 | Modern async web framework |
| Server | Uvicorn | 0.24.0 | ASGI application server |
| ML Model | OpenCLIP | 2.24.0 | Vision Transformer model |
| DL Framework | PyTorch | 2.0.1 | Deep learning computations |
| Vector DB | FAISS | 1.7.4 | Similarity search |
| Image Proc | Pillow | 10.0.1 | Image manipulation |
| Numerics | NumPy | 1.24.3 | Array operations |

### Frontend

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| UI Framework | React | 18.2.0 | Component-based UI |
| Build Tool | Vite | 4.4.5 | Fast module bundler |
| HTTP Client | Axios | 1.5.0 | Promise-based HTTP |
| Styling | Tailwind CSS | 3.3.3 | Utility-first CSS |
| CSS Process | PostCSS | 8.4.31 | CSS transformations |

## Performance Characteristics

### Inference Performance

```
Image Upload
    ↓ ~100ms (network)
Preprocess
    ↓ ~50ms (PIL operations)
Generate Embedding
    ↓ ~200-500ms (model inference, CPU)
    └ ~50-100ms (model inference, GPU)
FAISS Search
    ↓ ~10-50ms (for 1K-100K vectors)
Response
    ↓ ~100ms (network)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~500ms-1s (CPU), ~200-400ms (GPU)
```

### Memory Usage

- **Model**: ~350MB (OpenCLIP ViT-B-32)
- **FAISS Index**: ~4MB per 1000 vectors
- **Runtime**: ~2-3GB typical per request

### Scalability

| Metric | Value |
|--------|-------|
| Throughput (CPU) | 10-20 req/s |
| Throughput (GPU) | 50-100 req/s |
| Max Vectors (FAISS) | 1 billion+ |
| Max Concurrent Users | 100+ (with load balancer) |

## Security Architecture

```
┌────────────────────────────┐
│   User's Browser           │
│   (Firewall Protected)     │
└────────────┬───────────────┘
             │
             ↓ HTTPS (TLS 1.2+)
             │
┌────────────────────────────┐
│   CORS Middleware          │
│   Only allow trusted hosts │
└────────────┬───────────────┘
             │
             ↓
┌────────────────────────────┐
│   File Validation          │
│   - Type check (image/*)   │
│   - Size limit (10MB)      │
│   - No malicious code      │
└────────────┬───────────────┘
             │
             ↓
┌────────────────────────────┐
│   Safe Processing          │
│   - Sandbox execution      │
│   - No file system access  │
│   - Memory limits          │
└────────────┬───────────────┘
             │
             ↓
┌────────────────────────────┐
│   Response Filtering       │
│   - No sensitive data      │
│   - Rate limiting          │
└────────────────────────────┘
```

## Deployment Architecture

### Development

```
MacBook/Windows/Linux
├── Backend (localhost:8000)
│   ├── Uvicorn dev server
│   ├── Auto-reload enabled
│   └── SQLite logging
└── Frontend (localhost:5173)
    ├── Vite dev server
    ├── Hot module replacement
    └── Source maps enabled
```

### Production (Single Server)

```
Linux Server (t3.medium+)
├── Backend (port 8000)
│   ├── Gunicorn + Uvicorn
│   ├── 4 worker processes
│   └── Systemd service
└── Frontend (port 3000)
    ├── Nginx reverse proxy
    └── Static file serving
```

### Production (Scaled)

```
Load Balancer
├── Backend 1 (port 8000)
├── Backend 2 (port 8001)
└── Backend 3 (port 8002)
    ↓ (shared)
    ├── FAISS Index (mounted)
    └── Image Paths (mounted)

CDN
├── Frontend assets
├── Model weights (cached)
└── Images (cached)

Cache Layer
├── Redis (popular searches)
└── LocalStorage (browser cache)
```

## Monitoring & Observability

### Metrics to Monitor

```
Backend
├── Request latency (p50, p95, p99)
├── Error rate (4xx, 5xx)
├── Model load time
├── FAISS query time
├── Memory usage
└── GPU utilization (if available)

Frontend
├── Page load time
├── Time to interactive
├── Error rate (JavaScript errors)
├── Image load times
└── User engagement metrics
```

### Logging

```python
# Backend logging
logging.info("Request received")
logging.debug(f"Embedding shape: {embedding.shape}")
logging.error(f"FAISS search failed: {e}")

# Frontend logging
console.log("Image uploaded");
console.error("Backend error:", error);
```

## Future Scalability

1. **Horizontal Scaling**: Multiple backend instances with load balancer
2. **Caching**: Redis for popular searches
3. **CDN**: Serve static assets globally
4. **GPU Acceleration**: NVIDIA CUDA for 5x faster inference
5. **Model Optimization**: ONNX, TensorRT for edge deployment
6. **Database**: MongoDB for user preferences
7. **Microservices**: Separate services for upload, processing, search
8. **Kubernetes**: Orchestration for large deployments
