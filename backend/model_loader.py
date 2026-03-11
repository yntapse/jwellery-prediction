import torch
import open_clip
from typing import Tuple

class ModelLoader:
    """Load and manage OpenCLIP model and preprocessing"""
    
    def __init__(self, model_name: str = "ViT-B-32", pretrained: str = "laion2b_s34b_b79k"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = model_name
        self.pretrained = pretrained
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        
    def load_model(self):
        """Load OpenCLIP model and preprocessing pipeline"""
        try:
            print(f"Loading OpenCLIP model: {self.model_name} with {self.pretrained}...")
            
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                self.model_name,
                pretrained=self.pretrained,
                device=self.device
            )
            self.tokenizer = open_clip.get_tokenizer(self.model_name)
            
            self.model.eval()
            print(f"Model loaded successfully on {self.device}")
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def get_model(self):
        """Return the loaded model"""
        return self.model
    
    def get_preprocess(self):
        """Return preprocessing function"""
        return self.preprocess
    
    def get_device(self):
        """Return device (cuda or cpu)"""
        return self.device
