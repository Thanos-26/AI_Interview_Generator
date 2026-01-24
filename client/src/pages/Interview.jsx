import React, { useState, useEffect } from 'react'; // Added useEffect
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
  } = useInterview(10);

  /**
   * Automatic Fullscreen Logic
   * Triggers as soon as the setup countdown hits zero.
   */
  useEffect(() => {
    if (!isSetupPhase && !isEnding) {
      const enterFullScreen = async () => {
        try {
          const element = document.documentElement; // Targets the whole page
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if (element.webkitRequestFullscreen) { /* Safari support */
            await element.webkitRequestFullscreen();
          } else if (element.msRequestFullscreen) { /* IE11 support */
            await element.msRequestFullscreen();
          }
        } catch (err) {
          console.warn("Fullscreen blocked. Browsers require a user gesture (like the 'Launch' click) to allow this.", err);
        }
      };

      enterFullScreen();
    }

    // Cleanup: Exit fullscreen mode when the user leaves the page or ends the session
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
      }
    };
  }, [isSetupPhase, isEnding]);

  const handleEndSession = async () => {
    const interviewId = localStorage.getItem('interviewId');
    if (!interviewId) {
      navigate('/dashboard');
      return;
    }

    setIsEnding(true);
    try {
      await axios.post("http://localhost:8000/ai/analyze-interview", {
        interviewId
      });

      localStorage.removeItem('interviewId');
      localStorage.removeItem('currentQuestion');
      
    } catch (error) {
      console.error("Failed to finalize interview:", error);
    } finally {
      setIsEnding(false);
      navigate('/dashboard');
    }
  };

  return (
    <section className="h-[calc(100vh-100px)] p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* --- QUESTION SIDEBAR --- */}
      <div className="lg:col-span-1">
        {!isSetupPhase && (
          <div className="bg-white/5 border-l-4 border-purple-500 p-6 rounded-2xl animate-in fade-in transition-all backdrop-blur-md">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              {isAiProcessing ? "AI Analyzing..." : "Current Question"}
            </span>
            <p className={`mt-4 text-lg font-medium text-white transition-opacity duration-500 ${isAiProcessing || isAiSpeaking ? 'opacity-40' : 'opacity-100'}`}>
              {currentQuestion || "Preparing your challenge..."}
            </p>
          </div>
        )}
      </div>

      {/* --- MAIN STAGE (VIDEO & OVERLAYS) --- */}
      <div className="lg:col-span-3 rounded-[3rem] relative overflow-hidden bg-neutral-950 flex items-center justify-center border border-white/5 shadow-2xl">
        
        {/* Mirror Video Feed - Muted to prevent echo */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover scale-x-[-1]" 
        />
        
        {/* 1. SETUP OVERLAY: Initial 10s Countdown */}
        {isSetupPhase && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
            <h2 className="text-2xl font-light text-gray-400 mb-2 uppercase tracking-[0.4em]">Get Ready</h2>
            <div className="text-9xl font-black text-purple-500 animate-pulse drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              {countdown}
            </div>
          </div>
        )}

        {/* 2. TRANSCRIPT OVERLAY: Dynamic Status Feedback */}
        {!isSetupPhase && (
          <div className="absolute bottom-32 px-10 w-full text-center z-20 pointer-events-none">
            <div className={`inline-block bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border transition-all duration-300 ${
              (isAiProcessing || isAiSpeaking) ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/10'
            }`}>
              {isAiProcessing ? (
                <div className="flex items-center gap-3">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                  </span>
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-widest">Evaluating Answer</p>
                </div>
              ) : isAiSpeaking ? (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">AI is Speaking...</p>
                </div>
              ) : (
                <p className="text-white text-lg font-medium">
                  {transcript || <span className="text-gray-500 italic">Listening...</span>}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. INTERVIEW CONTROLS */}
        <div className="absolute bottom-8 flex items-center gap-6 z-30">
          <button 
            disabled={isSetupPhase || isAiProcessing || isAiSpeaking}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSetupPhase || isAiProcessing || isAiSpeaking 
                ? 'bg-neutral-800 text-gray-600 scale-95' 
                : isMicOn ? 'bg-purple-600 shadow-lg shadow-purple-500/40' : 'bg-red-500 shadow-lg shadow-red-500/20'
            }`}
          >
            <HiMicrophone className="text-2xl text-white" />
          </button>
          
          <button 
            onClick={handleEndSession}
            disabled={isEnding || isSetupPhase}
            className="px-10 py-4 bg-white/5 hover:bg-red-500/10 backdrop-blur-xl rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isEnding ? "Finalizing..." : "End Session"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;