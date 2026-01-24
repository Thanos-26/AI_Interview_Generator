import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMicrophone } from 'react-icons/hi';
import { useInterview } from '../hooks/useInterview';

const Interview = () => {
  const navigate = useNavigate();
  const { 
    videoRef, countdown, isSetupPhase, isMicOn, 
    setIsMicOn, transcript, currentQuestion, isAiProcessing 
  } = useInterview(10);

  return (
    <section className="h-[calc(100vh-100px)] p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: Dynamic Question Display */}
      <div className="lg:col-span-1">
        {!isSetupPhase && (
          <div className="bg-white/5 border-l-4 border-purple-500 p-6 rounded-2xl animate-in fade-in transition-all">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Question</span>
            <p className={`mt-4 text-lg font-medium text-white ${isAiProcessing ? 'opacity-40' : 'opacity-100'}`}>
              {currentQuestion || "Please wait..."}
            </p>
          </div>
        )}
      </div>

      {/* Main Video Section */}
      <div className="lg:col-span-3 rounded-[2.5rem] relative overflow-hidden bg-neutral-900 flex items-center justify-center border-2 border-purple-500/20 shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
        
        {/* Initialization Overlay */}
        {isSetupPhase && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <h2 className="text-3xl font-bold text-white mb-2">Final Setup</h2>
            <div className="text-8xl font-black text-purple-500 animate-pulse">{countdown}</div>
          </div>
        )}

        {/* Live Transcript & Processing Status */}
        {!isSetupPhase && (
          <div className="absolute bottom-32 px-10 w-full text-center z-20">
            <div className={`inline-block bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border transition-all ${isAiProcessing ? 'border-purple-500' : 'border-white/10'}`}>
              {isAiProcessing ? (
                <div className="flex items-center gap-3">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  </span>
                  <p className="text-purple-300 text-sm font-bold uppercase tracking-widest">Analyzing Answer</p>
                </div>
              ) : (
                <p className="text-white text-lg">{transcript || "Listening..."}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="absolute bottom-8 flex items-center gap-6 z-30">
          <button 
            disabled={isSetupPhase || isAiProcessing}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isSetupPhase || isAiProcessing ? 'bg-neutral-800' : isMicOn ? 'bg-purple-600 animate-pulse' : 'bg-red-500'
            }`}
          >
            <HiMicrophone className="text-2xl text-white" />
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-red-400 hover:bg-red-500/20 border border-white/10 uppercase tracking-widest"
          >
            End Session
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;