import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';

/* ── Icons ─────────────────────────────────────────────────── */
function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function StripeLogo() {
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
      alt="Stripe"
      className="h-[18px] object-contain opacity-90"
    />
  );
}

/* ── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const sectionFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
  rest: { x: 0 },
};

/* ── Main component ─────────────────────────────────────────── */
export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shake, setShake] = useState(false);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(apiUrl(`/bookings/${bookingId}/payments`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonResponse = await response.json();
      if (response.ok && jsonResponse.data?.sessionUrl) {
        window.location.href = jsonResponse.data.sessionUrl;
      } else {
        setError('Could not initialize payment. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError('Connection error. Please check your network and try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        {/* ── Back nav ── */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          whileHover={{ x: -3 }}
          className="flex items-center gap-1.5 text-gray-800 font-semibold hover:text-gray-500 transition-colors mb-8 mt-4"
        >
          <ChevronLeftIcon />
          <span className="text-sm">Back</span>
        </motion.button>

        {/* ── Page title ── */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-[26px] font-bold text-gray-900 tracking-tight mb-8"
        >
          Confirm and pay
        </motion.h1>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── LEFT: staggered sections ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex-1 w-full min-w-0 space-y-7"
          >
            {/* Booking reference */}
            <motion.div
              variants={sectionFadeUp}
              className="flex items-center justify-between py-5 border-b border-gray-200"
            >
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Reservation held</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Complete payment to confirm your stay
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Booking ref</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="font-mono font-bold text-gray-900 text-sm"
                >
                  #{bookingId}
                </motion.p>
              </div>
            </motion.div>

            {/* Price details */}
            <motion.div variants={sectionFadeUp} className="space-y-4 py-2 border-b border-gray-200 pb-7">
              <h2 className="text-[17px] font-bold text-gray-900">Price details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[15px] text-gray-700">
                  <span>Accommodation charge</span>
                  <span className="font-medium text-gray-900">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center text-[15px] text-gray-700">
                  <span>Taxes &amp; fees</span>
                  <span className="font-medium text-gray-900">Included</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-[15px] font-bold text-gray-900">
                <span>Total (INR)</span>
                <span>Due at payment</span>
              </div>
            </motion.div>

            {/* Cancellation policy */}
            <motion.div variants={sectionFadeUp} className="py-2 border-b border-gray-200 pb-7">
              <h2 className="text-[17px] font-bold text-gray-900 mb-2">Cancellation policy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can cancel your reservation from the <strong>My Trips</strong> page before your check-in date.
                Refund eligibility depends on the hotel's policy.
              </p>
            </motion.div>

            {/* Ground rules */}
            <motion.div variants={sectionFadeUp} className="py-2">
              <h2 className="text-[17px] font-bold text-gray-900 mb-2">Ground rules</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We ask every guest to remember a few simple things about what makes a great stay.
              </p>
              <motion.ul
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-3 space-y-1.5 text-sm text-gray-600"
              >
                {['Follow the house rules', 'Treat the space with care', 'Communicate with your host'].map((r, i) => (
                  <motion.li
                    key={r}
                    custom={i * 0.07}
                    variants={fadeUp}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {r}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Summary card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[380px] shrink-0"
          >
            <motion.div
              variants={shakeVariants}
              animate={shake ? 'shake' : 'rest'}
              className="border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-28 space-y-5"
            >
              {/* Trust badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-4 border-b border-gray-100"
              >
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6, ease: 'easeInOut' }}
                  className="text-[#FF385C]"
                >
                  <ShieldIcon />
                </motion.span>
                <span>Protected by StayLux Secure Payments</span>
              </motion.div>

              {/* Reservation details */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="space-y-3"
              >
                <h3 className="font-bold text-gray-900 text-[15px]">Your reservation</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Reference</span>
                  <span className="font-mono font-semibold text-gray-900">#{bookingId}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment</span>
                  <span className="text-gray-900 font-medium">Stripe (secure)</span>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA button */}
              <motion.button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                whileHover={!isProcessingPayment ? { scale: 1.02 } : {}}
                whileTap={!isProcessingPayment ? { scale: 0.97 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="relative w-full overflow-hidden bg-gradient-to-r from-[#FF385C] to-[#E61E4D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-[15px]"
              >
                {/* Shimmer sweep when idle */}
                {!isProcessingPayment && (
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.8, ease: 'easeInOut' }}
                  />
                )}

                <AnimatePresence mode="wait">
                  {isProcessingPayment ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Redirecting…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      Confirm and pay
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Secure note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400"
              >
                <LockIcon />
                <span>Secured by</span>
                <StripeLogo />
              </motion.div>

              {/* Fine print */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="text-xs text-gray-400 text-center leading-relaxed"
              >
                By confirming, you agree to StayLux's{' '}
                <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span>{' '}
                and{' '}
                <span className="underline cursor-pointer hover:text-gray-600">Refund Policy</span>.
              </motion.p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}