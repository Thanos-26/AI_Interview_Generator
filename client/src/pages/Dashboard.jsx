import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [interview, setInterview] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewHistory = async () => {
      try {
        const res = await axios.get('http://localhost:8000/ai/interviews', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const completedInterviews = res.data.interviews.filter((item) => item.status === 'ended');
        setInterviews(completedInterviews);
        setInterview(completedInterviews[0] || null);
      } catch (error) {
        console.error("Failed to fetch interview history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewHistory();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted">Loading interview analysis...</p>
        </div>
      </section>
    );
  }

  if (!interview || interview.status !== 'ended') {
    return (
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <h2 className="mb-4 font-serif text-4xl">No Interview Data</h2>
          <p className="text-muted">Complete an interview to see your analysis here.</p>
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
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:px-6 lg:px-8">

      <div className="flex items-end justify-between border-b border-rule pb-8 dark:border-white/10">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your progress</p>
          <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">Interview Assessment</h2>
          <p className="mt-2 text-sm text-muted">{interview.role} / {interview.type} / {formattedDate}</p>
        </div>
        <div className="text-right">
          <div className="font-serif text-6xl">{score}<span className="ml-2 text-xl text-muted">/ 100</span></div>
          <div className="mt-3 h-2 w-48 max-w-full overflow-hidden rounded-full bg-rule dark:bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div>
          <p className="text-[10px] uppercase tracking-[.14em] text-muted">Overall score</p>
        </div>
      </div>

      {interviews.length > 1 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">Your history</p>
              <h3 className="mt-1 font-serif text-3xl">Previous Interviews</h3>
            </div>
            <p className="text-sm text-muted">{interviews.length} completed interviews · Select a card to view its report</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {interviews.map((item) => {
              const isSelected = item.id === interview.id;
              const itemDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Date unavailable';
              const itemScore = Number(item.averageScore) || 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInterview(item)}
                  aria-pressed={isSelected}
                  className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    isSelected
                      ? 'border-accent bg-accent/[0.07] shadow-sm ring-1 ring-accent/30'
                      : 'border-rule bg-white hover:border-accent/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-300'}`}>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isSelected ? 'bg-accent/15 text-accent' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {isSelected ? 'Currently viewing' : 'Completed'}
                    </span>
                  </div>
                  <h4 className="mt-5 text-lg font-semibold">{item.role || 'Interview'}</h4>
                  <p className="mt-1 text-sm text-muted">{item.type || 'General'} interview</p>
                  <div className="mt-5 flex items-end justify-between border-t border-rule pt-4 dark:border-white/10">
                    <div>
                      <p className="text-xs text-muted">Interview date</p>
                      <p className="mt-1 text-sm font-medium">{itemDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">Score</p>
                      <p className="mt-0.5 font-serif text-2xl">{itemScore}<span className="ml-1 text-xs text-muted">/100</span></p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Summary Section */}
      {interview.summary && (
        <div className="border-b border-rule py-8 dark:border-white/10">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Interview Summary</h3>
          <p className="max-w-3xl leading-8 text-muted">{interview.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="p-8 rounded-[2rem] bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <h3 className="text-xs font-bold text-green-400 uppercase mb-4">Strong Concepts</h3>
          {interview.strongTopics && interview.strongTopics.length > 0 ? (
            <ul className="space-y-3">
              {interview.strongTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700 dark:text-gray-300">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600 dark:text-gray-500 text-sm">No strong topics identified</p>
          )}
        </div>

        {/* Weak Topics */}
        <div className="p-8 rounded-[2rem] bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <h3 className="text-xs font-bold text-red-400 uppercase mb-4">Weak Concepts</h3>
          {interview.weakTopics && interview.weakTopics.length > 0 ? (
            <ul className="space-y-3">
              {interview.weakTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700 dark:text-gray-300">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600 dark:text-gray-500 text-sm">No weak topics identified</p>
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
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
