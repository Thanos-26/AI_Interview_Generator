import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestInterview = async () => {
      try {
        const interviewId = localStorage.getItem('interviewId');
        if (interviewId) {
          const res = await axios.get(`http://localhost:8000/ai/interview/${interviewId}`);
          setInterview(res.data.interview);
          
          // Clear interviewId from localStorage after successful fetch
          localStorage.removeItem('interviewId');
        }
      } catch (error) {
        console.error("Failed to fetch interview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestInterview();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview analysis...</p>
        </div>
      </section>
    );
  }

  if (!interview || interview.status !== 'ended') {
    return (
      <section className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold tracking-tight mb-4">No Interview Data</h2>
          <p className="text-gray-400">Complete an interview to see your analysis here.</p>
        </div>
      </section>
    );
  }

  const score = interview.averageScore || 0;
  const formattedDate = interview.createdAt 
    ? new Date(interview.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'N/A';

  return (
    <section className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Interview Analysis</h2>
          <p className="text-gray-400">{interview.role} | {interview.type} | {formattedDate}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-purple-500">{score}</div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Overall Score / 100</p>
        </div>
      </div>

      {/* Summary Section */}
      {interview.summary && (
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Interview Summary</h3>
          <p className="text-gray-300 leading-relaxed">{interview.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
          <h3 className="text-xs font-bold text-green-400 uppercase mb-4">Strong Concepts</h3>
          {interview.strongTopics && interview.strongTopics.length > 0 ? (
            <ul className="space-y-3">
              {interview.strongTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No strong topics identified</p>
          )}
        </div>

        {/* Weak Topics */}
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
          <h3 className="text-xs font-bold text-red-400 uppercase mb-4">Weak Concepts</h3>
          {interview.weakTopics && interview.weakTopics.length > 0 ? (
            <ul className="space-y-3">
              {interview.weakTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No weak topics identified</p>
          )}
        </div>
      </div>

      {/* Suggestions Section */}
      {interview.suggestions && interview.suggestions.length > 0 && (
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-md">
          <h3 className="text-xs font-bold text-purple-400 uppercase mb-4">How to Improve</h3>
          <ul className="space-y-4">
            {interview.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Dashboard;