import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useInterview = (initialCountdown = 10) => {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isMicInitializing = useRef(false); // Safety flag

  const [countdown, setCountdown] = useState(initialCountdown);
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(localStorage.getItem('currentQuestion') || "");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // --- 1. Camera Initialization ---
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Camera access denied", err); }
    }
    startCamera();
  }, []);

  // --- 2. Countdown Timer ---
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsSetupPhase(false);
    }
  }, [countdown]);

  // --- 3. Speech Recognition Engine Setup ---
  useEffect(() => {
    if (isSetupPhase) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimText += event.results[i][0].transcript;
        }
        setTranscript(interimText);

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (interimText.trim().length > 3) {
            sendAnswerToAI(interimText);
          }
        }, 3000); 
      };

      recognitionRef.current.onstart = () => { isMicInitializing.current = false; };
      recognitionRef.current.onend = () => {
        isMicInitializing.current = false;
        // Auto-restart if mic is supposed to be on and AI isn't thinking
        if (isMicOn && !isAiProcessing && !isSetupPhase) {
          startMicSafely();
        }
      };
    }
  }, [isSetupPhase]);

  // --- 4. Safety Controls ---
  const startMicSafely = () => {
    if (recognitionRef.current && !isMicInitializing.current) {
      try {
        isMicInitializing.current = true;
        recognitionRef.current.start();
      } catch (e) {
        isMicInitializing.current = false;
        console.warn("Mic already active or failed to start.");
      }
    }
  };

  const stopMicSafely = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        isMicInitializing.current = false;
      } catch (e) { console.warn("Error stopping mic"); }
    }
  };

  // --- 5. Effect to handle Mic State Changes ---
  useEffect(() => {
    if (isSetupPhase) return;
    
    if (isMicOn && !isAiProcessing) {
      startMicSafely();
    } else {
      stopMicSafely();
    }
  }, [isMicOn, isAiProcessing, isSetupPhase]);

  // --- 6. API Communication ---
  const sendAnswerToAI = async (answerText) => {
    const interviewId = localStorage.getItem('interviewId');
    if (!answerText.trim() || isAiProcessing || !interviewId) return;
    
    setIsAiProcessing(true);
    stopMicSafely(); // Shut down mic while AI "talks"

    try {
      const res = await axios.post("http://localhost:8000/ai/next-question", {
        interviewId,
        answer: answerText
      });

      setCurrentQuestion(res.data.question);
      localStorage.setItem('currentQuestion', res.data.question);
      setTranscript(""); 
    } catch (err) {
      console.error("Database sync failed:", err);
    } finally {
      setIsAiProcessing(false);
      // useEffect #5 will handle restarting the mic automatically
    }
  };

  return {
    videoRef, countdown, isSetupPhase, isMicOn,
    setIsMicOn, transcript, currentQuestion, isAiProcessing
  };
};