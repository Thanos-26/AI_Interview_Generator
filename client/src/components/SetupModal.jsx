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
  "Web Developer",
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

  const handleStart = async () => {
    setIsLoading(true);

    // ✅ FULLSCREEN (user gesture → browser safe)
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen blocked:", e);
    }

    const userId = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("userId", userId);

    try {
      const res = await axios.post("http://localhost:8000/ai/start-interview", {
        role,
        experience,
        type
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      localStorage.setItem("interviewId", res.data.interviewId);
      localStorage.setItem("currentQuestion", res.data.question);
      localStorage.setItem("interviewDeadline", res.data.deadlineAt);

      setIsConfigOpen(false);
      navigate("/interview");
    } catch (err) {
      console.error("Start interview failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-bg text-[#E6E1D8]">
        <div className="h-px w-28 bg-white/20"><div className="h-px w-1/2 bg-[#C6D0E8]" /></div>
        <p className="mt-5 text-sm">Preparing your interview</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg border border-rule bg-white p-7 shadow-sm dark:border-white/15 dark:bg-[#16191F]">

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-3xl font-medium">Interview Setup</h2>
          <button onClick={() => setIsConfigOpen(false)} className="border border-rule p-1 text-lg dark:border-white/15">
            <IoClose />
          </button>
        </div>

        {/* ROLE */}
        <div className="mb-4 relative">
          <label className="text-sm text-muted">Target role</label>
          <input
            value={role}
            onChange={e => {
              setRole(e.target.value);
              setShowRoles(true);
            }}
            onFocus={() => setShowRoles(true)}
            className="mt-1.5 w-full border border-rule bg-transparent p-3 text-sm outline-none focus:border-accent dark:border-white/15"
            placeholder="Enter your role"
          />

          {showRoles && role && (
            <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto border border-rule bg-white dark:border-white/15 dark:bg-[#16191F]">
              {filteredRoles.map(r => (
                <div
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoles(false);
                  }}
                  className="cursor-pointer p-3 text-sm hover:bg-[#F3F1EB] dark:hover:bg-white/5"
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPERIENCE */}
        <div className="mb-4">
          <label className="text-sm text-muted">Experience</label>
          <div className="mt-1.5 flex border border-rule dark:border-white/15">
            {["Fresher", "Experienced"].map(e => (
              <button
                key={e}
                onClick={() => setExperience(e)}
                className={`flex-1 py-3 text-sm transition-colors ${
                  experience === e
                    ? "bg-accent text-white"
                    : "bg-transparent hover:bg-[#F3F1EB] dark:hover:bg-white/5"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* TYPE */}
        <div className="mb-6">
          <label className="text-sm text-muted">Interview type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="mt-1.5 w-full border border-rule bg-transparent p-3 text-sm outline-none focus:border-accent dark:border-white/15"
          >
            <option>Technical</option>
            <option>HR</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={!role}
          className="w-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-[#283958] disabled:opacity-50"
        >
          Launch Interview
        </button>
      </div>
    </div>
  );
};

export default SetupModal;
