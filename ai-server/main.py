import torch
import torch.nn as nn
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DermAssist AI Inference Server")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 7-class mapping matching the HAM10000 alphabetical sorting
CLASS_MAP = {
    0: {"name": "Actinic keratosis", "id": "akiec", "insight": "A precancerous skin lesion that may progress to squamous cell carcinoma."},
    1: {"name": "Basal cell carcinoma", "id": "bcc", "insight": "Common, slow-growing skin cancer. Rarely spreads but should be treated early."},
    2: {"name": "Benign keratosis-like lesions", "id": "bkl", "insight": "Non-cancerous skin growth, often appearing in older age."},
    3: {"name": "Dermatofibroma", "id": "df", "insight": "A common benign fibrous nodule, often on the legs."},
    4: {"name": "Melanocytic nevi", "id": "nv", "insight": "Commonly known as moles. Most are benign but should be monitored for changes."},
    5: {"name": "Vascular lesions", "id": "vasc", "insight": "Abnormalities of blood vessels in the skin, usually benign."},
    6: {"name": "Melanoma", "id": "mel", "insight": "The most serious type of skin cancer. Requires immediate medical attention."}
}

def load_model():
    try:
        # Build the empty DenseNet-121 shell
        model = models.densenet121(weights=None)
        
        # Modify the classifier for 7 classes
        num_ftrs = model.classifier.in_features
        model.classifier = nn.Linear(num_ftrs, 7)
        
        # Load your locally trained state_dict
        state_dict = torch.load("model.pt", map_location=torch.device('cpu'), weights_only=True)
        model.load_state_dict(state_dict)
        
        model.eval()
        logger.info("Successfully loaded local DenseNet-121 model.pt")
        return model
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return None

model = load_model()

# Mathematical Normalization specific to the HAM10000 dataset
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.49139968, 0.48215827, 0.44653124], 
                         std=[0.24703233, 0.24348505, 0.26158768]),
])

@app.get("/")
def read_root():
    return {"status": "AI Server Online", "model": "DenseNet-121"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file. Please upload an image.")
    
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0)
        
        with torch.no_grad():
            output = model(input_batch)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            
        confidence, index = torch.max(probabilities, 0)
        class_idx = index.item()
        confidence_score = float(confidence)
        
        # Threshold to catch random non-skin images
        if confidence_score < 0.40:
            return {
                "diagnosis": "Uncertain / Unrecognized",
                "id": "unknown",
                "confidence": confidence_score,
                "insight": "The model is not confident enough. Please upload a clearer clinical image.",
                "all_predictions": []
            }
            
        result = CLASS_MAP[class_idx]
        
        return {
            "diagnosis": result["name"],
            "id": result["id"],
            "confidence": confidence_score,
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