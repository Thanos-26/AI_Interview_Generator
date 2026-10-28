import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import SetupModal from '../components/SetupModal';

const Landing = () => {
  const { setIsConfigOpen, user } = useContext(AppContext);
  const firstName = user?.name?.split(' ')[0] || 'there';
  const openSetup = () => setIsConfigOpen(true);
  return <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
    <p className="text-3xl text-muted">Welcome back, {firstName}.</p>
    <section className="mt-6 grid gap-14 border-b border-rule pb-14 dark:border-white/10 lg:grid-cols-[1.3fr_.7fr]">
      <div><h1 className="mt-2 max-w-3xl font-serif text-5xl font-medium leading-[1.02] sm:text-6xl">Structured interview practice with detailed evaluation.</h1><p className="mt-6 max-w-xl leading-7 text-muted">Practice role-specific questions aloud, then review a clear assessment of your responses.</p><div className="mt-9 flex items-center gap-6"><button onClick={openSetup} className="bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#283958]">Begin practice interview</button><button onClick={openSetup} className="text-sm text-accent underline underline-offset-4 dark:text-[#C6D0E8]">Configure session</button></div></div>
      <ol className="border-t border-rule dark:border-white/10">{['Select a role and experience level.', 'Answer each question aloud.', 'Review the completed evaluation.'].map((step, index) => <li key={step} className="flex gap-5 border-b border-rule py-5 dark:border-white/10"><span className="font-serif text-2xl text-muted">0{index + 1}</span><span className="pt-1 text-sm">{step}</span></li>)}</ol>
    </section>
    <section className="grid border-b border-rule py-12 dark:border-white/10 md:grid-cols-3">{[['Voice-led practice', 'Use your microphone to answer naturally.'], ['Adaptive questioning', 'Questions respond to your role and answers.'], ['Written evaluation', 'Receive a practical summary at the end.']].map(([title, text], index) => <article key={title} className={`py-4 ${index ? 'md:border-l md:border-rule md:pl-8 dark:md:border-white/10' : ''}`}><h2 className="font-serif text-2xl">{title}</h2><p className="mt-3 max-w-xs text-sm leading-6 text-muted">{text}</p></article>)}</section>
    <p className="mt-6 text-xs leading-5 text-muted">Camera and microphone access are used only while an interview session is active.</p><SetupModal />
  </main>;
};
export default Landing;
