import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../config/api';
import { extractError } from '../config/apiError';
import { useParams, useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import { useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   AMENITY ICONS
───────────────────────────────────────────────────────────── */
const AMENITY_ICONS = {
  wifi: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  ),
  pool: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 17.25v-9M3 8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25M3 8.25h18" />
    </svg>
  ),
  parking: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  ac: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  gym: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  default: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function getAmenityIcon(amenity) {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return AMENITY_ICONS.wifi;
  if (lower.includes('pool')) return AMENITY_ICONS.pool;
  if (lower.includes('park')) return AMENITY_ICONS.parking;
  if (lower.includes('ac') || lower.includes('air')) return AMENITY_ICONS.ac;
  if (lower.includes('gym') || lower.includes('fitness')) return AMENITY_ICONS.gym;
  return AMENITY_ICONS.default;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-c53cd4b85d05?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=1200&q=80',
];

/* ─────────────────────────────────────────────────────────────
   DATE UTILS
───────────────────────────────────────────────────────────── */
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseYMD(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function isBetween(date, start, end) {
  return date > start && date < end;
}

function nightsBetween(start, end) {
  return Math.round((end - start) / 86400000);
}

function formatDisplayDate(ymd) {
  if (!ymd) return '';
  const d = parseYMD(ymd);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const bentoVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────────────────────────────────────────
   SCROLL-TRIGGERED SECTION WRAPPER
───────────────────────────────────────────────────────────── */
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CALENDAR PICKER COMPONENT
───────────────────────────────────────────────────────────── */
function CalendarPicker({ checkIn, checkOut, onSave, onClose, pricePerNight }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [hoverDate, setHoverDate] = useState(null);
  const [selIn,  setSelIn]  = useState(checkIn  || null);
  const [selOut, setSelOut] = useState(checkOut || null);
  const [step, setStep] = useState(checkIn && !checkOut ? 'out' : 'in');

  const initDate = selIn ? parseYMD(selIn) : today;
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const months = [];
  let y = today.getFullYear(), m = today.getMonth();
  for (let i = 0; i < 12; i++) {
    months.push({ year: y, month: m });
    m++;
    if (m > 11) { m = 0; y++; }
  }

  const handleDayClick = useCallback((dateStr) => {
    const clicked = parseYMD(dateStr);
    if (clicked < today) return;
    if (step === 'in') {
      setSelIn(dateStr);
      setSelOut(null);
      setStep('out');
    } else {
      if (selIn && clicked <= parseYMD(selIn)) {
        setSelIn(dateStr);
        setSelOut(null);
        setStep('out');
      } else {
        setSelOut(dateStr);
        setStep('in');
      }
    }
  }, [step, selIn, today]);

  const handleClear = () => {
    setSelIn(null);
    setSelOut(null);
    setStep('in');
    setHoverDate(null);
  };

  const handleSave = () => {
    onSave(selIn || '', selOut || '');
    onClose();
  };

  const nights = selIn && selOut ? nightsBetween(parseYMD(selIn), parseYMD(selOut)) : 0;
  const total  = nights && pricePerNight ? nights * pricePerNight : 0;
  const originalTotal = total ? Math.round(total * 1.18) : 0;

  let headerTitle, headerSub;
  if (!selIn) {
    headerTitle = 'Select check-in date';
    headerSub   = 'Add your travel dates for exact pricing';
  } else if (!selOut) {
    headerTitle = 'Select checkout date';
    headerSub   = 'Add your travel dates for exact pricing';
  } else {
    const inFmt  = formatDisplayDate(selIn);
    const outFmt = formatDisplayDate(selOut);
    headerTitle = `${nights} night${nights !== 1 ? 's' : ''}`;
    headerSub   = `${inFmt} – ${outFmt}`;
  }

  const inDate  = selIn  ? parseYMD(selIn)  : null;
  const outDate = selOut ? parseYMD(selOut) : null;
  const hDate   = hoverDate ? parseYMD(hoverDate) : null;
  const rangeEnd = outDate || (step === 'out' && hDate && inDate && hDate > inDate ? hDate : null);

  function getDayState(dateStr) {
    const d = parseYMD(dateStr);
    const isPast = d < today;
    const isStart = inDate && isSameDay(d, inDate);
    const isEnd   = outDate && isSameDay(d, outDate);
    const inRange = inDate && rangeEnd && isBetween(d, inDate, rangeEnd);
    const isHoverEnd = step === 'out' && hDate && inDate && isSameDay(d, hDate) && hDate > inDate;
    return { isPast, isStart, isEnd, inRange, isHoverEnd };
  }

  return (
    <motion.div
      className="fixed inset-0 z-[300] bg-white flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button onClick={handleClear} className="text-sm font-semibold underline text-gray-700 hover:text-gray-900">
            Clear dates
          </button>
        </div>
        <motion.h2
          key={headerTitle}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-bold text-gray-900"
        >
          {headerTitle}
        </motion.h2>
        <p className="text-sm text-gray-500 mt-0.5">{headerSub}</p>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 border-b border-gray-100 px-2 py-2 shrink-0">
        {DAY_NAMES.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Scrollable months */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {months.map(({ year, month }) => {
          const daysInMonth  = getDaysInMonth(year, month);
          const firstDayOfWk = getFirstDayOfWeek(year, month);
          const cells = [];
          for (let i = 0; i < firstDayOfWk; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

          return (
            <div key={`${year}-${month}`} className="mb-6">
              <div className="text-base font-bold text-gray-900 py-3 px-2">
                {MONTH_NAMES[month]} {year}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} />;
                  const dateStr = toYMD(date);
                  const { isPast, isStart, isEnd, inRange, isHoverEnd } = getDayState(dateStr);
                  const isSelected = isStart || isEnd;
                  const isRangeEnd = isEnd || isHoverEnd;
                  const rangeLeftHalf  = isRangeEnd && !isStart && (inRange || isEnd);
                  const rangeRightHalf = isStart && (outDate || (step === 'out' && rangeEnd));

                  return (
                    <div
                      key={dateStr}
                      className="relative flex items-center justify-center"
                      style={{ height: '52px' }}
                      onMouseEnter={() => !isPast && step === 'out' && inDate && setHoverDate(dateStr)}
                      onMouseLeave={() => setHoverDate(null)}
                    >
                      {inRange && <div className="absolute inset-y-2 inset-x-0 bg-gray-100" />}
                      {rangeRightHalf && <div className="absolute inset-y-2 right-0 left-1/2 bg-gray-100" />}
                      {rangeLeftHalf  && <div className="absolute inset-y-2 left-0 right-1/2 bg-gray-100" />}
                      <motion.button
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && handleDayClick(dateStr)}
                        whileTap={!isPast ? { scale: 0.88 } : {}}
                        className={`
                          relative z-10 w-10 h-10 flex items-center justify-center rounded-full
                          text-sm font-medium transition-colors select-none
                          ${isPast       ? 'text-gray-300 cursor-default line-through' : 'cursor-pointer'}
                          ${isSelected   ? 'bg-gray-900 text-white font-bold' : ''}
                          ${!isSelected && !isPast && (inRange || isHoverEnd) ? 'hover:bg-gray-200 text-gray-900' : ''}
                          ${!isSelected && !isPast && !inRange && !isHoverEnd ? 'hover:bg-gray-100 text-gray-900' : ''}
                        `}
                      >
                        {date.getDate()}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200 px-4 py-4 flex items-center justify-between bg-white">
        <div className="text-sm">
          {total > 0 ? (
            <>
              <span className="line-through text-gray-400 mr-1.5">₹{originalTotal.toLocaleString('en-IN')}</span>
              <span className="font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
              <span className="text-gray-500 ml-1">for {nights} night{nights !== 1 ? 's' : ''}</span>
            </>
          ) : (
            <span className="text-gray-500">Add dates for prices</span>
          )}
        </div>
        <motion.button
          onClick={handleSave}
          disabled={!selIn || !selOut}
          whileTap={selIn && selOut ? { scale: 0.95 } : {}}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition ${
            selIn && selOut ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAR ICON
───────────────────────────────────────────────────────────── */
function StarIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={`fill-current ${className}`}>
      <path d="M16 1l4.5 9.5 10.5 1.5-7.5 7.5 2 10.5-9.5-5-9.5 5 2-10.5-7.5-7.5 10.5-1.5z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOM TYPE PICKER — inline expand, no absolute dropdown
   Works inside overflow-hidden/overflow-y-auto containers
───────────────────────────────────────────────────────────── */
function RoomTypePicker({ rooms, selectedRoomId, setSelectedRoomId }) {
  const [open, setOpen] = useState(false);
  const selected = rooms.find(r => String(r.id) === String(selectedRoomId)) || rooms[0];

  return (
    <div className="border-b border-gray-300">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full p-3 text-left hover:bg-gray-50 transition flex items-center justify-between"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Room Type</div>
          <div className="mt-1 text-sm font-medium text-gray-900 truncate pr-2">
            {selected ? `${selected.type} — ₹${Math.round(selected.basePrice).toLocaleString('en-IN')}` : 'Select room'}
          </div>
        </div>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={2.5} stroke="currentColor"
          className="w-4 h-4 shrink-0 text-gray-500 ml-2"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
      </button>

      {/* Inline expanded options — push content down, no clipping issues */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="room-options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-gray-100"
          >
            {rooms.map((room, i) => {
              const isSelected = String(room.id) === String(selectedRoomId);
              return (
                <motion.button
                  key={room.id}
                  type="button"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.16 }}
                  onClick={() => { setSelectedRoomId(room.id); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition
                    ${isSelected ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'}
                    ${i > 0 ? 'border-t border-gray-100' : ''}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Check indicator */}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition
                      ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-gray-900" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{room.type}</div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {room.description || 'Standard room'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-bold text-sm">₹{Math.round(room.basePrice).toLocaleString('en-IN')}</div>
                    <div className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>/night</div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BOOKING FORM
───────────────────────────────────────────────────────────── */
function BookingForm({
  rooms, checkInDate, checkOutDate, selectedRoomId, roomsCount,
  setCheckInDate, setCheckOutDate, setSelectedRoomId, setRoomsCount,
  bookingError, isReserving, onReserve, pricePerNight,
  nightCount, totalBeforeTax, serviceFee,
  openCalendar,
  compact = false,
}) {
  return (
    <>
      <AnimatePresence>
        {bookingError && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium overflow-hidden"
          >
            {bookingError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
        <div className="flex border-b border-gray-300">
          <button type="button" onClick={openCalendar} className="flex-1 p-3 border-r border-gray-300 text-left hover:bg-gray-50 transition">
            <div className="text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Check-in</div>
            <div className={`mt-1 text-sm font-medium ${checkInDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {checkInDate ? formatDisplayDate(checkInDate) : 'Add date'}
            </div>
          </button>
          <button type="button" onClick={openCalendar} className="flex-1 p-3 text-left hover:bg-gray-50 transition">
            <div className="text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Check-out</div>
            <div className={`mt-1 text-sm font-medium ${checkOutDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {checkOutDate ? formatDisplayDate(checkOutDate) : 'Add date'}
            </div>
          </button>
        </div>

        <RoomTypePicker rooms={rooms} selectedRoomId={selectedRoomId} setSelectedRoomId={setSelectedRoomId} />

        <div className="p-3 flex justify-between items-center">
          <div>
            <label className="block text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Rooms</label>
            <div className="text-sm mt-0.5 font-medium">{roomsCount} room{roomsCount > 1 ? 's' : ''}</div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
              whileTap={{ scale: 0.88 }}
              className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-lg hover:border-gray-900 transition"
            >−</motion.button>
            <span className="font-semibold w-4 text-center">{roomsCount}</span>
            <motion.button
              type="button"
              onClick={() => setRoomsCount(roomsCount + 1)}
              whileTap={{ scale: 0.88 }}
              className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-lg hover:border-gray-900 transition"
            >+</motion.button>
          </div>
        </div>
      </div>

      <motion.button
        onClick={onReserve}
        disabled={isReserving}
        whileHover={!isReserving ? { scale: 1.015 } : {}}
        whileTap={!isReserving ? { scale: 0.97 } : {}}
        className="w-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white font-semibold text-base py-3.5 rounded-xl hover:opacity-90 transition mt-1 disabled:opacity-60"
      >
        {isReserving ? 'Processing…' : 'Reserve'}
      </motion.button>
      <p className="text-center text-sm text-gray-500 mt-3">You won't be charged yet</p>

      <AnimatePresence>
        {totalBeforeTax > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 flex flex-col gap-2 text-sm text-gray-700 overflow-hidden"
          >
            <hr className="border-gray-200 mb-1" />
            <div className="flex justify-between">
              <span className="underline">
                ₹{pricePerNight.toLocaleString('en-IN')} × {nightCount} night{nightCount > 1 ? 's' : ''} × {roomsCount} room{roomsCount > 1 ? 's' : ''}
              </span>
              <span>₹{totalBeforeTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Service fee</span>
              <span>₹{serviceFee.toLocaleString('en-IN')}</span>
            </div>
            <hr className="border-gray-200 my-1" />
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total before taxes</span>
              <span>₹{(totalBeforeTax + serviceFee).toLocaleString('en-IN')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function HotelDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [hotelInfo,        setHotelInfo]       = useState(null);
  const [isLoading,        setIsLoading]       = useState(true);

  const [checkInDate,      setCheckInDate]     = useState('');
  const [checkOutDate,     setCheckOutDate]    = useState('');
  const [roomsCount,       setRoomsCount]      = useState(1);
  const [selectedRoomId,   setSelectedRoomId]  = useState('');
  const [bookingError,     setBookingError]    = useState('');
  const [isReserving,      setIsReserving]     = useState(false);

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isCalendarOpen,    setIsCalendarOpen]    = useState(false);
  const [isLiked,           setIsLiked]           = useState(false);
  const [showAllPhotos,     setShowAllPhotos]     = useState(false);
  const [activePhotoIndex,  setActivePhotoIndex]  = useState(0);
  const [galleryDirection,  setGalleryDirection]  = useState(1);
  const bentoRef = useRef(null);

  /* ── Fetch hotel ── */
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response     = await fetch(apiUrl(`/hotels/${id}/info`));
        const jsonResponse = await response.json();
        if (jsonResponse.data) {
          setHotelInfo(jsonResponse.data);
          if (jsonResponse.data.rooms?.length > 0) {
            setSelectedRoomId(jsonResponse.data.rooms[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching hotel info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotelDetails();
  }, [id]);

  /* ── Reserve ── */
  const handleReserve = async () => {
    setBookingError('');
    if (!checkInDate || !checkOutDate || !selectedRoomId) {
      setBookingError('Please select check-in, check-out dates and a room type.');
      return;
    }
    if (checkInDate >= checkOutDate) {
      setBookingError('Check-out must be after check-in.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setIsReserving(true);
    try {
      const response = await fetch(apiUrl('/bookings/init'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          hotelId:    Number(id),
          roomId:     Number(selectedRoomId),
          checkInDate, checkOutDate,
          roomsCount: Number(roomsCount),
        }),
      });
      const data = await response.json();
      if (response.ok) navigate(`/checkout/${data.data.id}`);
      else setBookingError(extractError(data, 'Failed to initialize booking.'));
    } catch {
      setBookingError('Network error. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  const handleCalendarSave = useCallback((inDate, outDate) => {
    setCheckInDate(inDate);
    setCheckOutDate(outDate);
    setBookingError('');
  }, []);

  /* ── Photo navigation helpers ── */
  const goPrev = (e) => {
    if (e) e.stopPropagation();
    setGalleryDirection(-1);
    setActivePhotoIndex(i => (i - 1 + (hotelInfo ? 5 : 1)) % (hotelInfo ? 5 : 1));
  };
  const goNext = (e) => {
    if (e) e.stopPropagation();
    setGalleryDirection(1);
    setActivePhotoIndex(i => (i + 1) % (hotelInfo ? 5 : 1));
  };

  /* ── Loading / not found ── */
  if (isLoading) return (
    <div className="h-screen w-full flex justify-center items-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="rounded-full h-10 w-10 border-2 border-[#FF385C] border-t-transparent"
      />
    </div>
  );
  if (!hotelInfo) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 text-center font-semibold text-gray-900"
    >
      Hotel not found!
    </motion.div>
  );

  const hotel = hotelInfo.hotel ?? hotelInfo;
  const rooms = hotelInfo.rooms ?? [];

  const getImg = (index) => {
    const fallback  = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    const candidate = hotel?.photos?.[index];
    if (!candidate || typeof candidate !== 'string' || candidate.trim() === '') return fallback;
    // Let <img onError> catch broken URLs; just return the candidate
    return candidate;
  };

  // Fallback handler for all img tags — cycles to next fallback image
  const handleImgError = (e, index) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  const allPhotos = Array.from({ length: 5 }, (_, i) => getImg(i));
  const rating    = (4.5 + (hotel.id % 5) / 10).toFixed(1);

  const nightCount = checkInDate && checkOutDate
    ? Math.max(1, nightsBetween(parseYMD(checkInDate), parseYMD(checkOutDate)))
    : null;

  const selectedRoom   = rooms.find(r => String(r.id) === String(selectedRoomId));
  const pricePerNight  = selectedRoom
    ? Math.round(selectedRoom.basePrice)
    : (rooms.length > 0 ? Math.round(rooms[0].basePrice) : 0);
  const totalBeforeTax = nightCount ? pricePerNight * nightCount * roomsCount : null;
  const serviceFee     = totalBeforeTax ? Math.round(totalBeforeTax * 0.12) : null;

  const bookingFormProps = {
    rooms, checkInDate, checkOutDate, selectedRoomId, roomsCount,
    setCheckInDate, setCheckOutDate, setSelectedRoomId, setRoomsCount,
    bookingError, isReserving, onReserve: handleReserve,
    pricePerNight, nightCount, totalBeforeTax, serviceFee,
    openCalendar: () => setIsCalendarOpen(true),
  };

  const dateLabel = checkInDate && checkOutDate
    ? `${checkInDate.slice(5).replace('-', '/')} – ${checkOutDate.slice(5).replace('-', '/')}`
    : 'Select dates';

  // Gallery slide variants
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.28 } }),
  };

  return (
    <div className="relative pb-28 lg:pb-10">

      {/* ── DESKTOP STICKY DETAIL BAR (always visible) ── */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-10 lg:px-20 w-full flex items-center justify-between h-16 gap-8">
          {/* Hotel name */}
          <h2 className="font-semibold text-gray-900 text-base truncate shrink-0 max-w-[280px]">{hotel?.name}</h2>

          {/* Section jump links */}
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600 overflow-x-auto">
            {['Photos', 'Amenities', 'Rooms', 'Reviews'].map(s => (
              <button
                key={s}
                onClick={() => {
                  const el = document.getElementById(`section-${s.toLowerCase()}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="hover:text-gray-900 transition whitespace-nowrap pb-0.5 border-b-2 border-transparent hover:border-gray-900"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mini reserve CTA */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">₹{pricePerNight.toLocaleString('en-IN')}</span>
              <span className="text-gray-500"> / night</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
            >
              Reserve
            </motion.button>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="md:hidden fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none"
      >
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto bg-white/95 backdrop-blur shadow-md p-2.5 rounded-full hover:bg-gray-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button className="bg-white/95 backdrop-blur shadow-md p-2.5 rounded-full hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
          <motion.button
            onClick={() => setIsLiked(!isLiked)}
            whileTap={{ scale: 1.35 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="bg-white/95 backdrop-blur shadow-md p-2.5 rounded-full hover:bg-gray-100 transition"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill={isLiked ? '#FF385C' : 'none'}
              stroke={isLiked ? '#FF385C' : 'currentColor'}
              strokeWidth={1.5} className="w-4 h-4"
              animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </motion.svg>
          </motion.button>
        </div>
      </motion.div>

      {/* ── MOBILE PHOTO CAROUSEL (slide transition) ── */}
      <div className="md:hidden relative w-full h-[300px] bg-gray-100 overflow-hidden">
        <AnimatePresence initial={false} custom={galleryDirection} mode="popLayout">
          <motion.img
            key={activePhotoIndex}
            src={allPhotos[activePhotoIndex]}
            alt={hotel.name}
            custom={galleryDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
          />
        </AnimatePresence>
        <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {allPhotos.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setGalleryDirection(i > activePhotoIndex ? 1 : -1); setActivePhotoIndex(i); }}
              animate={{ width: i === activePhotoIndex ? 20 : 6, opacity: i === activePhotoIndex ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
              className="h-1.5 rounded-full bg-white"
            />
          ))}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
          {activePhotoIndex + 1} / {allPhotos.length}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto md:px-10 lg:px-20 pt-6 md:pt-20">

        {/* ── DESKTOP HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex justify-between items-center mb-5 px-0"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition border border-gray-200 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-[26px] font-semibold text-gray-900 leading-tight">{hotel.name}</h1>
          </div>
          <div className="flex gap-2 text-sm font-medium text-gray-800 shrink-0">
            <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition underline">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Share
            </button>
            <motion.button
              onClick={() => setIsLiked(!isLiked)}
              whileTap={{ scale: 1.25 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition underline"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill={isLiked ? '#FF385C' : 'none'}
                stroke={isLiked ? '#FF385C' : 'currentColor'}
                strokeWidth={1.5} className="w-4 h-4"
                animate={isLiked ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </motion.svg>
              {isLiked ? 'Saved' : 'Save'}
            </motion.button>
          </div>
        </motion.div>

        {/* ── DESKTOP PHOTO BENTO GRID (staggered entrance) ── */}
        <div ref={bentoRef} id="section-photos" className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[460px] rounded-2xl overflow-hidden mb-10 relative">
          <motion.div
            custom={0}
            variants={bentoVariants}
            initial="hidden"
            animate="visible"
            className="col-span-2 row-span-2 overflow-hidden"
          >
            <motion.img
              src={allPhotos[0]}
              alt="Main"
              className="w-full h-full object-cover cursor-pointer"
              whileHover={{ scale: 1.03, brightness: 0.95 }}
              transition={{ duration: 0.4 }}
              onClick={() => setShowAllPhotos(true)}
              onError={(e) => handleImgError(e, 0)}
            />
          </motion.div>

          {/* Side photos */}
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={bentoVariants}
              initial="hidden"
              animate="visible"
              className="col-span-1 row-span-1 overflow-hidden"
            >
              <motion.img
                src={allPhotos[i]}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.35 }}
                onClick={() => { setActivePhotoIndex(i); setShowAllPhotos(true); }}
                onError={(e) => handleImgError(e, i)}
              />
            </motion.div>
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            Show all photos
          </motion.button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-col lg:flex-row gap-12 px-4 md:px-0 relative">

          {/* LEFT COLUMN */}
          <div className="flex-1 lg:max-w-[60%]">

            {/* Mobile title */}
            <RevealSection className="md:hidden mb-4">
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{hotel.name}</h1>
            </RevealSection>

            {/* Subtitle + rating */}
            <RevealSection className="mb-5">
              <h2 className="text-xl md:text-[22px] font-semibold text-gray-900 mb-1">
                Entire place in {hotel.city}, India
              </h2>
              <p className="text-gray-500 text-sm">Managed property · {rooms.length} room type{rooms.length > 1 ? 's' : ''} available</p>
              <div className="flex items-center gap-1.5 mt-2 font-semibold text-gray-900 text-sm">
                <StarIcon />
                {rating}
                <span className="font-normal text-gray-500">·</span>
                <span className="underline cursor-pointer text-gray-900">14 reviews</span>
                <span className="font-normal text-gray-500 mx-1">·</span>
                <span className="text-gray-700 font-normal">{hotel.city}, India</span>
              </div>
            </RevealSection>

            <hr className="border-gray-200" />

            {/* Host card */}
            <RevealSection className="py-6 flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF385C] to-[#E61E4D] flex items-center justify-center text-white font-bold text-lg shrink-0"
              >
                {hotel.name?.charAt(0) || 'H'}
              </motion.div>
              <div>
                <div className="font-semibold text-gray-900">Hosted by {hotel.name?.split(' ')[0] || 'Host'}</div>
                <div className="text-sm text-gray-500">Superhost · 3 years hosting</div>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1 text-sm font-medium">
                <StarIcon className="w-3.5 h-3.5" />
                {rating} · Superhost
              </div>
            </RevealSection>

            <hr className="border-gray-200" />

            {/* Feature highlights */}
            <RevealSection className="py-6">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="flex flex-col gap-4"
              >
                {[
                  { icon: '🏠', title: 'Entire place',   desc: "You'll have the place to yourself." },
                  { icon: '✨', title: 'Enhanced Clean', desc: 'Committed to a higher standard of clean.' },
                  { icon: '🔑', title: 'Self check-in',  desc: 'Check yourself in with the key lockbox.' },
                ].map(f => (
                  <motion.div key={f.title} variants={fadeUp} className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{f.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{f.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </RevealSection>

            <hr className="border-gray-200" />

            {/* Description */}
            <RevealSection className="py-6">
              <p className="text-gray-700 leading-relaxed text-base">
                Bring the whole family to this great place with lots of room for fun.
                Beautifully located in the heart of {hotel.city}, this property offers
                unmatched convenience and luxury. Every detail has been thoughtfully
                curated for a memorable stay.
              </p>
            </RevealSection>

            <hr className="border-gray-200" />

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <>
                <div id="section-amenities" />
                <RevealSection className="py-6">
                  <h3 className="text-xl font-semibold mb-5">What this place offers</h3>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6"
                  >
                    {hotel.amenities.slice(0, 10).map((amenity, i) => (
                      <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 text-gray-700 text-base">
                        <span className="text-gray-900">{getAmenityIcon(amenity)}</span>
                        {amenity}
                      </motion.div>
                    ))}
                  </motion.div>
                  {hotel.amenities.length > 10 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-6 border border-gray-900 rounded-xl px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      Show all {hotel.amenities.length} amenities
                    </motion.button>
                  )}
                </RevealSection>
                <hr className="border-gray-200" />
              </>
            )}

            {/* Available rooms */}
            {rooms.length > 0 && (
              <>
                <div id="section-rooms" />
                <RevealSection className="py-6">
                  <h3 className="text-xl font-semibold mb-5">Available rooms</h3>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    className="flex flex-col gap-3"
                  >
                    {rooms.map(room => {
                      const isSel = String(selectedRoomId) === String(room.id);
                      return (
                        <motion.div
                          key={room.id}
                          variants={fadeUp}
                          onClick={() => setSelectedRoomId(room.id)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          animate={{
                            borderColor: isSel ? '#111' : '#e5e7eb',
                            backgroundColor: isSel ? '#f9fafb' : '#fff',
                          }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {/* Selection indicator */}
                            <motion.div
                              animate={{
                                backgroundColor: isSel ? '#111' : '#fff',
                                borderColor: isSel ? '#111' : '#d1d5db',
                                scale: isSel ? 1 : 0.85,
                              }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                            >
                              {isSel && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </motion.div>
                            <div>
                              <div className="font-semibold text-gray-900">{room.type}</div>
                              <div className="text-sm text-gray-500 mt-0.5">{room.description || 'Standard room'}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="font-bold text-gray-900">₹{Math.round(room.basePrice).toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-500">/ night</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </RevealSection>
                <hr className="border-gray-200" />
              </>
            )}

            {/* Reviews */}
            <div id="section-reviews" />
            <RevealSection className="py-6">
              <div className="flex items-center gap-2 mb-6">
                <StarIcon />
                <span className="text-xl font-semibold">{rating}</span>
                <span className="text-gray-500">·</span>
                <span className="text-xl font-semibold">14 reviews</span>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {[
                  { name: 'Priya S.',  date: 'May 2025',      review: 'Absolutely beautiful property! The amenities were top-notch and the location was perfect.' },
                  { name: 'Rahul M.',  date: 'April 2025',    review: 'Had a wonderful stay. Very clean, well-maintained and the host was extremely responsive.' },
                  { name: 'Ananya K.', date: 'March 2025',    review: "Loved the interiors and the overall vibe. Would definitely book again for my next trip!" },
                  { name: 'Vikram P.', date: 'February 2025', review: 'Great value for money. The beds were comfortable and the kitchen was fully stocked.' },
                ].map(r => (
                  <motion.div key={r.name} variants={fadeUp}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-sm shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.date}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.review}</p>
                  </motion.div>
                ))}
              </motion.div>
            </RevealSection>
          </div>

          {/* ── DESKTOP BOOKING WIDGET ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block w-full max-w-[36%] relative shrink-0"
          >
            <div className="sticky top-32">
              <div id="booking-widget" className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 pb-7">
                <div className="flex items-baseline gap-1 mb-1">
                  {pricePerNight > 0
                    ? <><span className="text-[22px] font-bold text-gray-900">₹{pricePerNight.toLocaleString('en-IN')}</span><span className="text-gray-500 text-sm"> / night</span></>
                    : <span className="text-[22px] font-bold text-gray-900">Sold Out</span>
                  }
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-5">
                  <StarIcon className="w-3.5 h-3.5 text-gray-900" />
                  <span className="font-semibold text-gray-900">{rating}</span>
                  <span>·</span>
                  <span className="underline cursor-pointer">14 reviews</span>
                </div>
                <BookingForm {...bookingFormProps} />
              </div>
              <div className="text-center mt-4">
                <button className="text-sm text-gray-500 underline hover:text-gray-700">Report this listing</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-5 py-4 z-50 flex justify-between items-center"
      >
        <div>
          <div>
            <span className="font-bold text-[17px] text-gray-900">
              {pricePerNight > 0 ? `₹${pricePerNight.toLocaleString('en-IN')}` : '—'}
            </span>
            <span className="text-sm text-gray-600"> / night</span>
          </div>
          <button
            className="text-sm font-semibold underline text-gray-900 mt-0.5"
            onClick={() => setIsMobileSheetOpen(true)}
          >
            {dateLabel}
          </button>
        </div>
        <motion.button
          onClick={() => setIsMobileSheetOpen(true)}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white px-8 py-3 rounded-xl font-bold text-[15px] hover:opacity-90 transition"
        >
          Reserve
        </motion.button>
      </motion.div>

      {/* ── MOBILE BOOKING SHEET ── */}
      <AnimatePresence>
        {isMobileSheetOpen && (
          <>
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-[200]"
              onClick={() => setIsMobileSheetOpen(false)}
            />
            <motion.div
              key="sheet-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="lg:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-3xl overflow-hidden flex flex-col z-[201]"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-200 shrink-0">
                <button onClick={() => setIsMobileSheetOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-lg text-gray-900">₹{pricePerNight.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-gray-500">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <StarIcon className="w-3.5 h-3.5" />
                  <span className="font-semibold">{rating}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5 pb-4">
                <BookingForm {...bookingFormProps} compact />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CALENDAR PICKER ── */}
      <AnimatePresence>
        {isCalendarOpen && (
          <CalendarPicker
            key="calendar"
            checkIn={checkInDate}
            checkOut={checkOutDate}
            pricePerNight={pricePerNight}
            onSave={handleCalendarSave}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── FULLSCREEN PHOTO GALLERY ── */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-[300] flex flex-col"
          >
            {/* Gallery header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 text-white shrink-0"
            >
              <button onClick={() => setShowAllPhotos(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="font-semibold">{activePhotoIndex + 1} / {allPhotos.length}</span>
              <div className="w-9" />
            </motion.div>

            {/* Main gallery image with slide transition */}
            <div className="flex-1 flex items-center justify-center relative px-4 overflow-hidden">
              <button
                onClick={goPrev}
                className="absolute left-4 bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <AnimatePresence initial={false} custom={galleryDirection} mode="popLayout">
                <motion.img
                  key={activePhotoIndex}
                  src={allPhotos[activePhotoIndex]}
                  alt="Gallery"
                  custom={galleryDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-h-full max-w-full object-contain rounded-lg"
                  onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
                />
              </AnimatePresence>

              <button
                onClick={goNext}
                className="absolute right-4 bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Thumbnail strip — slides in from bottom */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-2 p-4 overflow-x-auto justify-center shrink-0"
            >
              {allPhotos.map((photo, i) => (
                <motion.button
                  key={i}
                  onClick={() => { setGalleryDirection(i > activePhotoIndex ? 1 : -1); setActivePhotoIndex(i); }}
                  animate={{
                    opacity: i === activePhotoIndex ? 1 : 0.5,
                    scale:   i === activePhotoIndex ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    i === activePhotoIndex ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <img src={photo} alt="" className="w-16 h-12 object-cover" onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }} />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}