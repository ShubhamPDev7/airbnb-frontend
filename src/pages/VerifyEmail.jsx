import React, { useState } from 'react';
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
      <div className="w-full max-w-sm border rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-2">Verify your email</h2>
        <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code sent to {email}</p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            className="w-full p-3 border rounded-xl text-center text-2xl tracking-widest font-bold"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
            required
          />
          <button 
            disabled={isLoading || code.length < 6}
            className="w-full bg-[#FF385C] text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
}