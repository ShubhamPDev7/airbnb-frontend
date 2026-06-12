import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
        
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-50 border-8 border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl md:text-[26px] font-bold text-gray-900 mb-3 tracking-tight">Payment incomplete</h1>
        <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
          We couldn't process your payment. Don't worry, your reservation is still held and your card has <strong>not</strong> been charged.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)} // Navigates back to the checkout page
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-md"
          >
            Try payment again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border border-gray-300 text-gray-900 font-bold py-3.5 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}