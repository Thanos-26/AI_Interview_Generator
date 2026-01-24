import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMicrophone } from 'react-icons/hi';
import { useInterview } from '../hooks/useInterview';

const Interview = () => {
  const navigate = useNavigate();
  const { 
    videoRef, 
    countdown, 
    isSetupPhase, 
    isMicOn, 
    setIsMicOn, 
    transcript, 
    fullResponse 
  } = useInterview(10); // Pass 10 seconds

  const handleEndSession = () => {
    // Send fullResponse to your backend here
    console.log("Sending to Backend:", fullResponse);
    navigate('/dashboard');
  };

  return (
    <section className="h-[calc(100vh-100px)] p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: Question */}
      <div className="lg:col-span-1">
        {!isSetupPhase && (
          <div className="bg-white/5 border-l-4 border-purple-500 p-6 rounded-2xl animate-in fade-in slide-in-from-left-4">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Question 01</span>
            <p className="mt-4 text-lg font-medium">{localStorage.getItem('currentQuestion')}</p>
          </div>
        )}
      </div>

      {/* Main Video Section */}
      <div className="lg:col-span-3 rounded-[2.5rem] relative overflow-hidden bg-neutral-900 flex items-center justify-center border-2 border-purple-500/20 shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
        
        {/* Countdown Overlay */}
        {isSetupPhase && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <h2 className="text-3xl font-bold text-white mb-2">Setting up your session</h2>
            <div className="text-8xl font-black text-purple-500">{countdown}</div>
          </div>
        )}

        {/* Live Subtitles */}
        {!isSetupPhase && isMicOn && (
          <div className="absolute bottom-32 px-10 w-full text-center z-20">
            <p className="text-white text-lg bg-black/50 backdrop-blur-md px-6 py-2 rounded-full inline-block">
              {transcript || "Listening..."}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 flex items-center gap-6 z-30">
          <button 
            disabled={isSetupPhase}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isSetupPhase ? 'bg-neutral-800' : isMicOn ? 'bg-purple-600 animate-pulse' : 'bg-red-500'
            }`}
          >
            <HiMicrophone className="text-2xl text-white" />
          </button>
          <button 
            onClick={handleEndSession}
            className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-red-400 hover:bg-red-500/20 border border-white/10"
          >
            End Session
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;