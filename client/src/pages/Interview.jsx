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
          <div className="border-l border-accent bg-white p-6 dark:bg-white/5">
            <span className="text-[10px] uppercase tracking-[.14em] text-muted">
              {isAiProcessing ? "AI Analyzing..." : "Question"}
            </span>
            <p className={`mt-4 font-serif text-xl text-ink transition-opacity dark:text-[#E6E1D8] ${
              isAiProcessing || isAiSpeaking ? 'opacity-40' : 'opacity-100'
            }`}>
              {currentQuestion}
            </p>
          </div>
        )}
      </div>

      {/* MAIN STAGE */}
      <div className="relative flex items-center justify-center overflow-hidden border border-white/15 bg-dark-bg lg:col-span-3">

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
          className={`absolute right-4 top-4 z-30 flex items-center gap-2 border border-white/20 px-3 py-1.5 text-xs ${
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
            className="absolute left-4 top-4 z-30 flex items-center gap-2 border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white"
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
            <div className="mb-6 h-px w-20 bg-white/30"><div className="h-px w-1/2 bg-white" /></div>
            <p className="text-lg font-semibold">AI is preparing your first question...</p>
          </div>
        )}

        {/* SETUP COUNTDOWN */}
        {isSetupPhase && !isWaitingForQuestion && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
            <h2 className="text-2xl text-gray-400 mb-2 uppercase tracking-widest">Get Ready</h2>
            <div className="font-serif text-9xl font-light text-white">
              {countdown}
            </div>
          </div>
        )}

        {/* TRANSCRIPT / AI STATUS */}
        {!isSetupPhase && !isWaitingForQuestion && (
          <div className="absolute bottom-32 px-10 w-full text-center z-20">
            <div className="inline-block border border-white/20 bg-black/70 px-5 py-2 text-sm text-white">
              {isAiProcessing
                ? "AI Evaluating..."
                : isAiSpeaking
                  ? "AI Speaking..."
                  : transcript || "Listening..."}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="absolute bottom-8 z-30 flex items-center gap-4">
          <button 
            disabled={isWaitingForQuestion || isSetupPhase || isAiProcessing || isAiSpeaking}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors ${
              isMicOn ? 'bg-white text-ink' : 'bg-[#6B1E2E] text-white'
            }`}
          >
            <HiMicrophone className="text-lg" /><span>{isMicOn ? 'Mic on' : 'Mic off'}</span>
          </button>

          <button 
            onClick={handleEndSession}
            disabled={isEnding || isSetupPhase}
            className="border border-white/40 px-5 py-3 text-xs text-white transition-colors hover:bg-white/10"
          >
            {isEnding ? "Finalizing..." : "End Session"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;
