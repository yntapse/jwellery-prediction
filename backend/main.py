import os
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import torch

from model_loader import ModelLoader
from recommender import JewelleryRecommender

# Initialize FastAPI app
app = FastAPI(
    title="AI Jewellery Recommendation System",
    description="Upload a dress image and get top 5 matching necklace recommendations",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (adjust for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
model_loader = None
recommender = None


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)
DATASET_IMAGES_DIR = os.path.join(WORKSPACE_DIR, "dataset", "necklace_images")


def resolve_data_file(filename: str) -> str:
    """Resolve data files from backend first, then workspace root."""
    candidate_paths = [
        os.path.join(BASE_DIR, filename),
        os.path.join(WORKSPACE_DIR, filename),
    ]

    for candidate_path in candidate_paths:
        if os.path.exists(candidate_path):
            return candidate_path

    raise FileNotFoundError(
        f"Could not find {filename}. Checked: {candidate_paths}"
    )


def normalize_recommendation_path(path_value: str) -> str:
    """Always return a browser-ready path under /images."""
    normalized = str(path_value).replace('\\', '/')
    filename = normalized.split('/')[-1]
    return f"/images/{filename}"

# Response model
class RecommendationResponse(BaseModel):
    recommended_necklaces: List[str]
    message: str = "Recommendations generated successfully"


if os.path.isdir(DATASET_IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=DATASET_IMAGES_DIR), name="images")
else:
    print(f"Warning: dataset image directory not found: {DATASET_IMAGES_DIR}")

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    global model_loader, recommender
    
    print("\n" + "="*60)
    print("Starting AI Jewellery Recommendation System...")
    print("="*60 + "\n")
    
    try:
        # Load OpenCLIP model
        model_loader = ModelLoader(
            model_name="ViT-B-32",
            pretrained="laion2b_s34b_b79k"
        )
        if not model_loader.load_model():
            raise Exception("Failed to load OpenCLIP model")
        
        # Load FAISS recommender
        recommender = JewelleryRecommender(
            faiss_index_path=resolve_data_file("jewellery_index.faiss"),
            image_paths_file=resolve_data_file("image_paths.npy")
        )
        if not recommender.load_index():
            raise Exception("Failed to load FAISS index")
        
        print("\n" + "="*60)
        print("✓ All models loaded successfully!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n✗ Startup error: {str(e)}\n")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\nShutting down AI Jewellery Recommendation System...")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": model_loader is not None and recommender is not None
    }

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_necklaces(file: UploadFile = File(...)):
    """
    Get jewellery recommendations for uploaded dress image
    
    Args:
        file: Dress image file
        
    Returns:
        JSON with top 5 recommended necklace image paths
    """
    try:
        # Validate file
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )
        
        if file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=413,
                detail="File size must be less than 10MB"
            )
        
        # Read image
        image_bytes = await file.read()
        
        # Preprocess image
        preprocess = model_loader.get_preprocess()
        image_tensor = recommender.preprocess_image(image_bytes, preprocess)
        
        if image_tensor is None:
            raise HTTPException(
                status_code=400,
                detail="Failed to process image"
            )
        
        # Generate embedding
        model = model_loader.get_model()
        device = model_loader.get_device()
        embedding = recommender.get_embedding(
            image_tensor, 
            model,
            device
        )
        
        if embedding is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate embedding"
            )
        
        # Get recommendations
        recommendations = recommender.get_recommendations(embedding, top_k=5)
        
        if not recommendations:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate recommendations"
            )
        
        normalized_recommendations = [
            normalize_recommendation_path(path) for path in recommendations
        ]

        return RecommendationResponse(
            recommended_necklaces=normalized_recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in recommendation endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Jewellery Recommendation System",
        "endpoints": {
            "health": "/health",
            "recommendations": "/recommend (POST)",
            "images": "/images/{filename}",
            "docs": "/docs"
        }
    }


@app.get("/{filename}")
async def root_image_fallback(filename: str):
    """Serve image files from root for compatibility with legacy clients."""
    extension = os.path.splitext(filename)[1].lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(status_code=404, detail="Not Found")

    image_path = os.path.join(DATASET_IMAGES_DIR, filename)
    if not os.path.isfile(image_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(image_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
