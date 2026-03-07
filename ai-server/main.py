import torch
import torch.nn as nn
from torchvision import transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DermAssist AI Inference Server")

# 1. ADDED CORS: Crucial for connecting to your web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. UPDATED: 9-Class mapping matching the downloaded model.pt
CLASS_MAP = {
    0: {"name": "Acanthosis Nigricans", "id": "an", "insight": "Dark, velvety patches in body folds and creases."},
    1: {"name": "Acne", "id": "acne", "insight": "Common skin condition causing pimples and spots."},
    2: {"name": "Acne Scars", "id": "acne_scars", "insight": "Marks left behind after severe acne heals."},
    3: {"name": "Alopecia Areata", "id": "alopecia", "insight": "Sudden hair loss that starts with circular bald patches."},
    4: {"name": "Dry Skin", "id": "dry", "insight": "Flaky, rough, or peeling skin."},
    5: {"name": "Melasma", "id": "melasma", "insight": "Brown or blue-gray patches, often on the face."},
    6: {"name": "Oily Skin", "id": "oily", "insight": "Excess sebum production causing a shiny appearance."},
    7: {"name": "Vitiligo", "id": "vitiligo", "insight": "Loss of skin color in blotches."},
    8: {"name": "Warts", "id": "warts", "insight": "Small, fleshy bump on the skin caused by HPV."}
}

# 3. UPDATED: Simplified loading for a full model object
def load_model():
    try:
        # Added weights_only=False to prevent warning, though original snippet works too
        model = torch.load("model.pt", map_location=torch.device('cpu'), weights_only=False)
        model.eval()
        logger.info("Successfully loaded model.pt")
        return model
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return None

model = load_model()

# 4. UPDATED: Preprocessing to match the original author's exact methodology (512x512, no normalization)
preprocess = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
])

@app.get("/")
def read_root():
    return {"status": "AI Server Online", "classes_supported": 9}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")
    
    # 5. ADDED: File Type Validation
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file. Please upload an image.")
    
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
        confidence_score = float(confidence)
        
        # 6. ADDED: Confidence Thresholding
        if confidence_score < 0.40:
            return {
                "diagnosis": "Uncertain / Unrecognized",
                "id": "unknown",
                "confidence": confidence_score,
                "insight": "The model is not confident enough. Please upload a clearer image.",
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
