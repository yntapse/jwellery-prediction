# Deployment Guide

## 🚀 Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip and npm

### Step-by-Step

1. **Clone/Setup Project**
   ```bash
   cd jewellery-ai-app
   ```

2. **Run Setup Script**
   ```bash
   # Windows
   setup.bat
   
   # macOS/Linux
   bash setup.sh
   ```

3. **Start Backend (Terminal 1)**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   uvicorn main:app --reload
   ```

4. **Start Frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access Application**
   - Open browser to `http://localhost:5173`

---

## 🐳 Docker Deployment

### Build Images

```bash
# Backend
docker build -t jewellery-backend ./backend

# Frontend
docker build -t jewellery-frontend ./frontend
```

### Run with Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DEVICE=cpu
    volumes:
      - ./backend/jewellery_index.faiss:/app/jewellery_index.faiss
      - ./backend/image_paths.npy:/app/image_paths.npy

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend
```

```bash
docker-compose up
```

---

## ☁️ Cloud Deployment

### AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 20.04 LTS
   - Instance: t3.medium (2GB RAM minimum)
   - Storage: 20GB

2. **Install Dependencies**
   ```bash
   sudo apt-get update
   sudo apt-get install python3 python3-venv python3-pip nodejs npm
   ```

3. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd jewellery-ai-app
   bash setup.sh
   ```

4. **Run with Systemd**
   
   Create `/etc/systemd/system/jewellery-backend.service`:
   ```ini
   [Unit]
   Description=Jewellery AI Backend
   After=network.target

   [Service]
   Type=notify
   User=ubuntu
   WorkingDirectory=/home/ubuntu/jewellery-ai-app/backend
   ExecStart=/home/ubuntu/jewellery-ai-app/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable jewellery-backend
   sudo systemctl start jewellery-backend
   ```

### Heroku

1. **Create Procfile**:
   ```
   web: cd backend && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Deploy**:
   ```bash
   heroku create jewellery-ai
   git push heroku main
   ```

### DigitalOcean App Platform

1. Upload to GitHub
2. Connect repository to DigitalOcean App Platform
3. Configure services for backend and frontend
4. Deploy automatically

---

## 🔒 Security Checklist

- [ ] Set `CORS_ORIGINS` to specific domain (not `*`)
- [ ] Use HTTPS/SSL certificate
- [ ] Set environment variables in production
- [ ] Use `.env` files (never commit credentials)
- [ ] Enable API rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Validate file uploads strictly
- [ ] Use strong authentication for admin access

### Production CORS Setup

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
```

---

## 📊 Monitoring

### Backend Health Checks

```bash
# Check backend status
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "models_loaded": true}
```

### Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend errors
# Check browser console (F12)
```

### Performance Tuning

**For GPU (NVIDIA)**:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**Enable GPU in code**:
```python
# model_loader.py will automatically detect GPU
# Check logs for "Model loaded successfully on cuda"
```

**Increase CPU performance**:
```bash
# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        run: |
          ssh user@server.com << 'EOF'
          cd jewellery-ai-app
          git pull
          bash setup.sh
          systemctl restart jewellery-backend
          EOF
```

---

## 📦 Production Build

### Backend
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
npm run build
# Outputs to dist/ folder
# Serve with nginx or any static server
```

### Nginx Configuration

```nginx
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/jewellery-frontend/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🆘 Troubleshooting Deployment

### "Models not loaded"
```bash
# Ensure FAISS and npy files are in backend directory
ls -la backend/jewellery_index.faiss
ls -la backend/image_paths.npy
```

### "Port already in use"
```bash
# Find process
lsof -i :8000

# Kill it
kill -9 <PID>
```

### "Out of memory"
```bash
# For large datasets, reduce batch size or use CPU
# Increase server RAM or use cloud instance with more memory
```

### "Slow inference"
- Use GPU if available
- Profile with `python -m cProfile main.py`
- Consider caching popular searches

---

## 📞 Support Matrix

| Issue | Solution |
|-------|----------|
| ModuleNotFoundError | Run `pip install -r requirements.txt` |
| npm ERR! | Run `npm install` in frontend directory |
| CORS Error | Check backend is running on port 8000 |
| Long inference time | Enable GPU or optimize FAISS index |
| High memory usage | Reduce number of embeddings or use indexing |

---

## 📈 Scaling

For 10k+ requests/day:
1. Use load balancer (Nginx, HAProxy)
2. Run multiple backend instances
3. Add caching layer (Redis)
4. Use CDN for frontend
5. Optimize FAISS index (IVF, PQ)
6. Consider using Kubernetes

---

## ✅ Deployment Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] FAISS index and image paths in place
- [ ] Both backend and frontend tested locally
- [ ] Security settings configured
- [ ] Monitoring set up
- [ ] Backup strategy ready
- [ ] Documentation updated
- [ ] Team trained on deployment process
- [ ] Rollback plan in place

---

For production support, consult AWS, DigitalOcean, or Heroku documentation.
