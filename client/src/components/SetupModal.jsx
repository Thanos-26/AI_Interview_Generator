// import { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';
// import { IoClose } from 'react-icons/io5';

// const SetupModal = () => {
//   const { isConfigOpen, setIsConfigOpen } = useContext(AppContext);
//   const navigate = useNavigate();

//   if (!isConfigOpen) return null;

//   const handleStart = () => {
//     setIsConfigOpen(false);
//     navigate('/interview');
//   };

//   return (
//     <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//       <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 rounded-[2.5rem] border border-gray-500/10 shadow-2xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">Interview Setup</h2>
//           <button onClick={() => setIsConfigOpen(false)} className="text-gray-500 hover:text-red-500 transition text-2xl">
//             <IoClose />
//           </button>
//         </div>


//         <div class="space-y-4">
//           <div>
//             <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Target Role</label>
//             <select
//               class="w-full bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 outline-none focus:border-purple-500">
//               <option>Software Engineer</option>
//               <option>Product Manager</option>
//               <option>Data Analyst</option>
//             </select>
//           </div>

//           <div>
//             <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Experience Level</label>
//             <div class="flex gap-2">
//               <button onclick="selectOption(this, 'exp')"
//                 class="exp-btn flex-1 py-3 glass rounded-xl text-xs font-bold border-purple-500 bg-purple-500/10">Fresher</button>
//               <button onclick="selectOption(this, 'exp')"
//                 class="exp-btn flex-1 py-3 glass rounded-xl text-xs font-bold hover:bg-purple-500/5">Experienced
//                 (2-5y)</button>
//             </div>
//           </div>

//           <div>
//             <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Interview Type</label>
//             <select
//               class="w-full bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 outline-none focus:border-purple-500">
//               <option>Technical Deep Dive</option>
//               <option>HR Round</option>
//               {/* <option>Behavioral Round</option> */}
//             </select>
//           </div>

//           <button onclick="startInterview()"
//             class="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-white shadow-lg mt-4">Launch
//             Interview Engine</button>
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

    const res = await axios.post("http://localhost:8000/ai/start-interview", {
      userId,
      role,
      experience,
      type
    });

    localStorage.setItem("interviewId", res.data.interviewId);

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
            onChange={e => {
              setRole(e.target.value);
              setShowRoles(true);
            }}
            onFocus={() => setShowRoles(true)}
            className="w-full p-4 rounded-xl bg-gray-100 dark:bg-neutral-800"
            placeholder="Search role (e.g. software...)"
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
                onClick={() => setExperience(e)}
                className={`flex-1 py-3 rounded-xl glass ${
                  experience === e
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-neutral-700"
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
