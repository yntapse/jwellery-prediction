import faiss
import numpy as np
import torch
from PIL import Image
from io import BytesIO
from typing import List
import os

class JewelleryRecommender:
    """FAISS-based jewellery recommendation engine"""
    
    def __init__(self, faiss_index_path: str, image_paths_file: str):
        self.faiss_index = None
        self.image_paths = None
        self.faiss_index_path = faiss_index_path
        self.image_paths_file = image_paths_file
        
    def load_index(self) -> bool:
        """Load FAISS index and image path mapping"""
        try:
            print(f"Loading FAISS index from {self.faiss_index_path}...")
            self.faiss_index = faiss.read_index(self.faiss_index_path)
            
            print(f"Loading image paths from {self.image_paths_file}...")
            self.image_paths = np.load(self.image_paths_file, allow_pickle=True)
            
            print(f"Index loaded successfully with {self.faiss_index.ntotal} vectors")
            print(f"Image paths loaded: {len(self.image_paths)} entries")
            return True
        except Exception as e:
            print(f"Error loading FAISS index or image paths: {str(e)}")
            return False
    
    def get_recommendations(
        self, 
        embedding: np.ndarray, 
        top_k: int = 5
    ) -> List[str]:
        """
        Search FAISS index for nearest necklaces
        
        Args:
            embedding: normalized embedding vector
            top_k: number of recommendations to return
            
        Returns:
            List of image paths for top-k nearest necklaces
        """
        try:
            # Ensure embedding is float32
            embedding = np.array(embedding, dtype=np.float32).reshape(1, -1)
            
            # Search FAISS index
            distances, indices = self.faiss_index.search(embedding, top_k)
            
            # Retrieve image paths
            recommended_paths = [
                str(self.image_paths[idx]) for idx in indices[0]
            ]
            
            print(f"Found {len(recommended_paths)} recommendations")
            return recommended_paths
        except Exception as e:
            print(f"Error searching FAISS index: {str(e)}")
            return []
    
    def preprocess_image(self, image_bytes: bytes, preprocess) -> torch.Tensor:
        """
        Preprocess image using OpenCLIP preprocessing
        
        Args:
            image_bytes: raw image bytes
            preprocess: OpenCLIP preprocessing function
            
        Returns:
            Preprocessed image tensor
        """
        try:
            image = Image.open(BytesIO(image_bytes)).convert('RGB')
            image_tensor = preprocess(image)
            return image_tensor
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            return None
    
    def get_embedding(
        self, 
        image_tensor: torch.Tensor, 
        model: torch.nn.Module,
        device: str
    ) -> np.ndarray:
        """
        Generate image embedding using OpenCLIP model
        
        Args:
            image_tensor: preprocessed image tensor
            model: OpenCLIP model
            device: device to run model on
            
        Returns:
            Normalized embedding vector
        """
        try:
            with torch.no_grad():
                image_tensor = image_tensor.unsqueeze(0).to(device)
                embedding = model.encode_image(image_tensor)
                embedding = embedding.cpu().numpy()
                
                # Normalize embedding
                embedding = embedding / np.linalg.norm(embedding)
            
            return embedding.astype(np.float32)
        except Exception as e:
            print(f"Error generating embedding: {str(e)}")
            return None
