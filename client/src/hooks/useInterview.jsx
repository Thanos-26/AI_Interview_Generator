import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useInterview = (initialCountdown = 10) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isMicInitializing = useRef(false);

  const [countdown, setCountdown] = useState(initialCountdown);
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(localStorage.getItem('currentQuestion') || "");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false); // Lock state

  // --- 1. Hardware Initialization ---
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Camera access denied", err); }
    }
    startMedia();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- 2. Text-to-Speech Engine ---
  const speakQuestion = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Using a professional voice index if available
    if (voices.length > 5) utterance.voice = voices[5]; 
    
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };
  useEffect(() => {
  if (isSetupPhase) return;
  
  // Logic to prevent the mic from being active while AI is speaking index 5
  if (isMicOn && !isAiProcessing && !isAiSpeaking) {
    startMicSafely();
  } else {
    stopMicSafely();
  }
}, [isMicOn, isAiProcessing, isAiSpeaking, isSetupPhase]);

  // --- 3. Initial Trigger ---
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsSetupPhase(false);
      if (currentQuestion) speakQuestion(currentQuestion);
    }
  }, [countdown]);

  // --- 4. Speech Recognition Orchestration ---
  useEffect(() => {
    if (isSetupPhase) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !recognitionRef.current) return;

    // Mic only starts if: ON, AI not thinking, AI not speaking
    if (isMicOn && !isAiProcessing && !isAiSpeaking) {
      startMicSafely();
    } else {
      stopMicSafely();
    }
  }, [isMicOn, isAiProcessing, isAiSpeaking, isSetupPhase]);

  // (Helper methods startMicSafely and stopMicSafely remain similar to your provided code)
  const startMicSafely = () => {
    if (recognitionRef.current && !isMicInitializing.current) {
      try {
        isMicInitializing.current = true;
        recognitionRef.current.start();
      } catch (e) { isMicInitializing.current = false; }
    }
  };

  const stopMicSafely = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); isMicInitializing.current = false; } catch (e) {}
    }
  };

  // --- 5. Recognition Setup ---
  useEffect(() => {
    if (isSetupPhase) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimText += event.results[i][0].transcript;
        }
        setTranscript(interimText);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (interimText.trim().length > 3) sendAnswerToAI(interimText);
        }, 3000);
      };
      recognitionRef.current.onend = () => {
        if (isMicOn && !isAiProcessing && !isAiSpeaking) startMicSafely();
      };
    }
  }, [isSetupPhase, isAiSpeaking]);

  const sendAnswerToAI = async (answerText) => {
    const interviewId = localStorage.getItem('interviewId');
    if (!answerText.trim() || isAiProcessing || !interviewId) return;
    
    setIsAiProcessing(true);
    stopMicSafely();

    try {
      const res = await axios.post("http://localhost:8000/ai/next-question", { interviewId, answer: answerText });
      setCurrentQuestion(res.data.question);
      localStorage.setItem('currentQuestion', res.data.question);
      setTranscript("");
      speakQuestion(res.data.question); // Speak the new question
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return {
    videoRef, countdown, isSetupPhase, isMicOn,
    setIsMicOn, transcript, currentQuestion, isAiProcessing, isAiSpeaking
  };
};