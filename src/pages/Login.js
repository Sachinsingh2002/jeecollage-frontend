import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignIn, UserPlus, ShieldCheck } from '@phosphor-icons/react';
import axios from 'axios';

const GOOGLE_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/google/login";
const CALLBACK_URL = `${window.location.origin}/auth/callback`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpPreview, setOtpPreview] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const sendOtp = async () => {
    const cleaned = phone.replace(/\s+/g, '').replace(/^(\+91)?/, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/send-otp`, { phone });
      setOtpSent(true);
      setOtpStep(true);
      setOtpPreview(data.otp_preview || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      await axios.post(`${API}/auth/verify-otp`, { phone, otp });
      setOtpVerified(true);
      setOtpStep(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!otpVerified) {
        setError('Please verify your phone number first');
        return;
      }
      const result = await register(email, password, name, phone);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    }
  };

  const resetToRegister = () => {
    setIsRegister(true);
    setOtpStep(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setOtpPreview('');
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block mb-8">
            <div className="text-3xl font-black tracking-tighter">
              JEE<span className="text-[#002FA7]">college</span><span className="text-zinc-400 text-xl">.com</span>
            </div>
          </Link>

          <h1 className="text-4xl font-bold tracking-tight mb-2" data-testid="auth-heading">
            {otpStep ? 'Verify Phone' : isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-zinc-600 mb-8">
            {otpStep ? `Enter the OTP sent to +91 ${phone}` : isRegister ? 'Join the community of students' : 'Sign in to continue'}
          </p>

          {error && (
            <div data-testid="auth-error" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* OTP Step */}
          {otpStep && (
            <div className="space-y-6">
              {otpPreview && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 text-sm" data-testid="otp-preview">
                  <strong>Demo OTP:</strong> {otpPreview}
                  <p className="text-xs text-blue-600 mt-1">In production, this will be sent via SMS</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  data-testid="otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-2xl text-center tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={otpLoading || otp.length !== 6}
                data-testid="verify-otp-button"
                className="w-full px-6 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={20} weight="bold" />
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="flex items-center justify-between">
                <button onClick={sendOtp} disabled={otpLoading} className="text-sm text-[#002FA7] font-bold hover:underline" data-testid="resend-otp">
                  Resend OTP
                </button>
                <button onClick={() => { setOtpStep(false); setOtpSent(false); }} className="text-sm text-zinc-500 hover:text-zinc-800">
                  Change Number
                </button>
              </div>
            </div>
          )}

          {/* Main Form */}
          {!otpStep && (
            <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Name</label>
                  <input type="text" data-testid="register-name-input" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] transition-all" />
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Phone Number *</label>
                  <div className="flex gap-0">
                    <div className="flex items-center px-4 bg-zinc-100 border border-r-0 border-zinc-200 text-sm font-bold text-zinc-600">+91</div>
                    <input type="tel" data-testid="register-phone-input" value={phone} onChange={(e) => setPhone(e.target.value)} required
                      placeholder="9876543210" maxLength={15} disabled={otpVerified}
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] transition-all disabled:bg-green-50 disabled:border-green-200" />
                    {otpVerified ? (
                      <div className="flex items-center px-4 bg-green-100 border border-l-0 border-green-200 text-green-700" data-testid="phone-verified-badge">
                        <ShieldCheck size={20} weight="bold" />
                      </div>
                    ) : (
                      <button type="button" onClick={sendOtp} disabled={otpLoading || !phone || phone.replace(/\D/g, '').length < 10}
                        data-testid="send-otp-button"
                        className="px-4 py-3 bg-[#002FA7] text-white text-sm font-bold hover:bg-black transition-colors disabled:opacity-40">
                        {otpLoading ? '...' : otpSent ? 'Resend' : 'Verify'}
                      </button>
                    )}
                  </div>
                  {otpVerified && <p className="text-xs text-green-600 font-bold mt-1">Phone verified successfully</p>}
                  {!otpVerified && <p className="text-xs text-zinc-400 mt-1">Verify your phone to create account</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Email</label>
                <input type="email" data-testid="auth-email-input" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Password</label>
                <input type="password" data-testid="auth-password-input" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] transition-all" />
              </div>

              <button type="submit" data-testid="auth-submit-button"
                disabled={isRegister && !otpVerified}
                className="w-full px-6 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                {isRegister ? <><UserPlus size={20} weight="bold" /> Create Account</> : <><SignIn size={20} weight="bold" /> Sign In</>}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-zinc-200"></div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Or</span>
              <div className="flex-1 h-px bg-zinc-200"></div>
            </div>

            {/* Google Sign In */}
            <a href={`${GOOGLE_AUTH_URL}?redirect_url=${encodeURIComponent(CALLBACK_URL)}`} data-testid="google-signin-button">
              <button type="button" className="w-full px-6 py-4 bg-white border-2 border-zinc-200 text-zinc-800 font-bold hover:border-zinc-400 hover:bg-zinc-50 transition-colors rounded-none flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </a>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); setOtpStep(false); setOtpSent(false); setOtpVerified(false); setOtp(''); }}
                data-testid="toggle-auth-mode"
                className="text-sm text-zinc-600 hover:text-[#002FA7] font-bold"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.pexels.com/photos/6283211/pexels-photo-6283211.jpeg" alt="Students" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#002FA7] opacity-20"></div>
      </div>
    </div>
  );
};
