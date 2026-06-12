import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function AirbnbLogo() {
  return (
    <svg viewBox="0 0 448 512" className="w-8 h-8 fill-[#FF385C]">
      <path d="M224 373.12c-25.24-31.67-40.08-59.43-45-83.18-22.55-88 112.61-88 90.06 0-5.45 24.25-20.29 52-45.06 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.43-89.11-41.06-71.3-91.09 15.1-39.16 111.72-231.18 115.87-241.56 15.75-30.07 25.56-57.4 59.38-57.4 32.34 0 43.4 25.94 60.37 59.87 36 70.62 89.35 177.48 114.84 239.09 13.17 33.07-1.37 71.29-37.01 86.64zm47-136.12C280.27 35.93 273.13 32 224 32c-45.52 0-64.87 31.67-84.66 72.79C33.18 317.1 22.89 347.19 22 349.81-3.22 419.14 48.74 480 111.63 480c21.71 0 60.61-6.06 112.37-62.4 58.68 63.78 101.26 62.4 112.37 62.4 62.89.05 114.85-60.86 89.61-130.19.02-3.89-16.82-38.9-16.82-39.58z" />
    </svg>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Grabs ?token=... from URL
  
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'Password reset successful! Redirecting...' });
        setTimeout(() => navigate('/login'), 2500); // Send them to login after 2.5s
      } else {
        setStatus({ type: 'error', message: data.error?.message || 'Invalid or expired token.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Could not connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering form if there's no token in the URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500 font-bold">Invalid password reset link. Please request a new one.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div className="w-7" />
            <span className="font-semibold text-[15px] text-gray-900 absolute left-1/2 -translate-x-1/2">Create New Password</span>
            <div className="w-7" />
          </div>

          <div className="px-6 py-7 space-y-5">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 leading-snug">Choose a new password</h2>
              <p className="text-sm text-gray-500 mt-1">Make sure it's at least 6 characters long.</p>
            </div>

            {status.message && (
              <div className={`flex items-start gap-2 p-3.5 border rounded-xl text-sm ${status.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
                <div className="px-4 pt-3 pb-0">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">New Password</label>
                </div>
                <div className="flex items-center px-4 pb-3 pt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className="flex-1 text-[15px] text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors ml-2 shrink-0">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-2 bg-gradient-to-r from-[#E61E4D] to-[#FF385C] hover:from-[#D31A45] hover:to-[#E61E4D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px]">
                {isLoading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <AirbnbLogo />
        </div>
      </div>
    </div>
  );
}