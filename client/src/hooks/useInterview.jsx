import { useState, useEffect, useRef } from 'react';

export const useInterview = (initialCountdown = 10) => {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // States
  const [countdown, setCountdown] = useState(initialCountdown);
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState(""); // Interim live text
  const [fullResponse, setFullResponse] = useState(""); // Final text for backend

  // --- Camera Logic ---
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- Countdown Logic ---
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsSetupPhase(false);
    }
  }, [countdown]);

  // --- Speech Recognition Logic ---
  useEffect(() => {
    if (isSetupPhase) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            setFullResponse(prev => prev + " " + result[0].transcript);
          } else {
            interimText += result[0].transcript;
          }
        }
        setTranscript(interimText);
      };
    }

    if (isMicOn) {
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
    }

    return () => recognitionRef.current?.stop();
  }, [isSetupPhase, isMicOn]);

  return {
    videoRef,
    countdown,
    isSetupPhase,
    isMicOn,
    setIsMicOn,
    transcript,
    fullResponse,
  };
};