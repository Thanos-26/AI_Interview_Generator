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
  "web developer",
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
  const [isLoading, setIsLoading] = useState(false);

  if (!isConfigOpen) return null;

  const filteredRoles = ROLES.filter(r =>
    r.toLowerCase().includes(role.toLowerCase())
  );

  // const handleStart = async () => {
  //   const userId =
  //     localStorage.getItem("userId") ||
  //     Math.floor(100000 + Math.random() * 900000).toString();

  //   localStorage.setItem("userId", userId);

  //   const data = {
  //     userId,
  //     role,
  //     experience,
  //     type
  //   }
  //   console.log(data);

  //   const res = await axios.post("http://localhost:8000/ai/start-interview", {
  //     userId,
  //     role,
  //     experience,
  //     type
  //   });

  //   localStorage.setItem("interviewId", res.data.interviewId);
  //   localStorage.setItem("currentQuestion", res.data.question);
  //   // console.log(res.data);
  //   setIsConfigOpen(false);
  //   navigate("/interview");
  // };
  const handleStart = async () => {
  setIsLoading(true);

  const userId =
    // localStorage.getItem("userId") ||
    Math.floor(100000 + Math.random() * 900000).toString();

  localStorage.setItem("userId", userId);

  const res = await axios.post("http://localhost:8000/ai/start-interview", {
    userId,
    role,
    experience,
    type
  });

  //const minDelay = new Promise(resolve => setTimeout(resolve, 5000));

  // const [res] = await Promise.all([apiCall, minDelay]);
  console.log(res)
  localStorage.setItem("interviewId", res.data.interviewId);
  localStorage.setItem("currentQuestion", res.data.question);

  setIsConfigOpen(false);
  setIsLoading(false);
  navigate("/interview");
};


  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-6"></div>
        <p className="text-lg font-semibold">Preparing your AI interviewer...</p>
      </div>
    );
  }

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
                onClick={() => setExperience(e)}
                className={`flex-1 py-3 rounded-xl ${experience === e
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
