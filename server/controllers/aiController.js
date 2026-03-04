import Scan from '../models/Scan.js';

// AI_SERVER_URL from .env (e.g., http://localhost:8000)
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

/**
 * @desc    Analyze image using Local Python FastAPI Server
 * @route   POST /api/ai/analyze
 * @access  Private
 */
const analyzeImage = async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ message: 'No image provided for analysis.' });
    }

    try {
        // 1. Prepare the image for the FastAPI server
        // Extract base64 data
        const base64Data = imageBase64.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');

        // Use native FormData (available in Node 22)
        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('file', blob, 'image.jpg');

        // 2. Call the AI Server (Python FastAPI)
        const aiResponse = await fetch(`${AI_SERVER_URL}/predict`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`AI Server Error: ${errorText}`);
        }

        const aiResult = await aiResponse.json();

        // 3. Save to MongoDB as history
        const newScan = await Scan.create({
            user: req.user.id,
            imageUrl: imageBase64, // Storing base64 for history in this demo
            diagnosis: aiResult.diagnosis,
            confidence: aiResult.confidence,
        });

        // 4. Return the combined result to the client
        res.status(200).json({
            ...aiResult,
            scanId: newScan._id,
            savedToHistory: true
        });

    } catch (error) {
        console.error('Inference Bridge Error:', error);
        res.status(500).json({ message: 'Failed to connect to the AI engine.', error: error.message });
    }
};

export { analyzeImage };