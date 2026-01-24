import React, { useState } from 'react';
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

  const handleEndSession = async () => {
    setIsEnding(true);

    try {
      const interviewId = localStorage.getItem('interviewId');
      if (interviewId) {
        await axios.post("http://localhost:8000/ai/analyze-interview", {
          interviewId
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      // ✅ Exit fullscreen safely
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      localStorage.removeItem('interviewId');
      localStorage.removeItem('currentQuestion');
      setIsEnding(false);
      navigate('/dashboard');
    }
  };

  return (
    <section className="h-screen p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

      <div className="lg:col-span-1">
        {!isSetupPhase && !isWaitingForQuestion && (
          <div className="bg-white/5 border-l-4 border-purple-500 p-6 rounded-2xl">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              Current Question
            </span>
            <p className="mt-4 text-lg text-white">
              {currentQuestion}
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-3 rounded-[3rem] relative overflow-hidden bg-neutral-950 flex items-center justify-center border border-white/5 shadow-2xl">

        {/* VIDEO */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover scale-x-[-1]" 
        />

        {/* LOADING */}
        {isWaitingForQuestion && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-6"></div>
            <p className="text-lg font-semibold">AI is preparing your first question...</p>
          </div>
        )}

        {/* COUNTDOWN */}
        {isSetupPhase && !isWaitingForQuestion && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90">
            <h2 className="text-2xl text-gray-400 mb-2 uppercase tracking-widest">Get Ready</h2>
            <div className="text-9xl font-black text-purple-500">{countdown}</div>
          </div>
        )}

        {/* TRANSCRIPT */}
        {!isSetupPhase && !isWaitingForQuestion && (
          <div className="absolute bottom-32 px-10 w-full text-center z-20">
            <div className="inline-block bg-black/60 px-6 py-3 rounded-2xl">
              {isAiProcessing ? "AI Evaluating..." : transcript || "Listening..."}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="absolute bottom-8 flex items-center gap-6 z-30">
          <button 
            disabled={isWaitingForQuestion || isSetupPhase || isAiProcessing || isAiSpeaking}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isMicOn ? 'bg-purple-600' : 'bg-red-500'
            }`}
          >
            <HiMicrophone className="text-2xl text-white" />
          </button>

          <button 
            onClick={handleEndSession}
            disabled={isWaitingForQuestion || isEnding || isSetupPhase}
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
