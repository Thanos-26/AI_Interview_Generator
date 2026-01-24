// import { useState, useEffect, useRef } from "react";
// import axios from "axios";

// export const useInterview = (initialCountdown = 5) => {
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   const recognitionRef = useRef(null);
//   const silenceTimerRef = useRef(null);
//   const micLockRef = useRef(false);

//   const [countdown, setCountdown] = useState(initialCountdown);
//   const [isSetupPhase, setIsSetupPhase] = useState(true);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [transcript, setTranscript] = useState("");
//   const [currentQuestion, setCurrentQuestion] = useState(
//     localStorage.getItem("currentQuestion") || ""
//   );
//   const [isAiProcessing, setIsAiProcessing] = useState(false);
//   const [isAiSpeaking, setIsAiSpeaking] = useState(false);

//   /* CAMERA */
//   useEffect(() => {
//     const init = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       streamRef.current = stream;
//       if (videoRef.current) {
//   videoRef.current.srcObject = stream;
//   videoRef.current.onloadedmetadata = () => {
//     videoRef.current.play().catch(() => {});
//   };
// }

//     };
//     init();

//     return () => {
//       if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
//       window.speechSynthesis.cancel();
//     };
//   }, []);

//   /* COUNTDOWN */
//   useEffect(() => {
//     if (countdown > 0) {
//       const t = setTimeout(() => setCountdown(p => p - 1), 1000);
//       return () => clearTimeout(t);
//     }
//     setIsSetupPhase(false);
//   }, [countdown]);

//   /* SPEAK FIRST QUESTION */
//   useEffect(() => {
//     if (!isSetupPhase && currentQuestion) speak(currentQuestion);
//   }, [isSetupPhase, currentQuestion]);

//   const speak = text => {
//     stopMic();
//     const u = new SpeechSynthesisUtterance(text);
//     u.onstart = () => setIsAiSpeaking(true);
//     u.onend = () => {
//       setIsAiSpeaking(false);
//       if (isMicOn) startMic();
//     };
//     window.speechSynthesis.speak(u);
//   };

//   /* SPEECH RECOGNITION */
//   useEffect(() => {
//     if (isSetupPhase) return;
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) return;

//     if (!recognitionRef.current) {
//       const rec = new SR();
//       rec.continuous = true;
//       rec.interimResults = true;

//       rec.onresult = e => {
//         let text = "";
//         for (let i = e.resultIndex; i < e.results.length; i++) {
//           text += e.results[i][0].transcript;
//         }
//         setTranscript(text);

//         if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
//         silenceTimerRef.current = setTimeout(() => {
//           if (text.trim().length > 3) send(text);
//         }, 3000);
//       };

//       rec.onend = () => {
//         micLockRef.current = false;
//         // if (isMicOn && !isAiProcessing && !isAiSpeaking) startMic();
//       };

//       recognitionRef.current = rec;
//     }
//   }, [isSetupPhase, isMicOn, isAiProcessing, isAiSpeaking]);

//   const startMic = () => {
//     if (!recognitionRef.current || micLockRef.current) return;
//     try {
//       micLockRef.current = true;
//       recognitionRef.current.start();
//     } catch {}
//   };

//   const stopMic = () => {
//     if (!recognitionRef.current) return;
//     try {
//       recognitionRef.current.stop();
//       micLockRef.current = false;
//     } catch {}
//   };

//   useEffect(() => {
//     if (!isSetupPhase && isMicOn && !isAiProcessing && !isAiSpeaking) {
//       startMic();
//     } else {
//       stopMic();
//     }
//   }, [isMicOn, isAiProcessing, isAiSpeaking, isSetupPhase]);

//   const send = async answer => {
//     const interviewId = localStorage.getItem("interviewId");
//     if (!interviewId || isAiProcessing) return;

//     setIsAiProcessing(true);
//     stopMic();

//     try {
//       const res = await axios.post("http://localhost:8000/ai/next-question", {
//         interviewId,
//         answer
//       });

//       setCurrentQuestion(res.data.question);
//       localStorage.setItem("currentQuestion", res.data.question);
//       setTranscript("");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setIsAiProcessing(false);
//     }
//   };

//   return {
//     videoRef,
//     countdown,
//     isSetupPhase,
//     isMicOn,
//     setIsMicOn,
//     transcript,
//     currentQuestion,
//     isAiProcessing,
//     isAiSpeaking
//   };
// };

import { useState, useEffect, useRef } from "react";
import axios from "axios";

export const useInterview = (initialCountdown = 5) => {
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

  // ✅ ONLY NEW STATES (error handling)
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [sessionEndMessage, setSessionEndMessage] = useState("");

  /* CAMERA (UNCHANGED) */
  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
        };
      }
    };
    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  /* COUNTDOWN (UNCHANGED) */
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
    setIsSetupPhase(false);
  }, [countdown]);

  /* SPEAK FIRST QUESTION (UNCHANGED) */
  useEffect(() => {
    if (!isSetupPhase && currentQuestion) speak(currentQuestion);
  }, [isSetupPhase, currentQuestion]);

  const speak = text => {
    stopMic();
    const u = new SpeechSynthesisUtterance(text);
    u.onstart = () => setIsAiSpeaking(true);
    u.onend = () => {
      setIsAiSpeaking(false);
      if (isMicOn) startMic();
    };
    window.speechSynthesis.speak(u);
  };

  /* SPEECH RECOGNITION (UNCHANGED) */
  useEffect(() => {
    if (isSetupPhase) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (!recognitionRef.current) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = e => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setTranscript(text);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (text.trim().length > 3) send(text);
        }, 3000);
      };

      rec.onend = () => {
        micLockRef.current = false;
      };

      recognitionRef.current = rec;
    }
  }, [isSetupPhase, isMicOn, isAiProcessing, isAiSpeaking]);

  const startMic = () => {
    if (!recognitionRef.current || micLockRef.current) return;
    try {
      micLockRef.current = true;
      recognitionRef.current.start();
    } catch {}
  };

  const stopMic = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      micLockRef.current = false;
    } catch {}
  };

  /* MIC CONTROL (UNCHANGED) */
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

  /* ✅ ONLY MODIFIED PART — HANDLE SESSION END */
  const send = async answer => {
    const interviewId = localStorage.getItem("interviewId");
    if (!interviewId || isAiProcessing || isSessionEnded) return;

    setIsAiProcessing(true);
    stopMic();

    try {
      const res = await axios.post(
        "http://localhost:8000/ai/next-question",
        { interviewId, answer }
      );

      // ⛔ SESSION ENDED BY BACKEND
      if (res.data?.sessionEnded) {
        setIsSessionEnded(true);
        setSessionEndMessage(
          res.data.message || "Interview session ended"
        );
        window.speechSynthesis.cancel();
        stopMic();
        return;
      }

      // ✅ NORMAL FLOW
      setCurrentQuestion(res.data.question);
      localStorage.setItem("currentQuestion", res.data.question);
      setTranscript("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return {
    videoRef,
    countdown,
    isSetupPhase,
    isMicOn,
    setIsMicOn,
    transcript,
    currentQuestion,
    isAiProcessing,
    isAiSpeaking,

    // ✅ NEW (error handling only)
    isSessionEnded,
    sessionEndMessage
  };
};
