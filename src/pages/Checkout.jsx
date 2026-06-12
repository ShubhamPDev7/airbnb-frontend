import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Lock / shield icon for trust signal ─────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/payments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jsonResponse = await response.json();
      if (response.ok && jsonResponse.data?.sessionUrl) {
        window.location.href = jsonResponse.data.sessionUrl;
      } else {
        setError('Could not initialize payment. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        {/* ── Back nav ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-800 font-semibold hover:text-gray-500 transition-colors mb-8 mt-4"
        >
          <ChevronLeftIcon />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-8">Confirm and pay</h1>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── LEFT: Payment section ── */}
          <div className="flex-1 w-full min-w-0 space-y-7">

            {/* Booking reference */}
            <div className="flex items-center justify-between py-5 border-b border-gray-200">
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Reservation held</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Complete payment to confirm your stay
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Booking ref</p>
                <p className="font-mono font-bold text-gray-900 text-sm">#{bookingId}</p>
              </div>
            </div>

            {/* Price details */}
            <div className="space-y-4 py-2 border-b border-gray-200 pb-7">
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
            </div>

            {/* Cancellation note */}
            <div className="py-2 border-b border-gray-200 pb-7">
              <h2 className="text-[17px] font-bold text-gray-900 mb-2">Cancellation policy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can cancel your reservation from the <strong>My Trips</strong> page before your check-in date. Refund eligibility depends on the hotel's policy.
              </p>
            </div>

            {/* Ground rules */}
            <div className="py-2">
              <h2 className="text-[17px] font-bold text-gray-900 mb-2">Ground rules</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We ask every guest to remember a few simple things about what makes a great stay.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                {['Follow the house rules', 'Treat the space with care', 'Communicate with your host'].map(r => (
                  <li key={r} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Summary card ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-28 space-y-5">

              {/* Trust badge */}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-4 border-b border-gray-100">
                <ShieldIcon />
                <span>Protected by StayLux Secure Payments</span>
              </div>

              {/* What you're paying for */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-[15px]">Your reservation</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Reference</span>
                  <span className="font-mono font-semibold text-gray-900">#{bookingId}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment</span>
                  <span className="text-gray-900 font-medium">Stripe (secure)</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-[15px]"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Redirecting…</span>
                  </>
                ) : (
                  'Confirm and pay'
                )}
              </button>

              {/* Secure note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <LockIcon />
                <span>Secured by</span>
                <StripeLogo />
              </div>

              {/* Fine print */}
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By confirming, you agree to StayLux's{' '}
                <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span>{' '}
                and{' '}
                <span className="underline cursor-pointer hover:text-gray-600">Refund Policy</span>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}