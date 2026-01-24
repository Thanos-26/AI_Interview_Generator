import React from 'react';

const Dashboard = () => {
  const history = [
    { date: "Jan 24, 2026", role: "Software Engineer", score: 8.4, status: "completed" },
    { date: "Jan 20, 2026", role: "System Architect", score: 7.9, status: "completed" },
  ];

  return (
    <section className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-gray-400">Software Engineer | Technical Round</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-purple-500">8.4</div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Overall Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase">Skill Progression</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Technical Correctness</span><span>90%</span></div>
              <div className="w-full h-1.5 bg-gray-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[90%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Conceptual Clarity</span><span>75%</span></div>
              <div className="w-full h-1.5 bg-gray-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[75%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-24 h-24 opacity-60">
            <polygon points="50,5 95,35 75,90 25,90 5,35" fill="none" stroke="currentColor" strokeWidth="1"/>
            <polygon points="50,20 80,40 70,75 30,70 20,45" fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" strokeWidth="2"/>
          </svg>
          <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase">Performance Radar</p>
        </div>

        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Patterns</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] rounded-lg border border-red-500/20">Over-explaining</span>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] rounded-lg border border-green-500/20">Strong Logic</span>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-bold">
            <tr><th className="px-8 py-4">Date</th><th className="px-8 py-4">Role</th><th className="px-8 py-4">Score</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((item, idx) => (
              <tr key={idx} className={idx !== 0 ? 'opacity-50' : ''}>
                <td className="px-8 py-6">{item.date}</td>
                <td className="px-8 py-6">{item.role}</td>
                <td className="px-8 py-6 text-purple-500 font-bold">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;