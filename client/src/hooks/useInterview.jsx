import { useState, useEffect, useRef } from "react";
import axios from "axios";

export const useInterview = (initialCountdown = 10) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const micLockRef = useRef(false);

  const [countdown, setCountdown] = useState(initialCountdown);
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(
    localStorage.getItem("currentQuestion") || ""
  );
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  /* ===============================
     1. CAMERA & AUDIO INIT
  =============================== */
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera/Mic access denied", err);
      }
    };

    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  /* ===============================
     2. COUNTDOWN → INTERVIEW START
  =============================== */
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(
        () => setCountdown(prev => prev - 1),
        1000
      );
      return () => clearTimeout(timer);
    }

    setIsSetupPhase(false);
  }, [countdown]);

  /* ===============================
     3. SPEAK FIRST QUESTION (FIX)
  =============================== */
  useEffect(() => {
    if (!isSetupPhase && currentQuestion) {
      speakQuestion(currentQuestion);
    }
  }, [isSetupPhase, currentQuestion]);

  /* ===============================
     4. TEXT TO SPEECH
  =============================== */
  const speakQuestion = text => {
    if (!text) return;

    window.speechSynthesis.cancel();
    stopMic();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 5) utterance.voice = voices[5];

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => {
      setIsAiSpeaking(false);
      if (isMicOn) startMic();
    };
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  /* ===============================
     5. SPEECH RECOGNITION SETUP
  =============================== */
  useEffect(() => {
    if (isSetupPhase) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = event => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }

        setTranscript(text);

        if (silenceTimerRef.current)
          clearTimeout(silenceTimerRef.current);

        silenceTimerRef.current = setTimeout(() => {
          if (text.trim().length > 3) {
            sendAnswerToAI(text);
          }
        }, 3000);
      };

      recognition.onend = () => {
        micLockRef.current = false;
        if (isMicOn && !isAiProcessing && !isAiSpeaking) {
          startMic();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isSetupPhase, isAiProcessing, isAiSpeaking, isMicOn]);

  /* ===============================
     6. MIC CONTROL
  =============================== */
  const startMic = () => {
    if (!recognitionRef.current || micLockRef.current) return;
    try {
      micLockRef.current = true;
      recognitionRef.current.start();
    } catch {
      micLockRef.current = false;
    }
  };

  const stopMic = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      micLockRef.current = false;
    } catch {}
  };

  useEffect(() => {
    if (
      !isSetupPhase &&
      isMicOn &&
      !isAiProcessing &&
      !isAiSpeaking
    ) {
      startMic();
    } else {
      stopMic();
    }
  }, [isMicOn, isAiProcessing, isAiSpeaking, isSetupPhase]);

  /* ===============================
     7. SEND ANSWER → AI
  =============================== */
  const sendAnswerToAI = async answer => {
    const interviewId = localStorage.getItem("interviewId");
    if (!interviewId || isAiProcessing) return;

    setIsAiProcessing(true);
    stopMic();

    try {
      const res = await axios.post(
        "http://localhost:8000/ai/next-question",
        { interviewId, answer }
      );

      setCurrentQuestion(res.data.question);
      localStorage.setItem("currentQuestion", res.data.question);
      setTranscript("");
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  /* ===============================
     8. EXPOSE API
  =============================== */
  return {
    videoRef,
    countdown,
    isSetupPhase,
    isMicOn,
    setIsMicOn,
    transcript,
    currentQuestion,
    isAiProcessing,
    isAiSpeaking
  };
};
