import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { IoClose } from 'react-icons/io5';

const SetupModal = () => {
  const { isConfigOpen, setIsConfigOpen } = useContext(AppContext);
  const navigate = useNavigate();

  if (!isConfigOpen) return null;

  const handleStart = () => {
    setIsConfigOpen(false);
    navigate('/interview');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 rounded-[2.5rem] border border-gray-500/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Interview Setup</h2>
          <button onClick={() => setIsConfigOpen(false)} className="text-gray-500 hover:text-red-500 transition text-2xl">
            <IoClose />
          </button>
        </div>


        <div class="space-y-4">
          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Target Role</label>
            <select
              class="w-full bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 outline-none focus:border-purple-500">
              <option>Software Engineer</option>
              <option>Product Manager</option>
              <option>Data Analyst</option>
            </select>
          </div>

          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Experience Level</label>
            <div class="flex gap-2">
              <button onclick="selectOption(this, 'exp')"
                class="exp-btn flex-1 py-3 glass rounded-xl text-xs font-bold border-purple-500 bg-purple-500/10">Fresher</button>
              <button onclick="selectOption(this, 'exp')"
                class="exp-btn flex-1 py-3 glass rounded-xl text-xs font-bold hover:bg-purple-500/5">Experienced
                (2-5y)</button>
            </div>
          </div>

          <div>
            <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Interview Type</label>
            <select
              class="w-full bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 outline-none focus:border-purple-500">
              <option>Technical Deep Dive</option>
              <option>HR Round</option>
              {/* <option>Behavioral Round</option> */}
            </select>
          </div>

          <button onclick="startInterview()"
            class="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-white shadow-lg mt-4">Launch
            Interview Engine</button>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;