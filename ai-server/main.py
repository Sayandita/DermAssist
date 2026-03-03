import torch
import torch.nn as nn
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import io
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DermAssist AI Inference Server")

# Define the model mapping and medical insights
CLASS_MAP = {
    0: {"name": "Actinic keratosis", "id": "akiec", "insight": "A precancerous skin lesion that may progress to squamous cell carcinoma."},
    1: {"name": "Basal cell carcinoma", "id": "bcc", "insight": "Common, slow-growing skin cancer. Rarely spreads but should be treated early."},
    2: {"name": "Benign keratosis-like lesions", "id": "bkl", "insight": "Non-cancerous skin growth, often appearing in older age."},
    3: {"name": "Dermatofibroma", "id": "df", "insight": "A common benign fibrous nodule, often on the legs."},
    4: {"name": "Melanoma", "id": "mel", "insight": "The most serious type of skin cancer. Requires immediate medical attention."},
    5: {"name": "Melanocytic nevi", "id": "nv", "insight": "Commonly known as moles. Most are benign but should be monitored for changes."},
    6: {"name": "Vascular lesions", "id": "vasc", "insight": "Abnormalities of blood vessels in the skin, usually benign."}
}

# Model loading logic
def load_model():
    try:
        # Using weights=None as we are loading a custom .pt file
        model = models.efficientnet_b0(weights=None)
        # Adjust the final layer to match our 7 classes
        num_ftrs = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_ftrs, 7)
        
        # Load state dict
        # In a real scenario, the user would provide model.pt
        try:
            loaded_obj = torch.load("model.pt", map_location=torch.device('cpu'), weights_only=False)
            try:
                model.load_state_dict(loaded_obj)
            except Exception as e:
                logger.warning(f"Failed to load as state_dict: {e}. Trying as full model.")
                model = loaded_obj
            logger.info("Successfully loaded model.pt")
        except FileNotFoundError:
            logger.warning("model.pt not found. Using randomly initialized weights for structural demonstration.")
        
        model.eval()
        return model
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return None

model = load_model()

# ImageNet normalization as requested
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.get("/")
def read_root():
    return {"status": "AI Server Online", "model": "EfficientNet-B0"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")
    
    try:
        # Read and open image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Preprocess
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0)
        
        # Inference
        with torch.no_grad():
            output = model(input_batch)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            
        # Get top prediction
        confidence, index = torch.max(probabilities, 0)
        class_idx = index.item()
        
        result = CLASS_MAP[class_idx]
        
        return {
            "diagnosis": result["name"],
            "id": result["id"],
            "confidence": float(confidence),
            "insight": result["insight"],
            "all_predictions": [
                {"name": CLASS_MAP[i]["name"], "confidence": float(probabilities[i])} 
                for i in range(len(CLASS_MAP))
            ]
        }
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
