import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../config/api';
import { extractError } from '../config/apiError';
import { useNavigate, Link } from 'react-router-dom';

function AirbnbLogo() {
  return (
    <svg viewBox="0 0 448 512" className="w-8 h-8 fill-[#FF385C]">
      <path d="M224 373.12c-25.24-31.67-40.08-59.43-45-83.18-22.55-88 112.61-88 90.06 0-5.45 24.25-20.29 52-45.06 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.43-89.11-41.06-71.3-91.09 15.1-39.16 111.72-231.18 115.87-241.56 15.75-30.07 25.56-57.4 59.38-57.4 32.34 0 43.4 25.94 60.37 59.87 36 70.62 89.35 177.48 114.84 239.09 13.17 33.07-1.37 71.29-37.01 86.64zm47-136.12C280.27 35.93 273.13 32 224 32c-45.52 0-64.87 31.67-84.66 72.79C33.18 317.1 22.89 347.19 22 349.81-3.22 419.14 48.74 480 111.63 480c21.71 0 60.61-6.06 112.37-62.4 58.68 63.78 101.26 62.4 112.37 62.4 62.89.05 114.85-60.86 89.61-130.19.02-3.89-16.82-38.9-16.82-39.58z" />
    </svg>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(apiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Check your email for a reset link.' });
        setEmail(''); // Clear the input
      } else {
        setStatus({ type: 'error', message: extractError(data, 'Failed to send reset link.') });
      }
    } catch {
      setStatus({ type: 'error', message: 'Could not connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[440px]"
      >
        <div className="border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="font-semibold text-[15px] text-gray-900 absolute left-1/2 -translate-x-1/2">Reset Password</span>
            <div className="w-7" />
          </div>

          {/* Body */}
          <div className="px-6 py-7 space-y-5">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 leading-snug">Forgot your password?</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a link to reset it.</p>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 p-3.5 border rounded-xl text-sm overflow-hidden ${status.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
                <div className="px-4 pt-3 pb-0">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 pb-3 pt-1 text-[15px] text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 bg-gradient-to-r from-[#E61E4D] to-[#FF385C] hover:from-[#D31A45] hover:to-[#E61E4D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px]"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </motion.button>
            </form>
          </div>
          
          <div className="px-6 pb-6 text-center">
            <Link to="/login" className="text-sm font-bold text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors">
              Back to log in
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex justify-center mt-6"
        >
          <AirbnbLogo />
        </motion.div>
      </motion.div>
    </div>
  );
}