import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
      >

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          className="w-20 h-20 bg-green-50 border-8 border-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-2xl md:text-[26px] font-bold text-gray-900 mb-3 tracking-tight"
        >
          Payment successful!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          className="text-gray-500 text-[15px] mb-8 leading-relaxed"
        >
          Your reservation is confirmed. You're all set for your trip! We've sent a receipt to your registered email address.
        </motion.p>

        {/* Digital Ticket / Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100"
        >
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
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/my-trips')}
            className="w-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition shadow-md"
          >
            View My Trips
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full bg-white border border-gray-300 text-gray-900 font-bold py-3.5 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition"
          >
            Explore more places
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}