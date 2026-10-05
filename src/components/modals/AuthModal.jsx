import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Key,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    isAuthorized,
    loginWithGoogle,
    loginWithEmail,
    logout,
    AUTHORIZED_EMAILS = []
  } = useProject() || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [useEmailForm, setUseEmailForm] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setIsAuthModalOpen?.(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithGoogle?.();
      handleClose();
    } catch (err) {
      console.error('Google sign in error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err?.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithEmail?.(email.trim(), password);
      handleClose();
    } catch (err) {
      console.error('Email sign in error:', err);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else {
        setErrorMsg(err?.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout?.();
      handleClose();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border ${isAuthorized ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
              {isAuthorized ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentUser ? 'Official Account Profile' : 'Portal Access & Authentication'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Talawakelle DS Planning Branch Portal
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Authorization Policy Note */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Administrative Access Policy
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Project creation, editing, deleting, and evidence uploads are restricted exclusively to authorized Planning Branch accounts:
            </p>
            <div className="space-y-1 font-mono text-[11px]">
              {(AUTHORIZED_EMAILS || []).map((emailAddr) => (
                <div key={emailAddr} className="flex items-center space-x-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-emerald-300">
                    {emailAddr}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              All other visitors and non-authenticated users can browse all dashboards, reports, and master records in <strong>Read-Only</strong> mode.
            </p>
          </div>

          {/* Current User Status (if logged in) */}
          {currentUser ? (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Logged-In Account</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isAuthorized ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                  {isAuthorized ? 'Authorized Admin' : 'Read-Only Access'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                    {(currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-white truncate">{currentUser.displayName || 'Authorized Officer'}</p>
                  <p className="font-mono text-slate-400 truncate text-[11px]">{currentUser.email}</p>
                </div>
              </div>

              {!isAuthorized && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    This account is not on the authorized list. The portal is in Read-Only mode. Sign in with an authorized email to unlock editing privileges.
                  </span>
                </div>
              )}

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-semibold flex items-center justify-center space-x-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold flex items-center justify-center space-x-3 shadow-lg transition active:scale-[0.98] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="flex items-center space-x-3 text-slate-500 text-[10px] uppercase font-bold">
                <div className="h-px bg-slate-800 flex-1" />
                <span>Or</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {!useEmailForm ? (
                <button
                  onClick={() => setUseEmailForm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center justify-center space-x-2 transition"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Sign in with Email & Password</span>
                </button>
              ) : (
                <form onSubmit={handleEmailSignIn} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="e.g. madhuriliyanage1@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center space-x-2 transition disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
