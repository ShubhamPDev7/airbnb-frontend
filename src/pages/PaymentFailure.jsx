import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
      >

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          className="w-20 h-20 bg-red-50 border-8 border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <motion.svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
            animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-2xl md:text-[26px] font-bold text-gray-900 mb-3 tracking-tight"
        >
          Payment incomplete
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          className="text-gray-500 text-[15px] mb-8 leading-relaxed"
        >
          We couldn't process your payment. Don't worry, your reservation is still held and your card has <strong>not</strong> been charged.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)} // Navigates back to the checkout page
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-md"
          >
            Try payment again
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full bg-white border border-gray-300 text-gray-900 font-bold py-3.5 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition"
          >
            Back to Home
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}