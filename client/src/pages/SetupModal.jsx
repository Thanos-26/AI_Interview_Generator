// import React, { useContext, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';
// import { IoClose } from 'react-icons/io5';

// const SetupModal = () => {
//   const { isConfigOpen, setIsConfigOpen } = useContext(AppContext);
//   const navigate = useNavigate();

//   // State to manage user selections
//   const [role, setRole] = useState('Software Engineer');
//   const [experience, setExperience] = useState('Fresher');
//   const [interviewType, setInterviewType] = useState('Technical Deep Dive');

//   if (!isConfigOpen) return null;

//   const handleStart = () => {
//     // You can console.log or pass these values to your state/backend here
//     console.log({ role, experience, interviewType });
    
//     setIsConfigOpen(false);
//     navigate('/interview');
//   };

//   return (
//     <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//       <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 rounded-[2.5rem] border border-gray-500/10 shadow-2xl">
        
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold dark:text-white">Interview Setup</h2>
//           <button 
//             onClick={() => setIsConfigOpen(false)} 
//             className="text-gray-500 hover:text-red-500 transition text-2xl"
//           >
//             <IoClose />
//           </button>
//         </div>

//         <div className="space-y-4">
//           {/* Target Role Selection */}
//           <div>
//             <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Target Role</label>
//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               className="w-full bg-gray-500/10 dark:text-white border border-gray-500/20 rounded-xl p-4 outline-none focus:border-purple-500 transition"
//             >
//               <option>Software Engineer</option>
//               <option>Product Manager</option>
//               <option>Data Analyst</option>
//             </select>
//           </div>

//           {/* Experience Level Toggle */}
//           <div>
//             <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Experience Level</label>
//             <div className="flex gap-2">
//               <button 
//                 onClick={() => setExperience('Fresher')}
//                 className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
//                   experience === 'Fresher' 
//                   ? 'border-purple-500 bg-purple-500/10 text-purple-500' 
//                   : 'border-gray-500/20 hover:bg-purple-500/5 dark:text-gray-300'
//                 }`}
//               >
//                 Fresher
//               </button>
//               <button 
//                 onClick={() => setExperience('Experienced')}
//                 className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
//                   experience === 'Experienced' 
//                   ? 'border-purple-500 bg-purple-500/10 text-purple-500' 
//                   : 'border-gray-500/20 hover:bg-purple-500/5 dark:text-gray-300'
//                 }`}
//               >
//                 Experienced (2-5y)
//               </button>
//             </div>
//           </div>

//           {/* Interview Type Selection */}
//           <div>
//             <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Interview Type</label>
//             <select
//               value={interviewType}
//               onChange={(e) => setInterviewType(e.target.value)}
//               className="w-full bg-gray-500/10 dark:text-white border border-gray-500/20 rounded-xl p-4 outline-none focus:border-purple-500 transition"
//             >
//               <option>Technical Deep Dive</option>
//               <option>HR & Culture Round</option>
//               <option>Behavioral Round</option>
//             </select>
//           </div>

//           {/* Launch Button */}
//           <button 
//             onClick={handleStart}
//             className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-white shadow-lg mt-4 hover:opacity-90 active:scale-[0.98] transition-all"
//           >
//             Launch Interview Engine
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SetupModal;


import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "Machine Learning Engineer"
];

const SetupModal = () => {
  const { isConfigOpen, setIsConfigOpen } = useContext(AppContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [type, setType] = useState("Technical");
  const [showRoles, setShowRoles] = useState(false);

  if (!isConfigOpen) return null;

  const filteredRoles = ROLES.filter(r =>
    r.toLowerCase().includes(role.toLowerCase())
  );

  const handleStart = async () => {
    const userId =
      localStorage.getItem("userId") ||
      Math.floor(100000 + Math.random() * 900000).toString();

    localStorage.setItem("userId", userId);

    const data = {
      userId,
      role,
      experience,
      type
    }
    console.log(data);

    const res = await axios.post("http://localhost:8000/ai/start-interview", {
      userId,
      role,
      experience,
      type
    });

    localStorage.setItem("interviewId", res.data.interviewId);
    localStorage.setItem("currentQuestion", res.data.firstQuestion);

    setIsConfigOpen(false);
    navigate("/interview");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Interview Setup</h2>
          <button onClick={() => setIsConfigOpen(false)} className="text-2xl">
            <IoClose />
          </button>
        </div>

        {/* ROLE SEARCH */}
        <div className="mb-4 relative">
          <label className="text-xs font-bold text-gray-400">Target Role</label>
          <input
            value={role}
            required
            onChange={e => {
              setRole(e.target.value);
              setShowRoles(true);
            }}
            onFocus={() => setShowRoles(true)}
            className="w-full p-4 rounded-xl bg-gray-100 dark:bg-neutral-800"
            placeholder="Enter your role : "
          />

          {showRoles && role && (
            <div className="absolute z-10 w-full bg-white dark:bg-neutral-800 mt-1 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {filteredRoles.map(r => (
                <div
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoles(false);
                  }}
                  className="p-3 hover:bg-purple-500/10 cursor-pointer"
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPERIENCE */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400">Experience</label>
          <div className="flex gap-2 mt-2">
            {["Fresher", "Experienced"].map(e => (
              <button



                key={e}

                //  onClick={() => setExperience('Experienced')}
                // className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
                //   experience === 'Experienced' 
                //   ? 'border-purple-500 bg-purple-500/10 text-purple-500' 
                //   : 'border-gray-500/20 hover:bg-purple-500/5 dark:text-gray-300'
                // }`}


                onClick={() => setExperience(e)}
                className={`flex-1 py-3 rounded-xl ${
                  experience === e
                    ? "border-purple-500 bg-purple-500/10 text-purple-500"
                    : "border-gray-500/20 hover:bg-purple-500/5 dark:text-gray-300"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* INTERVIEW TYPE */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400">Interview Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-100 dark:bg-neutral-800 mt-2"
          >
            <option>Technical</option>
            <option>HR</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={!role}
          className="w-full py-4 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white"
        >
          Launch Interview
        </button>
      </div>
    </div>
  );
};

export default SetupModal;
