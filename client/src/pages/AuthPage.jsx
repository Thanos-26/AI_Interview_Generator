import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { HiArrowRight } from 'react-icons/hi';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');
  const { login, signup, googleLogin, githubLogin, isAuthenticated, authLoading, authError, setAuthError } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleGoogleCallback = useCallback(async (response) => {
    if (response.credential && await googleLogin(response.credential)) navigate('/home');
  }, [googleLogin, navigate]);

  const initializeGoogle = useCallback(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCallback, auto_select: false });
    }
  }, [handleGoogleCallback]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      githubLogin(code);
    }
  }, [searchParams, githubLogin]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      if (window.google) initializeGoogle();
      return undefined;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
    return undefined;
  }, [initializeGoogle]);

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const getDisplayError = () => {
    if (localError) return localError;
    if (!authError) return null;
    return authError.toLowerCase().includes('failed to fetch') || authError.toLowerCase().includes('networkerror')
      ? 'Unable to connect to the server. Please make sure it is running on port 8000.'
      : authError;
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setLocalError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    if (isLogin) return login(formData.email, formData.password);
    if (formData.password !== formData.confirmPassword) return setLocalError('Passwords do not match');
    if (formData.password.length < 6) return setLocalError('Password must be at least 6 characters');
    return signup(formData.name, formData.email, formData.password);
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setLocalError('');
    setAuthError?.(null);
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) return setLocalError('Google login is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
    if (!window.google) return setLocalError('Google Sign-In is loading. Please try again.');
    window.google.accounts.id.prompt();
  };

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) return setLocalError('GitHub login is not configured. Add VITE_GITHUB_CLIENT_ID to your .env file.');
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('read:user user:email')}`;
  };

  const inputClass = 'mt-1.5 w-full border border-rule bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent dark:border-white/15';

  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink dark:bg-dark-bg dark:text-[#E6E1D8] sm:px-10">
      <div id="google-signin-button" className="hidden" />

      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="font-serif text-2xl">Interview Sim</div>
        <span className="hidden text-xs text-muted sm:block">Structured interview practice</span>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
        <section className="max-w-2xl">
          <p className="text-xs uppercase tracking-[.14em] text-muted">Interview practice</p><h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Prepare for a structured interview.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">Practice role-specific questions aloud and receive a detailed evaluation of your responses.</p>
          <div className="mt-10 space-y-3 border-t border-rule pt-5 text-sm text-muted dark:border-white/10"><p>Voice-led interview practice</p><p>Role-specific questions</p><p>Written evaluation after each session</p></div>
        </section>

        <section className="w-full max-w-md justify-self-center border border-rule bg-white p-7 dark:border-white/15 dark:bg-[#16191F] sm:p-8"><div className="mb-7"><h2 className="font-serif text-3xl">{isLogin ? 'Sign in' : 'Create an account'}</h2><p className="mt-2 text-sm text-muted">{isLogin ? 'Continue your interview practice.' : 'Begin structured interview practice.'}</p></div>
          <div className="mb-6 flex gap-6 border-b border-rule dark:border-white/10"><button onClick={() => switchMode(true)} className={`-mb-px border-b py-2.5 text-sm ${isLogin ? 'border-accent text-ink dark:border-[#C6D0E8] dark:text-white' : 'border-transparent text-muted'}`}>Sign in</button><button onClick={() => switchMode(false)} className={`-mb-px border-b py-2.5 text-sm ${!isLogin ? 'border-accent text-ink dark:border-[#C6D0E8] dark:text-white' : 'border-transparent text-muted'}`}>Sign up</button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <label className="block text-sm font-medium">Full name<input className={`${inputClass} mt-1.5`} name="name" value={formData.name} onChange={handleChange} placeholder="Avery Johnson" required /></label>}
            <label className="block text-sm font-medium">Email address<input className={`${inputClass} mt-1.5`} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required /></label>
            <label className="block text-sm font-medium">Password<input className={`${inputClass} mt-1.5`} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required /></label>
            {!isLogin && <label className="block text-sm font-medium">Confirm password<input className={`${inputClass} mt-1.5`} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required /></label>}
            {getDisplayError() && <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{getDisplayError()}</p>}
            <button disabled={authLoading} className="flex w-full items-center justify-center gap-2 bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-[#283958] disabled:cursor-not-allowed disabled:opacity-60">{authLoading ? 'Please wait…' : isLogin ? 'Sign in to Interview Sim' : 'Create my account'} <HiArrowRight className="text-lg" /></button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200 dark:before:bg-white/10 dark:after:bg-white/10">OR CONTINUE WITH</div>

          <div className="grid grid-cols gap-3">
            <button type="button" onClick={handleGoogleLogin} disabled={authLoading} className="rounded-xl border border-slate-200 py-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">Google</button>
            {/* <button type="button" onClick={handleGitHubLogin} disabled={authLoading} className="rounded-xl border border-slate-200 py-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">GitHub</button> */}
            </div>
          {(!GOOGLE_CLIENT_ID || !GITHUB_CLIENT_ID) && <p className="mt-4 text-center text-xs text-amber-600 dark:text-amber-300">Social sign-in requires its provider key in <code>.env</code>.</p>}
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
