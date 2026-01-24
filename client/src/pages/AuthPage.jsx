import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

// OAuth Configuration - Replace with your actual credentials
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const { 
    login, 
    signup, 
    googleLogin, 
    githubLogin, 
    isAuthenticated, 
    authLoading, 
    authError,
    setAuthError 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Clear the URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Process GitHub login
      githubLogin(code);
    }
  }, [searchParams, githubLogin]);

  // Load Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.log('Google Client ID not configured');
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      if (window.google) {
        initializeGoogle();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogle();
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializeGoogle = useCallback(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
      });
      setGoogleLoaded(true);
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    if (response.credential) {
      const success = await googleLogin(response.credential);
      if (success) {
        navigate('/home');
      }
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setLocalError('Google login is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }
    
    if (window.google && googleLoaded) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          // Fallback to popup if One Tap is not shown
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'filled_black', size: 'large', width: '100%' }
          );
          document.getElementById('google-signin-button')?.click();
        }
      });
    } else {
      setLocalError('Google Sign-In is loading. Please try again.');
    }
  };

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setLocalError('GitHub login is not configured. Please add VITE_GITHUB_CLIENT_ID to your .env file.');
      return;
    }

    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'read:user user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = githubAuthUrl;
  };

  // Format error messages for better UX
  const getDisplayError = () => {
    if (localError) return localError;
    if (!authError) return null;
    
    // Handle common error cases
    if (authError.toLowerCase().includes('failed to fetch') || authError.toLowerCase().includes('networkerror')) {
      return 'Unable to connect to server. Please make sure the backend server is running on port 8000.';
    }
    return authError;
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching modes
  useEffect(() => {
    setLocalError('');
    if (setAuthError) setAuthError(null);
  }, [isLogin, setAuthError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      // Validate signup
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      await signup(formData.name, formData.email, formData.password);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setLocalError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030303] flex items-center justify-center">
      {/* Hidden Google Sign-In Button for fallback */}
      <div id="google-signin-button" className="hidden"></div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-cyan-500/25 to-blue-600/20 blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-emerald-500/20 to-teal-600/15 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">InterviewSim</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Practice Makes
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              Perfect Interviews
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-md mx-auto lg:mx-0 mb-8">
            AI-powered mock interviews that adapt to your skills. Get real-time feedback and land your dream job.
          </p>

          {/* Features */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Real-time AI Feedback</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Adaptive Questions</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md">
          <div className="relative">
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50 rounded-2xl blur-lg opacity-40" />
            
            {/* Card */}
            <div className="relative bg-[#0d0d0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Tabs */}
              <div className="flex mb-8 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    isLogin
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    !isLogin
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {getDisplayError() && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm text-center">{getDisplayError()}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0d0d0f] text-gray-500">or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button 
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={authLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              {/* OAuth Setup Info */}
              {(!GOOGLE_CLIENT_ID || !GITHUB_CLIENT_ID) && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 text-xs text-center">
                    {!GOOGLE_CLIENT_ID && !GITHUB_CLIENT_ID 
                      ? 'OAuth not configured. Add VITE_GOOGLE_CLIENT_ID and VITE_GITHUB_CLIENT_ID to enable social login.'
                      : !GOOGLE_CLIENT_ID 
                        ? 'Google login requires VITE_GOOGLE_CLIENT_ID in .env' 
                        : 'GitHub login requires VITE_GITHUB_CLIENT_ID in .env'}
                  </p>
                </div>
              )}

              {/* Footer text */}
              <p className="mt-6 text-center text-sm text-gray-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
