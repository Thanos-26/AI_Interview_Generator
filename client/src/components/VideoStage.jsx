import React, { forwardRef, useEffect } from "react";

const VideoStage = forwardRef(({ mirrored = true }, videoRef) => {
    useEffect(() => {
        return () => {
            // Clean up tracks on unmount
            if (videoRef?.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

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
