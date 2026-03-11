# API Reference

## Base URL
```
http://localhost:8000
```


# Terminal 1: Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Frontend (new terminal)
cd frontend
npm install
npm run dev

## Endpoints

### 1. POST /recommend

Get jewellery recommendations for a dress image.

**Description**: Upload a dress image and receive top 5 matching necklace recommendations using AI similarity search.

**Request**:

```http
POST /recommend HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data

[binary image data]
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | Image file (PNG, JPG, GIF) |

**File Constraints**:
- Max size: 10MB
- Supported formats: image/png, image/jpeg, image/gif, image/webp
- Min resolution: 1x1 (recommended: 224x224+)

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/recommend" \
  -F "file=@dress.jpg"
```

**Python Example**:

```python
import requests

with open('dress.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/recommend', files=files)
    print(response.json())
```

**JavaScript/Axios Example**:

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', imageFile);

axios.post('http://localhost:8000/recommend', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

**Response** (200 OK):

```json
{
  "recommended_necklaces": [
    "dataset/necklace/img_001.jpg",
    "dataset/necklace/img_042.jpg",
    "dataset/necklace/img_178.jpg",
    "dataset/necklace/img_293.jpg",
    "dataset/necklace/img_456.jpg"
  ],
  "message": "Recommendations generated successfully"
}
```

**Response Schema**:

```typescript
interface RecommendationResponse {
  recommended_necklaces: string[];  // Array of 5 image paths
  message: string;                   // "Recommendations generated successfully"
}
```

**Error Responses**:

| Status | Error | Description | Solution |
|--------|-------|-------------|----------|
| 400 | File must be an image | Uploaded file is not an image | Check file format |
| 413 | File size must be less than 10MB | File is too large | Compress image |
| 400 | Failed to process image | Image is corrupted | Try another image |
| 500 | Failed to generate embedding | Model error | Check backend logs |
| 500 | Failed to generate recommendations | FAISS error | Restart backend |
| 500 | Internal server error | Unexpected error | Check backend logs |

**Response Example with Error**:

```json
{
  "detail": "File size must be less than 10MB"
}
```

**Performance**:
- Avg response time: 500ms - 1s (CPU)
- Avg response time: 200-400ms (GPU)
- Includes network latency

---

### 2. GET /health

Check if the backend and models are loaded and ready.

**Description**: Health check endpoint for monitoring and deployment verification.

**Request**:

```http
GET /health HTTP/1.1
Host: localhost:8000
```

**cURL Example**:

```bash
curl http://localhost:8000/health
```

**Response** (200 OK):

```json
{
  "status": "healthy",
  "models_loaded": true
}
```

**Response Schema**:

```typescript
interface HealthResponse {
  status: "healthy" | "unhealthy";
  models_loaded: boolean;
}
```

**Possible Responses**:

```json
{
  "status": "healthy",
  "models_loaded": true
}
```

OR (if models still loading):

```json
{
  "status": "healthy",
  "models_loaded": false
}
```

**Use Cases**:
- Deployment verification
- Load balancer health checks
- Readiness probes (Kubernetes)
- Monitoring systems

---

### 3. GET /

Get API information.

**Description**: Root endpoint providing API metadata and available endpoints.

**Request**:

```http
GET / HTTP/1.1
Host: localhost:8000
```

**cURL Example**:

```bash
curl http://localhost:8000/
```

**Response** (200 OK):

```json
{
  "message": "AI Jewellery Recommendation System",
  "endpoints": {
    "health": "/health",
    "recommendations": "/recommend (POST)",
    "docs": "/docs"
  }
}
```

---

### 4. GET /docs

Interactive API documentation (Swagger UI).

**Description**: Auto-generated API documentation from FastAPI.

**Request**:

```http
GET /docs HTTP/1.1
Host: localhost:8000
```

**URL**: http://localhost:8000/docs

**Features**:
- Try out endpoint button
- Real-time model documentation
- Schema validation
- Request/response examples

---

### 5. GET /redoc

ReDoc API documentation.

**Description**: Alternative API documentation format (ReDoc).

**Request**:

```http
GET /redoc HTTP/1.1
Host: localhost:8000
```

**URL**: http://localhost:8000/redoc

---

## Request/Response Examples

### Example 1: Successful Recommendation

**Request**:
```bash
curl -X POST "http://localhost:8000/recommend" \
  -F "file=@red_dress.jpg" \
  -H "Accept: application/json"
```

**Response** (200):
```json
{
  "recommended_necklaces": [
    "dataset/necklace/gold_pendant_01.jpg",
    "dataset/necklace/diamond_necklace_15.jpg",
    "dataset/necklace/silver_chain_42.jpg",
    "dataset/necklace/ruby_necklace_08.jpg",
    "dataset/necklace/pearl_necklace_23.jpg"
  ],
  "message": "Recommendations generated successfully"
}
```

### Example 2: File Size Error

**Request**:
```bash
curl -X POST "http://localhost:8000/recommend" \
  -F "file=@huge_file.png"
```

**Response** (413):
```json
{
  "detail": "File size must be less than 10MB"
}
```

### Example 3: Invalid File Type

**Request**:
```bash
curl -X POST "http://localhost:8000/recommend" \
  -F "file=@document.pdf"
```

**Response** (400):
```json
{
  "detail": "File must be an image"
}
```

---

## Data Formats

### Input (Image File)

- **Type**: Binary image data in multipart/form-data
- **Formats**: JPEG, PNG, GIF, WebP
- **Max Size**: 10MB
- **Recommended Resolution**: 224x224+ pixels

### Output (JSON)

```json
{
  "recommended_necklaces": [
    "string",
    "string",
    "string",
    "string",
    "string"
  ],
  "message": "string"
}
```

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid request (file format/size) |
| 413 | Payload Too Large | File exceeds 10MB limit |
| 500 | Internal Server Error | Server error (model/FAISS failure) |
| 503 | Service Unavailable | Backend is starting up |

---

## Rate Limiting

Currently NOT implemented. Production should add:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/recommend")
@limiter.limit("10/minute")
async def recommend_necklaces(file: UploadFile = File(...)):
    ...
```

Recommended: 10-50 requests/minute per IP

---

## CORS Policy

**Current Configuration** (Development):
```python
CORSMiddleware(
    allow_origins=["*"],  # Allow all
)
```

**Recommended** (Production):
```python
CORSMiddleware(
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
```

---

## Authentication

Currently NO authentication needed. For production, add:

```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/recommend")
async def recommend_necklaces(
    file: UploadFile = File(...),
    credentials: HTTPAuthCredentials = Depends(security)
):
    token = credentials.credentials
    # Validate token
    ...
```

---

## Pagination

The `/recommend` endpoint always returns exactly 5 results.

To change:

**Backend** (recommender.py):
```python
def get_recommendations(self, embedding: np.ndarray, top_k: int = 5) -> List[str]:
    # top_k parameter controls this
```

**Use in API**:
```python
@app.post("/recommend")
async def recommend_necklaces(file: UploadFile = File(...), top_k: int = Query(5, le=10)):
    # top_k query parameter
```

---

## Caching

Currently NO caching. To implement:

**Option 1: Client-side (Browser)**
```javascript
const cache = {};
if (cache[imageHash]) return cache[imageHash];
```

**Option 2: Server-side (Redis)**
```python
import redis
cache = redis.Redis()
key = hashlib.md5(image_bytes).hexdigest()
cached = cache.get(key)
```

---

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Test with real image
curl -X POST "http://localhost:8000/recommend" \
  -F "file=@test_image.jpg"

# API docs
open http://localhost:8000/docs
```

### Automated Testing

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_recommend():
    with open("test_image.jpg", "rb") as f:
        response = client.post("/recommend", files={"file": f})
    assert response.status_code == 200
    assert len(response.json()["recommended_necklaces"]) == 5

def test_large_file():
    # Create fake 11MB file
    large_file = b"x" * (11 * 1024 * 1024)
    response = client.post("/recommend", files={"file": large_file})
    assert response.status_code == 413

def test_invalid_file():
    response = client.post("/recommend", files={"file": b"not an image"})
    assert response.status_code == 400
```

---

## Webhooks (Optional Feature)

For async processing, implement webhooks:

```python
@app.post("/recommend-async")
async def recommend_async(file: UploadFile, webhook_url: str):
    # Queue task
    task_id = queue.enqueue(process_image, file)
    
    # Fire webhook when done
    # POST webhook_url with results
    
    return {"task_id": task_id}
```

---

## OpenAPI Schema

The API follows OpenAPI 3.0.0 specification.

**View full schema**:
- Interactive: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- JSON: http://localhost:8000/openapi.json

---

## Versioning

Current version: **1.0.0**

For multiple versions:
```python
@router_v1 = APIRouter(prefix="/v1")
@router_v2 = APIRouter(prefix="/v2")

@router_v1.post("/recommend")
def recommend_v1(...): ...

@router_v2.post("/recommend")
def recommend_v2(...): ...
```

---

## Support & Issues

- API Documentation: http://localhost:8000/docs
- Backend Logs: Check terminal running uvicorn
- Backend Health: curl http://localhost:8000/health
- CORS Issues: Check browser console
- Model Issues: Check backend startup logs

For production API gateway considerations, see [DEPLOYMENT.md](DEPLOYMENT.md).
