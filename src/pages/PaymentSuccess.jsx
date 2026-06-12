import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Stripe often passes session_id or booking_id in the URL after success
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id') || Math.floor(Math.random() * 89999 + 10000); 

  // Optional: Trigger confetti or analytics here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-50 border-8 border-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h1 className="text-2xl md:text-[26px] font-bold text-gray-900 mb-3 tracking-tight">Payment successful!</h1>
        <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
          Your reservation is confirmed. You're all set for your trip! We've sent a receipt to your registered email address.
        </p>

        {/* Digital Ticket / Receipt */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-500">Confirmation code</span>
            <span className="text-sm font-bold text-gray-900 font-mono">#{bookingId}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-500">Payment status</span>
            <span className="text-sm font-bold text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Paid
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-500">Host</span>
            <span className="text-sm font-bold text-gray-900">StayLux Verified</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/my-trips')}
            className="w-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition shadow-md"
          >
            View My Trips
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border border-gray-300 text-gray-900 font-bold py-3.5 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition"
          >
            Explore more places
          </button>
        </div>

      </div>
    </div>
  );
}