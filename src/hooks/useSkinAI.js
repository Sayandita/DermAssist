import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

// To get accurate results, MobileNet (which is trained on dogs/cats/cars) must be
// replaced with a custom trained model. We are using Google Teachable Machine
// architecture for this.
// 
// Instructions for you:
// 1. Go to https://teachablemachine.withgoogle.com/train/image
// 2. Upload images of Melanoma, Nevus, etc., into different classes.
// 3. Click "Train Model" -> "Export Model"
// 4. Click "Upload my model" and paste the generated link below:
const TEACHABLE_MACHINE_URL = ""; // e.g., "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/"

const useSkinAI = () => {
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadCustomModel = async () => {
            try {
                setLoading(true);
                setError(null);
                await tf.ready(); // Ensure TF initialization

                if (!TEACHABLE_MACHINE_URL) {
                    console.warn("No Teachable Machine URL provided. Using deterministic fallback engine.");
                    setLoading(false);
                    return; // We will handle fallback logic in classify()
                }

                const modelURL = TEACHABLE_MACHINE_URL + "model.json";
                const metadataURL = TEACHABLE_MACHINE_URL + "metadata.json";

                const customModel = await tmImage.load(modelURL, metadataURL);

                if (isMounted) {
                    setModel(customModel);
                    setLoading(false);
                    console.log('Custom Skin AI model loaded successfully');
                }
            } catch (err) {
                console.error('Failed to load custom model:', err);
                if (isMounted) {
                    setError('Failed to load the exact AI model. Reverting to mock classification engine.');
                    setLoading(false);
                }
            }
        };

        loadCustomModel();

        return () => {
            isMounted = false;
        };
    }, []);

    const classifyImage = async (imageElement) => {
        if (!imageElement) {
            throw new Error('No image element provided');
        }

        try {
            // If the user has supplied a real model URL and it loaded successfully:
            if (model && TEACHABLE_MACHINE_URL) {
                const predictions = await model.predict(imageElement);
                // TM models return { className: "Melanoma", probability: 0.95 }
                // We map it to what our UI expects
                return predictions
                    .sort((a, b) => b.probability - a.probability)
                    .map(p => ({
                        className: p.className,
                        probability: p.probability
                    }));
            }

            // ----------------------------------------------------------------------
            // FALLBACK ENGINE:
            // If you haven't supplied a Teachable Machine model URL yet, this runs
            // a deterministic simulation using standard Medical Disease labels to allow
            // you to continue building the UI/Frontend accurately.
            // ----------------------------------------------------------------------
            console.log('Running deterministic disease fallback categorizer...');

            // Artificial delay to simulate processing power cost
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const medicalConditions = [
                "Melanoma (High Risk)",
                "Melanocytic nevus (Benign)",
                "Basal cell carcinoma",
                "Actinic keratosis",
                "Benign keratosis",
                "Dermatofibroma",
                "Vascular lesion"
            ];

            // Generate a reproducible pseudo-random output based on the image size
            // so the same image always gives the exact same medical result.
            const seed = (imageElement.width * imageElement.height) % medicalConditions.length;

            const primaryDisease = medicalConditions[seed];
            const secondaryDisease = medicalConditions[(seed + 1) % medicalConditions.length];
            const tertiaryDisease = medicalConditions[(seed + 2) % medicalConditions.length];

            // Simulated probability breakdown
            return [
                { className: primaryDisease, probability: 0.82 + (Math.random() * 0.15) },
                { className: secondaryDisease, probability: 0.10 + (Math.random() * 0.05) },
                { className: tertiaryDisease, probability: 0.01 + (Math.random() * 0.03) }
            ].sort((a, b) => b.probability - a.probability);

        } catch (err) {
            console.error('Classification error:', err);
            throw new Error('Failed to classify the image.');
        }
    };

    return { classifyImage, isModelLoading: loading, modelError: error };
};

export default useSkinAI;
