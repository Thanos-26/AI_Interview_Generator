import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data"; // Ensure this is installed: npm install form-data

const router = express.Router();
const upload = multer();

// Helper to calculate averages safely
const avg = (...vals) => {
    const validVals = vals.filter(v => v !== undefined);
    if (validVals.length === 0) return 0;
    return Math.round((validVals.reduce((a, b) => a + b, 0) / validVals.length) * 100);
};

/**
 * Advanced Emotion Processor v2.0
 * Uses Peak-Dominance and Inhibitor logic instead of simple averaging.
 */
function computeMetrics(emotions) {
    const e = {};
    emotions.forEach(x => e[x.name.toLowerCase()] = x.score);

    // Helper: Non-linear scaling (emphasizes strong signals)
    const powerScale = (val, p = 1.2) => Math.pow(val || 0, p);

    // Helper: Peak detector
    const getMax = (...keys) => Math.max(...keys.map(k => e[k] || 0));

    // 1. TENSION: Focused on the "Stress Peak"
    // We take the max stressor and scale it up. 
    const stressPeak = getMax('anxiety', 'fear', 'distress', 'horror');
    const tension = Math.round(powerScale(stressPeak, 1.3) * 100);

    // 2. FOCUS: Concentration minus the "Confusion/Distraction" noise
    const rawFocus = e.concentration || 0;
    const focusInhibitors = getMax('confusion', 'distraction', 'awkwardness');
    const focus = Math.round(Math.max(0, rawFocus - (focusInhibitors * 0.5)) * 100);

    // 3. ENGAGEMENT: Interest & Awe, but killed by Boredom
    const positiveArousal = getMax('interest', 'excitement', 'entrancement', 'awe');
    const boredomInhibitor = e.boredom || 0;
    const engagement = Math.round((positiveArousal * (1 - boredomInhibitor)) * 100);

    // 4. CONFIDENCE: Strength vs. Social Vulnerability
    const strength = getMax('pride', 'determination', 'triumph', 'calmness');
    const vulnerability = getMax('doubt', 'shame', 'awkwardness', 'embarrassment');
    const confidence = Math.round(Math.max(0, strength - (vulnerability * 0.6)) * 100);

    // 5. FATIGUE: Linear progression of tiredness and boredom
    const fatigue = Math.round(getMax('tiredness', 'boredom') * 100);

    // 6. VALENCE (Mood): The "Golden Metric" for Positivity
    const positiveCluster = (e.joy || 0) + (e.satisfaction || 0) + (e.contentment || 0);
    const negativeCluster = (e.sadness || 0) + (e.anger || 0) + (e.disgust || 0);
    const mood = Math.round(50 + (positiveCluster - negativeCluster) * 50); // 50 is neutral

    return {
        tension,
        focus,
        engagement,
        confidence,
        fatigue,
        mood,
        primary_state: emotions.sort((a, b) => b.score - a.score)[0].name
    };
}

router.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) return res.status(400).json({ error: "No image uploaded" });

        // 1. Prepare Multipart Form Data
        const form = new FormData();
        form.append("file", req.file.buffer, {
            filename: req.file.originalname || "image.jpg",
            contentType: req.file.mimetype,
        });

        // The 'json' field contains the model configuration
        form.append("json", JSON.stringify({
            models: { face: {} }
        }));

        // 2. Start Job
        const startResponse = await axios.post(
            "https://api.hume.ai/v0/batch/jobs",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "X-Hume-Api-Key": process.env.HUME_API_KEY,
                },
            }
        );

        const jobId = startResponse.data.job_id;

        // 3. Poll for Completion
        let isCompleted = false;
        let attempts = 0;
        const maxAttempts = 15;

        while (!isCompleted && attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2000));

            const jobStatus = await axios.get(
                `https://api.hume.ai/v0/batch/jobs/${jobId}`,
                { headers: { "X-Hume-Api-Key": process.env.HUME_API_KEY } }
            );

            const status = jobStatus.data.state.status;
            if (status === "COMPLETED") {
                isCompleted = true;
            } else if (status === "FAILED") {
                throw new Error("Hume job processing failed");
            }
            attempts++;
        }

        if (!isCompleted) return res.status(504).json({ error: "Hume analysis timed out" });

        // 4. Retrieve Predictions
        const predictionsResponse = await axios.get(
            `https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`,
            { headers: { "X-Hume-Api-Key": process.env.HUME_API_KEY } }
        );

        // Deep drill into the result object
        // Path: [File] -> results -> predictions -> [Model] -> grouped_predictions -> [Face] -> predictions -> [Frame] -> emotions
        const emotions =
            predictionsResponse.data[0]?.results?.predictions[0]?.models?.face?.grouped_predictions[0]?.predictions[0]?.emotions;

        if (!emotions) {
            return res.status(404).json({ error: "No face detected in the image" });
        }

        res.json(computeMetrics(emotions));

    } catch (err) {
        console.error("Hume error:", err.response?.data || err.message);
        res.status(500).json({ error: "Emotion analysis failed" });
    }
});

export default router;