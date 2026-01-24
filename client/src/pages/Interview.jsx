import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMicrophone } from 'react-icons/hi';
import { useInterview } from '../hooks/useInterview';
import axios from 'axios';

const Interview = () => {
  const navigate = useNavigate();
  const [isEnding, setIsEnding] = useState(false);

  const { 
    videoRef, 
    countdown, 
    isSetupPhase, 
    isMicOn, 
    setIsMicOn, 
    transcript, 
    currentQuestion, 
    isAiProcessing,
    isAiSpeaking 
  } = useInterview(5);

  const isWaitingForQuestion = !currentQuestion;

  /**
   * AUTO FULLSCREEN — starts after setup ends
   */
  useEffect(() => {
    if (!isSetupPhase && !isEnding) {
      const enterFullscreen = async () => {
        try {
          const el = document.documentElement;
          if (el.requestFullscreen) await el.requestFullscreen();
        } catch (err) {
          console.warn("Fullscreen blocked by browser", err);
        }
      };
      enterFullscreen();
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isSetupPhase, isEnding]);

  /**
   * END SESSION
   */
  const handleEndSession = async () => {
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
      setIsEnding(false);
      navigate('/dashboard');
    }
  };

  return (
    <section className="h-[calc(100vh-100px)] p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* QUESTION SIDEBAR */}
      <div className="lg:col-span-1">
        {!isSetupPhase && !isWaitingForQuestion && (
          <div className="bg-white/5 border-l-4 border-purple-500 p-6 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              {isAiProcessing ? "AI Analyzing..." : "Current Question"}
            </span>
            <p className={`mt-4 text-lg text-white transition-opacity ${
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
            <div className="inline-block bg-black/60 px-6 py-3 rounded-2xl">
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
            className="px-10 py-4 bg-white/10 rounded-full text-xs text-white"
          >
            {isEnding ? "Finalizing..." : "End Session"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;
