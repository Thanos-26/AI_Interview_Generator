import React, { forwardRef, useEffect } from "react";
import axios from "axios";

const VideoStage = forwardRef(({ mirrored = true }, videoRef) => {

    useEffect(() => {
        let timeoutId;

        const captureAndAnalyze = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                    // 1. Create a hidden canvas to grab the frame
                    const canvas = document.createElement("canvas");
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    
                    const ctx = canvas.getContext("2d");
                    // Mirror the canvas if the video is mirrored
                    if (mirrored) {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    ctx.drawImage(videoRef.current, 0, 0);

                    // 2. Convert canvas to Blob
                    canvas.toBlob(async (blob) => {
                        if (!blob) return;

                        const formData = new FormData();
                        formData.append("image", blob, "capture.jpg");

                        // 3. Send to your Express backend
                        const response = await axios.post("/api/analyze", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                        });

                        console.log("Emotion Metrics:", response.data);
                    }, "image/jpeg", 0.8);

                } catch (error) {
                    console.error("Capture failed:", error);
                }
            }

            // 4. Schedule next "random" capture (between 5 and 15 seconds)
            const randomDelay = Math.floor(Math.random() * (15000 - 5000 + 1) + 5000);
            timeoutId = setTimeout(captureAndAnalyze, randomDelay);
        };

        // Start the cycle
        captureAndAnalyze();

        return () => {
            clearTimeout(timeoutId);
            if (videoRef?.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        };
    }, [mirrored]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${mirrored ? "scale-x-[-1]" : ""}`}
        />
    );
});

export default VideoStage;