import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../config/api';
import { extractError } from '../config/apiError';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We'll pass the email through the location state from Signup.jsx
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/auth/verify-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        navigate('/login'); // Success! Redirect to login
      } else {
        const data = await response.json();
        setError(extractError(data, 'Invalid code.'));
      }
    } catch {
      setError('Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm border rounded-2xl p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold mb-2">Verify your email</h2>
        <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code sent to {email}</p>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm mb-4 overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerify} className="space-y-4">
          <motion.input
            type="text"
            maxLength="6"
            placeholder="000000"
            initial={{ scale: 1 }}
            animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full p-3 border rounded-xl text-center text-2xl tracking-widest font-bold"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
            required
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || code.length < 6}
            className="w-full bg-[#FF385C] text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}