import React, { useState } from 'react';
import { apiUrl } from '../config/api';
import { extractError } from '../config/apiError';
import { useNavigate } from 'react-router-dom';

function AirbnbLogo() {
  return (
    <svg viewBox="0 0 448 512" className="w-8 h-8 fill-[#FF385C]">
      <path d="M224 373.12c-25.24-31.67-40.08-59.43-45-83.18-22.55-88 112.61-88 90.06 0-5.45 24.25-20.29 52-45.06 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.43-89.11-41.06-71.3-91.09 15.1-39.16 111.72-231.18 115.87-241.56 15.75-30.07 25.56-57.4 59.38-57.4 32.34 0 43.4 25.94 60.37 59.87 36 70.62 89.35 177.48 114.84 239.09 13.17 33.07-1.37 71.29-37.01 86.64zm47-136.12C280.27 35.93 273.13 32 224 32c-45.52 0-64.87 31.67-84.66 72.79C33.18 317.1 22.89 347.19 22 349.81-3.22 419.14 48.74 480 111.63 480c21.71 0 60.61-6.06 112.37-62.4 58.68 63.78 101.26 62.4 112.37 62.4 62.89.05 114.85-60.86 89.61-130.19.02-3.89-16.82-38.9-16.82-39.58z" />
    </svg>
  );
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'MALE' // Defaulting to match your backend Enum
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Grab the JWT token from storage to prove who is logged in
      const token = localStorage.getItem('token'); 
      
      const response = await fetch(apiUrl('/users/profile'), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Secure the request
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Profile updated! Send them to the homepage to start booking.
        navigate('/'); 
      } else {
        // This will catch validation errors (e.g. name too short, date in future)
        setError(extractError(data, 'Failed to update profile.'));
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div className="w-7" />
            <span className="font-semibold text-[15px] text-gray-900 absolute left-1/2 -translate-x-1/2">Finish signing up</span>
            <div className="w-7" />
          </div>

          {/* Body */}
          <div className="px-6 py-7 space-y-5">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 leading-snug">Welcome to StayLux</h2>
              <p className="text-sm text-gray-500 mt-1">We just need a few more details to set up your profile.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name Input */}
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
                <div className="px-4 pt-3 pb-0">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 pb-3 pt-1 text-[15px] text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Date of Birth Input */}
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
                <div className="px-4 pt-3 pb-0">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                </div>
                <input
                  type="date"
                  className="w-full px-4 pb-3 pt-1 text-[15px] text-gray-900 outline-none bg-transparent"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              {/* Gender Select */}
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
                <div className="px-4 pt-3 pb-0">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                </div>
                <select
                  className="w-full px-3 pb-3 pt-1 text-[15px] text-gray-900 outline-none bg-transparent appearance-none"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <p className="text-[12px] text-gray-500 leading-tight pt-1">
                To sign up, you need to be at least 18. Your birthday won’t be shared with other people who use StayLux.
              </p>

              <button type="submit" disabled={isLoading} className="w-full mt-2 bg-gradient-to-r from-[#E61E4D] to-[#FF385C] hover:from-[#D31A45] hover:to-[#E61E4D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px]">
                {isLoading ? 'Saving...' : 'Agree and continue'}
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