import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../config/api';
import { extractError } from '../config/apiError';
import { useNavigate } from 'react-router-dom';

/* ── Icons ─────────────────────────────────────────────────── */
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
function NightsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* ── Constants ─────────────────────────────────────────────── */
const FALLBACKS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-c53cd4b85d05?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80",
];

const getThumbnail = (photos, seedId) => {
  const fallback = FALLBACKS[(seedId || 0) % FALLBACKS.length];
  if (!photos || !Array.isArray(photos) || photos.length === 0) return fallback;
  let candidate = photos[0];
  if (!candidate || typeof candidate !== 'string') return fallback;
  candidate = candidate.trim();
  if (candidate.includes("unsplash.com/photos/")) {
    try {
      const parts = candidate.split("unsplash.com/photos/");
      const photoId = parts[1]?.split(/[?#]/)[0];
      if (photoId) return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
    } catch { return fallback; }
  }
  if (candidate.toLowerCase().startsWith("http")) return candidate;
  return fallback;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const diff = Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
};

const STATUS_CONFIG = {
  CONFIRMED:        { label: 'Confirmed',       dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700 ring-green-200' },
  RESERVED:         { label: 'Reserved',        dot: 'bg-amber-500',  pill: 'bg-amber-50 text-amber-700 ring-amber-200' },
  CANCELLED:        { label: 'Cancelled',       dot: 'bg-red-500',    pill: 'bg-red-50 text-red-600 ring-red-200' },
  PAYMENTS_PENDING: { label: 'Payment Pending', dot: 'bg-blue-500',   pill: 'bg-blue-50 text-blue-700 ring-blue-200' },
  GUESTS_ADDED:     { label: 'Guests Added',    dot: 'bg-purple-500', pill: 'bg-purple-50 text-purple-700 ring-purple-200' },
};
const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || { label: status || 'Pending', dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600 ring-gray-200' };

/* ── Animation variants ─────────────────────────────────────── */
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200 rounded-2xl" />
      <div className="pt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );
}

/* ── Trip Card ─────────────────────────────────────────────── */
function TripCard({ booking, onCancel, isCanceling }) {
  const isPast = new Date(booking.checkOutDate) < new Date();
  const isCancelled = booking.bookingStatus === 'CANCELLED';
  const statusCfg = getStatusConfig(booking.bookingStatus);
  const nights = getNights(booking.checkInDate, booking.checkOutDate);
  const canCancel = !isPast && !isCancelled &&
    ['CONFIRMED', 'RESERVED', 'PAYMENTS_PENDING', 'GUESTS_ADDED'].includes(booking.bookingStatus);

  return (
    <motion.article
      variants={cardVariants}
      whileHover={!isCancelled ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      className={`group rounded-2xl overflow-hidden cursor-default ${isCancelled ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden rounded-2xl bg-gray-100">
        <motion.img
          src={getThumbnail(booking.hotel?.photos, booking.id)}
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACKS[(booking.id || 0) % FALLBACKS.length]; }}
          alt={booking.hotel?.name || 'Hotel'}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 20 }}
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset backdrop-blur-sm bg-white/80 ${statusCfg.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </motion.div>

        {/* Booking ID */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wide">
          #{booking.id}
        </div>

        {/* Nights badge */}
        {nights && !isCancelled && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
            <NightsIcon />
            {nights} night{nights !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-[15px] truncate leading-snug">
              {booking.hotel?.city || 'Destination'}
            </h3>
            <p className="text-gray-500 text-sm truncate mt-0.5 flex items-center gap-1">
              <MapPinIcon />
              {booking.hotel?.name || 'Hotel Booking'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-gray-900 font-semibold text-[15px]">
              ₹{booking.amount?.toLocaleString('en-IN') || '0'}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">total</p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          <CalendarIcon />
          <span>
            {formatDate(booking.checkInDate)}
            <span className="mx-1 text-gray-300">→</span>
            {formatDate(booking.checkOutDate)}
          </span>
        </div>

        <hr className="my-2.5 border-gray-100" />

        <div className="flex items-center justify-between min-h-[28px]">
          {canCancel ? (
            <motion.button
              onClick={() => onCancel(booking.id)}
              disabled={isCanceling}
              whileHover={{ x: 1 }}
              whileTap={{ scale: 0.96 }}
              className="text-sm font-semibold text-gray-800 underline underline-offset-2 hover:text-gray-600 disabled:opacity-40 transition-colors"
            >
              {isCanceling ? 'Canceling…' : 'Cancel reservation'}
            </motion.button>
          ) : (
            <span className="text-sm text-gray-400">
              {isCancelled ? 'Refund processed' : isPast ? 'Completed' : ''}
            </span>
          )}
          {isPast && !isCancelled && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-semibold text-[#FF385C] hover:text-[#E61E4D] transition-colors"
            >
              Rate stay
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Filter tab ─────────────────────────────────────────────── */
function FilterTab({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: active ? '#111827' : '#ffffff',
        color: active ? '#ffffff' : '#374151',
        borderColor: active ? '#111827' : '#d1d5db',
      }}
      transition={{ duration: 0.18 }}
      className="px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap"
    >
      {children}
    </motion.button>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function MyTrips() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tripToCancel, setTripToCancel] = useState(null);

  useEffect(() => { fetchMyTrips(); }, []);

  const fetchMyTrips = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch(apiUrl('/users/myBookings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonResponse = await response.json();
      if (response.ok && jsonResponse.data) {
        setBookings(jsonResponse.data.sort((a, b) => b.id - a.id));
      } else {
        setError(extractError(jsonResponse, 'Failed to load trips.'));
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelModal = (bookingId) => setTripToCancel(bookingId);

  const confirmCancel = async () => {
    if (!tripToCancel) return;
    setCancelingId(tripToCancel);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(apiUrl(`/bookings/${tripToCancel}/cancel`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchMyTrips();
      } else {
        const jsonResponse = await response.json();
        alert(extractError(jsonResponse, 'Could not cancel booking.'));
      }
    } catch {
      alert('Network error.');
    } finally {
      setCancelingId(null);
      setTripToCancel(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const isPast = new Date(b.checkOutDate) < new Date();
    const isCancelled = b.bookingStatus === 'CANCELLED';
    if (filter === 'upcoming')  return !isPast && !isCancelled;
    if (filter === 'past')      return isPast && !isCancelled;
    if (filter === 'cancelled') return isCancelled;
    return true;
  });

  const counts = {
    all:       bookings.length,
    upcoming:  bookings.filter(b => !(new Date(b.checkOutDate) < new Date()) && b.bookingStatus !== 'CANCELLED').length,
    past:      bookings.filter(b =>  new Date(b.checkOutDate) < new Date()  && b.bookingStatus !== 'CANCELLED').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'CANCELLED').length,
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="pt-28 pb-20 px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1280px] mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-8"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const showEmpty = !error && bookings.length === 0;

  return (
    <div className="pt-28 pb-20 px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1280px] mx-auto min-h-screen relative">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Trips</h1>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-start gap-2 overflow-hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {showEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center py-24 max-w-sm mx-auto"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            className="w-16 h-16 mb-6 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No trips yet</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            When you book a stay, your trips will appear here. Ready to start exploring?
          </p>
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="bg-[#FF385C] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#E61E4D] transition-colors"
          >
            Explore stays
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="flex gap-2 overflow-x-auto pb-1 mb-6"
            style={{ scrollbarWidth: 'none' }}
          >
            {[
              { key: 'all',       label: `All (${counts.all})` },
              { key: 'upcoming',  label: 'Upcoming' },
              { key: 'past',      label: 'Past' },
              ...(counts.cancelled > 0 ? [{ key: 'cancelled', label: 'Cancelled' }] : []),
            ].map(tab => (
              <FilterTab key={tab.key} active={filter === tab.key} onClick={() => setFilter(tab.key)}>
                {tab.label}
              </FilterTab>
            ))}
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {filteredBookings.length === 0 ? (
              <motion.div
                key="empty-filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-gray-500 text-sm"
              >
                No trips in this category.
              </motion.div>
            ) : (
              <motion.div
                key={filter}
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8"
              >
                {filteredBookings.map((booking) => (
                  <TripCard
                    key={booking.id}
                    booking={booking}
                    onCancel={openCancelModal}
                    isCanceling={cancelingId === booking.id}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Cancel Modal ── */}
      <AnimatePresence>
        {tripToCancel && (
          <motion.div
            key="cancel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setTripToCancel(null)}
          >
            <motion.div
              key="cancel-modal"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Cancel Reservation</h3>
                <motion.button
                  onClick={() => setTripToCancel(null)}
                  whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full transition"
                >
                  <XIcon />
                </motion.button>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-[15px] leading-relaxed">
                  Are you sure you want to cancel this trip? This action cannot be undone, and refunds are subject to the host's cancellation policy.
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                <motion.button
                  onClick={() => setTripToCancel(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition text-sm"
                >
                  Keep Reservation
                </motion.button>
                <motion.button
                  onClick={confirmCancel}
                  disabled={cancelingId === tripToCancel}
                  whileHover={cancelingId !== tripToCancel ? { scale: 1.02 } : {}}
                  whileTap={cancelingId !== tripToCancel ? { scale: 0.97 } : {}}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#FF385C] hover:bg-[#E61E4D] transition text-sm flex items-center gap-2 disabled:opacity-70"
                >
                  <AnimatePresence mode="wait">
                    {cancelingId === tripToCancel ? (
                      <motion.span
                        key="cancelling"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Cancelling…
                      </motion.span>
                    ) : (
                      <motion.span key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Yes, Cancel
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}