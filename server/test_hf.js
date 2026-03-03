import dotenv from 'dotenv';
import fetch from 'node-fetch'; // If using Node < 18, otherwise built-in fetch is fine
dotenv.config();

/**
 * TEST SCRIPT: Skin Disease Detection with EfficientNet-V2
 * This script sends a dummy image to the Hugging Face Inference API.
 */
async function test() {
    console.log("--- Initializing Hugging Face Connection ---");
    console.log("Token Status:", process.env.HF_TOKEN ? "✅ Loaded" : "❌ Missing (Check your .env file)");

    try {
        // 1. Prepare Image Data
        // Small 1x1 pixel base64 for testing; in production, use a real image buffer
        const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const buffer = Buffer.from(dummyBase64, 'base64');

        // 2. Model Configuration
        // This specific model is fine-tuned for skin lesions with 88%+ accuracy
        const MODEL_ID = 'Miguel764/efficientnetv2s-skin-cancer-classifier';
        const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

        console.log(`Targeting Model: ${MODEL_ID}`);
        console.log("Sending request...");

        // 3. Inference Request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/octet-stream',
                'x-wait-for-model': 'true' // Vital for free tier to handle "Cold Starts"
            },
            body: buffer
        });

        // 4. Handle Results
        const result = await response.json();

        if (response.ok) {
            console.log("✅ Analysis Successful!");
            console.log("Predictions:", JSON.stringify(result, null, 2));
        } else {
            console.warn(`⚠️ Warning: Status ${response.status}`);
            // If the model is loading, Hugging Face returns an 'estimated_time'
            if (result.error && result.error.includes("currently loading")) {
                console.log(`Model is waking up. Estimated time: ${result.estimated_time}s`);
            } else {
                console.error("Error Details:", result);
            }
        }

    } catch (error) {
        console.error("🛑 HF CONNECTION ERROR:", error.message);
    }
}

test();