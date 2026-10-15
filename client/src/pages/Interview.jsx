import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiClock, HiMicrophone } from 'react-icons/hi';
import { FaSignal } from 'react-icons/fa';
import { useInterview } from '../hooks/useInterview';
import axios from 'axios';
import VideoStage from "../components/VideoStage";


const Interview = () => {
  const navigate = useNavigate();
  const [isEnding, setIsEnding] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isFinalizingRef = useRef(false);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    downlink: null,
  });

  useEffect(() => {
    let isMounted = true;
    let checkInProgress = false;

    const checkConnection = async () => {
      if (checkInProgress) return;
      checkInProgress = true;

      if (!navigator.onLine) {
        if (isMounted) {
          setNetworkStatus({
            isOnline: false,
            downlink: null,
          });
        }
        checkInProgress = false;
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        try {
          const response = await fetch(
            "http://localhost:8000/health",
            {
              method: "GET",
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (isMounted) {
            setNetworkStatus({
              isOnline: response.ok,
              downlink: null,
            });
          }
        } finally {
          clearTimeout(timeout);
        }
      } catch {
        if (isMounted) {
          setNetworkStatus({
            isOnline: false,
            downlink: null,
          });
        }
      } finally {
        checkInProgress = false;
      }
    };

    checkConnection();

    const interval = setInterval(checkConnection, 5000);

    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
    };
  }, []);

  const { 
    videoRef, 
    countdown, 
    isSetupPhase, 
    isMicOn, 
    setIsMicOn, 
    transcript, 
    currentQuestion, 
    isAiProcessing,
    isAiSpeaking ,
    isSessionEnded
  } = useInterview(5);

  const isWaitingForQuestion = !currentQuestion;
  const networkLabel = !networkStatus.isOnline
    ? 'Offline'
    : networkStatus.downlink === null
      ? 'Online'
      : `${networkStatus.downlink.toFixed(1)} Mbps`;
  const formattedElapsedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (isSetupPhase || isSessionEnded) return undefined;

    const timer = window.setInterval(() => {
      setElapsedSeconds(seconds => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSetupPhase, isSessionEnded]);

  /**
   * AUTO FULLSCREEN — starts after setup ends
   */
  
  /**
   * END SESSION
   */
  const handleEndSession = useCallback(async () => {
    if (isFinalizingRef.current) return;

    isFinalizingRef.current = true;
    setIsEnding(true);

    try {
      const interviewId = localStorage.getItem('interviewId');
      if (interviewId) {
        await axios.post("http://localhost:8000/ai/analyze-interview", {
          interviewId
        });
      }
    } catch (err) {
      console.error("Interview analysis failed", err);
    } finally {
      localStorage.removeItem('currentQuestion');
      localStorage.removeItem('interviewDeadline');
      setIsEnding(false);
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const storedDeadline = localStorage.getItem('interviewDeadline');
    if (!storedDeadline) return undefined;

    const deadlineAt = new Date(storedDeadline);
    const timeUntilDeadline = deadlineAt.getTime() - Date.now();

    if (Number.isNaN(deadlineAt.getTime())) return undefined;

    const deadlineTimer = window.setTimeout(
      handleEndSession,
      Math.max(timeUntilDeadline, 0)
    );

    return () => window.clearTimeout(deadlineTimer);
  }, [handleEndSession]);

  useEffect(() => {
    if (isSessionEnded) handleEndSession();
  }, [isSessionEnded, handleEndSession]);

  return (
    <section className="h-[calc(100vh-100px)] p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* QUESTION SIDEBAR */}
      <div className="lg:col-span-1">
        {!isSetupPhase && !isWaitingForQuestion && (
          <div className="bg-white/80 dark:bg-white/5 border-l-4 border-purple-500 p-6 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              {isAiProcessing ? "AI Analyzing..." : "Current Question"}
            </span>
            <p className={`mt-4 text-lg text-slate-900 dark:text-white transition-opacity ${
              isAiProcessing || isAiSpeaking ? 'opacity-40' : 'opacity-100'
            }`}>
              {currentQuestion}
            </p>
          </div>
        )}
      </div>

      {/* MAIN STAGE */}
      <div className="lg:col-span-3 rounded-[3rem] relative overflow-hidden bg-neutral-950 flex items-center justify-center border border-white/5 shadow-2xl">

        {/* VIDEO */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover scale-x-[-1]" 
        />

        {/* NETWORK SPEED */}
        <div
          className={`absolute top-6 right-6 z-30 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md ${
            networkStatus.isOnline
              ? 'bg-black/60 text-emerald-300'
              : 'bg-red-950/80 text-red-300'
          }`}
          role="status"
          aria-label={`Network status: ${networkLabel}`}
          title={networkStatus.isOnline
            ? 'Connected to the interview server'
            : 'Unable to reach the interview server'}
        >
          <FaSignal aria-hidden="true" />
          <span>{networkLabel}</span>
        </div>

        {/* SESSION TIMER */}
        {!isSetupPhase && (
          <div
            className="absolute top-6 left-6 z-30 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"
            role="timer"
            aria-label={`Interview elapsed time: ${formattedElapsedTime}`}
          >
            <HiClock aria-hidden="true" className="text-purple-300" />
            <span>{formattedElapsedTime}</span>
          </div>
        )}

        {/* WAITING FOR FIRST QUESTION */}
        {isWaitingForQuestion && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-6"></div>
            <p className="text-lg font-semibold">AI is preparing your first question...</p>
          </div>
        )}

        {/* SETUP COUNTDOWN */}
        {isSetupPhase && !isWaitingForQuestion && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
            <h2 className="text-2xl text-gray-400 mb-2 uppercase tracking-widest">Get Ready</h2>
            <div className="text-9xl font-black text-purple-500 animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* TRANSCRIPT / AI STATUS */}
        {!isSetupPhase && !isWaitingForQuestion && (
          <div className="absolute bottom-32 px-10 w-full text-center z-20">
            <div className="inline-block bg-white/85 text-slate-900 dark:bg-black/60 dark:text-white px-6 py-3 rounded-2xl">
              {isAiProcessing
                ? "AI Evaluating..."
                : isAiSpeaking
                  ? "AI Speaking..."
                  : transcript || "Listening..."}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="absolute bottom-8 flex items-center gap-6 z-30">
          <button 
            disabled={isWaitingForQuestion || isSetupPhase || isAiProcessing || isAiSpeaking}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isMicOn ? 'bg-purple-600' : 'bg-red-500'
            }`}
          >
            <HiMicrophone className="text-2xl text-white" />
          </button>

          <button 
            onClick={handleEndSession}
            disabled={isEnding || isSetupPhase}
            className="px-10 py-4 bg-white/80 text-slate-900 dark:bg-white/10 dark:text-white rounded-full text-xs"
          >
            {isEnding ? "Finalizing..." : "End Session"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;
