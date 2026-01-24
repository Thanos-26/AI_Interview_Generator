import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMicrophone, HiCamera } from 'react-icons/hi';

const Interview = () => {
  const videoRef = useRef(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Camera access denied.");
      }
    }
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <section className="h-[calc(100vh-100px)] p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white/5 dark:bg-black/20 border-l-4 border-purple-500 p-6 rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-purple-400 uppercase">Question 01</span>
          <p className="mt-4 text-lg font-medium leading-relaxed">"Can you explain the difference between a load balancer and an API gateway?"</p>
        </div>
      </div>

      <div className="lg:col-span-3 rounded-[2.5rem] relative overflow-hidden bg-neutral-900 flex items-center justify-center border-2 border-purple-500/20 shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
        
        <div className="absolute bottom-8 flex items-center gap-6">
          <button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-purple-600 animate-pulse' : 'bg-red-500'}`}
          >
            <HiMicrophone className="text-2xl text-white" />
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-red-400 hover:bg-red-500/10 border border-white/10"
          >
            End Session
          </button>
        </div>
      </div>
    </section>
  );
};

export default Interview;