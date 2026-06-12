import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
  // Returns "YYYY-MM-DD" in LOCAL time (avoids UTC offset issues)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseYMD(str) {
  // Parses "YYYY-MM-DD" as local date
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
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

/* ─────────────────────────────────────────────────────────────
   CALENDAR PICKER COMPONENT
   Matches Airbnb's full-screen sheet design:
   - "X nights / N nights / Select checkout" header
   - Month name rows + day-of-week grid
   - Range highlight between selected dates
   - Strikethrough original + discounted total
   - Save / Clear dates buttons
───────────────────────────────────────────────────────────── */
function CalendarPicker({ checkIn, checkOut, onSave, onClose, pricePerNight }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Hover state for range preview
  const [hoverDate, setHoverDate] = useState(null);

  // Internal selection state (strings or null)
  const [selIn,  setSelIn]  = useState(checkIn  || null);
  const [selOut, setSelOut] = useState(checkOut || null);

  // Which selection step are we on?
  // 'in' = picking check-in, 'out' = picking check-out
  const [step, setStep] = useState(checkIn && !checkOut ? 'out' : 'in');

  // Start calendar at current month or check-in month
  const initDate = selIn ? parseYMD(selIn) : today;
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  // Build array of {year, month} for rendering — show 12 months from now
  const months = [];
  let y = today.getFullYear(), m = today.getMonth();
  for (let i = 0; i < 12; i++) {
    months.push({ year: y, month: m });
    m++;
    if (m > 11) { m = 0; y++; }
  }

  const handleDayClick = useCallback((dateStr) => {
    const clicked = parseYMD(dateStr);
    if (clicked < today) return; // past — ignore

    if (step === 'in') {
      setSelIn(dateStr);
      setSelOut(null);
      setStep('out');
    } else {
      // step === 'out'
      if (selIn && clicked <= parseYMD(selIn)) {
        // Clicked before/same as check-in → restart
        setSelIn(dateStr);
        setSelOut(null);
        setStep('out');
      } else {
        setSelOut(dateStr);
        setStep('in'); // done
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

  // Computed summary
  const nights = selIn && selOut ? nightsBetween(parseYMD(selIn), parseYMD(selOut)) : 0;
  const total  = nights && pricePerNight ? nights * pricePerNight : 0;
  const originalTotal = total ? Math.round(total * 1.18) : 0; // fake original for strikethrough

  // Header text (mirrors Airbnb exactly)
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

  // Range check helpers
  const inDate  = selIn  ? parseYMD(selIn)  : null;
  const outDate = selOut ? parseYMD(selOut) : null;
  const hDate   = hoverDate ? parseYMD(hoverDate) : null;
  // Preview end: if we have selIn but no selOut, use hover
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
    <div className="fixed inset-0 z-[300] bg-white flex flex-col">
      {/* ── Header ── */}
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
          <button
            onClick={handleClear}
            className="text-sm font-semibold underline text-gray-700 hover:text-gray-900"
          >
            Clear dates
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{headerTitle}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{headerSub}</p>
      </div>

      {/* ── Day-of-week header (sticky) ── */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 border-b border-gray-100 px-2 py-2 shrink-0">
        {DAY_NAMES.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* ── Scrollable months ── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {months.map(({ year, month }) => {
          const daysInMonth  = getDaysInMonth(year, month);
          const firstDayOfWk = getFirstDayOfWeek(year, month); // 0=Sun
          const cells = [];
          // Leading empty cells
          for (let i = 0; i < firstDayOfWk; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

          return (
            <div key={`${year}-${month}`} className="mb-6">
              {/* Month label */}
              <div className="text-base font-bold text-gray-900 py-3 px-2">
                {MONTH_NAMES[month]} {year}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7">
                {cells.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} />;

                  const dateStr = toYMD(date);
                  const { isPast, isStart, isEnd, inRange, isHoverEnd } = getDayState(dateStr);

                  // Visual state
                  const isSelected = isStart || isEnd;
                  const isRangeEnd = isEnd || isHoverEnd;

                  // Range bg pill — covers half cells at edges
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
                      {/* Range background band (full cell) */}
                      {inRange && (
                        <div className="absolute inset-y-2 inset-x-0 bg-gray-100" />
                      )}
                      {/* Half-pill at range start (right half only) */}
                      {rangeRightHalf && (
                        <div className="absolute inset-y-2 right-0 left-1/2 bg-gray-100" />
                      )}
                      {/* Half-pill at range end (left half only) */}
                      {rangeLeftHalf && (
                        <div className="absolute inset-y-2 left-0 right-1/2 bg-gray-100" />
                      )}

                      {/* Day circle button */}
                      <button
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && handleDayClick(dateStr)}
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
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-gray-200 px-4 py-4 flex items-center justify-between bg-white">
        {/* Price summary */}
        <div className="text-sm">
          {total > 0 ? (
            <>
              <span className="line-through text-gray-400 mr-1.5">
                ₹{originalTotal.toLocaleString('en-IN')}
              </span>
              <span className="font-bold text-gray-900">
                ₹{total.toLocaleString('en-IN')}
              </span>
              <span className="text-gray-500 ml-1">for {nights} night{nights !== 1 ? 's' : ''}</span>
            </>
          ) : (
            <span className="text-gray-500">Add dates for prices</span>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!selIn || !selOut}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition ${
            selIn && selOut
              ? 'bg-gray-900 text-white hover:bg-black'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save
        </button>
      </div>
    </div>
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
   BOOKING FORM (shared logic for desktop widget + mobile sheet)
───────────────────────────────────────────────────────────── */
function BookingForm({
  rooms, checkInDate, checkOutDate, selectedRoomId, roomsCount,
  setCheckInDate, setCheckOutDate, setSelectedRoomId, setRoomsCount,
  bookingError, isReserving, onReserve, pricePerNight,
  nightCount, totalBeforeTax, serviceFee,
  openCalendar,        // () => void — opens the calendar sheet
  compact = false,     // true = inside mobile sheet (slightly different spacing)
}) {
  return (
    <>
      {bookingError && (
        <div className={`${compact ? 'mb-4' : 'mb-4'} p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium`}>
          {bookingError}
        </div>
      )}

      {/* Date + room + rooms grid */}
      <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
        {/* Dates row — clicking opens calendar */}
        <div className="flex border-b border-gray-300">
          <button
            type="button"
            onClick={openCalendar}
            className="flex-1 p-3 border-r border-gray-300 text-left hover:bg-gray-50 transition"
          >
            <div className="text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Check-in</div>
            <div className={`mt-1 text-sm font-medium ${checkInDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {checkInDate ? formatDisplayDate(checkInDate) : 'Add date'}
            </div>
          </button>
          <button
            type="button"
            onClick={openCalendar}
            className="flex-1 p-3 text-left hover:bg-gray-50 transition"
          >
            <div className="text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Check-out</div>
            <div className={`mt-1 text-sm font-medium ${checkOutDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {checkOutDate ? formatDisplayDate(checkOutDate) : 'Add date'}
            </div>
          </button>
        </div>

        {/* Room type */}
        <div className="p-3 border-b border-gray-300">
          <label className="block text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Room Type</label>
          <select
            className="w-full text-sm outline-none mt-1 bg-transparent font-medium cursor-pointer"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.type} — ₹{Math.round(room.basePrice).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        {/* Rooms count */}
        <div className="p-3 flex justify-between items-center">
          <div>
            <label className="block text-[10px] font-extrabold tracking-wider uppercase text-gray-900">Rooms</label>
            <div className="text-sm mt-0.5 font-medium">{roomsCount} room{roomsCount > 1 ? 's' : ''}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
              className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-lg hover:border-gray-900 transition"
            >−</button>
            <span className="font-semibold w-4 text-center">{roomsCount}</span>
            <button
              type="button"
              onClick={() => setRoomsCount(roomsCount + 1)}
              className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-lg hover:border-gray-900 transition"
            >+</button>
          </div>
        </div>
      </div>

      {/* Reserve button */}
      <button
        onClick={onReserve}
        disabled={isReserving}
        className="w-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white font-semibold text-base py-3.5 rounded-xl hover:opacity-90 transition mt-1 disabled:opacity-60"
      >
        {isReserving ? 'Processing…' : 'Reserve'}
      </button>
      <p className="text-center text-sm text-gray-500 mt-3">You won't be charged yet</p>

      {/* Price breakdown */}
      {totalBeforeTax > 0 && (
        <div className="mt-5 flex flex-col gap-2 text-sm text-gray-700">
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
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function HotelDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [hotelInfo,       setHotelInfo]      = useState(null);
  const [isLoading,       setIsLoading]      = useState(true);

  const [checkInDate,     setCheckInDate]    = useState('');
  const [checkOutDate,    setCheckOutDate]   = useState('');
  const [roomsCount,      setRoomsCount]     = useState(1);
  const [selectedRoomId,  setSelectedRoomId] = useState('');
  const [bookingError,    setBookingError]   = useState('');
  const [isReserving,     setIsReserving]    = useState(false);

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isCalendarOpen,    setIsCalendarOpen]    = useState(false);
  const [isLiked,           setIsLiked]           = useState(false);
  const [showAllPhotos,     setShowAllPhotos]      = useState(false);
  const [activePhotoIndex,  setActivePhotoIndex]  = useState(0);

  /* ── Fetch hotel ── */
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response     = await fetch(`http://localhost:8080/api/v1/hotels/${id}/info`);
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
      const response = await fetch('http://localhost:8080/api/v1/bookings/init', {
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
      else setBookingError(data.error?.message || 'Failed to initialize booking.');
    } catch {
      setBookingError('Network error. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  /* ── Calendar save callback ── */
  const handleCalendarSave = useCallback((inDate, outDate) => {
    setCheckInDate(inDate);
    setCheckOutDate(outDate);
    setBookingError('');
  }, []);

  /* ── Loading / not found ── */
  if (isLoading) return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF385C] border-t-transparent" />
    </div>
  );
  if (!hotelInfo) return (
    <div className="pt-40 text-center font-semibold text-gray-900">Hotel not found!</div>
  );

  const hotel = hotelInfo.hotel ?? hotelInfo;
  const rooms = hotelInfo.rooms ?? [];

  const getImg = (index) => {
    const fallback  = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    const candidate = hotel?.photos?.[index];
    if (!candidate || typeof candidate !== 'string' || candidate.trim() === '') return fallback;
    return candidate.includes('unsplash.com/photos/') ? fallback : candidate;
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

  const prevPhoto = (e) => { e.stopPropagation(); setActivePhotoIndex(i => (i - 1 + allPhotos.length) % allPhotos.length); };
  const nextPhoto = (e) => { e.stopPropagation(); setActivePhotoIndex(i => (i + 1) % allPhotos.length); };

  /* ── Shared booking form props ── */
  const bookingFormProps = {
    rooms, checkInDate, checkOutDate, selectedRoomId, roomsCount,
    setCheckInDate, setCheckOutDate, setSelectedRoomId, setRoomsCount,
    bookingError, isReserving, onReserve: handleReserve,
    pricePerNight, nightCount, totalBeforeTax, serviceFee,
    openCalendar: () => setIsCalendarOpen(true),
  };

  /* ── Date label for mobile bar ── */
  const dateLabel = checkInDate && checkOutDate
    ? `${checkInDate.slice(5).replace('-', '/')} – ${checkOutDate.slice(5).replace('-', '/')}`
    : 'Select dates';

  return (
    <div className="relative pb-28 lg:pb-10">

      {/* ── MOBILE FLOATING NAV ── */}
      <div className="md:hidden fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
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
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="bg-white/95 backdrop-blur shadow-md p-2.5 rounded-full hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? '#FF385C' : 'none'} stroke={isLiked ? '#FF385C' : 'currentColor'} strokeWidth={1.5} className="w-4 h-4">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE PHOTO CAROUSEL ── */}
      <div className="md:hidden relative w-full h-[300px] bg-gray-100 overflow-hidden">
        <img
          src={allPhotos[activePhotoIndex]}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
        />
        <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {allPhotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePhotoIndex(i)}
              className={`rounded-full transition-all ${i === activePhotoIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`}
            />
          ))}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {activePhotoIndex + 1} / {allPhotos.length}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto md:px-10 lg:px-20 md:pt-32">

        {/* ── DESKTOP HEADER ── */}
        <div className="hidden md:flex justify-between items-center mb-5 px-0">
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
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? '#FF385C' : 'none'} stroke={isLiked ? '#FF385C' : 'currentColor'} strokeWidth={1.5} className="w-4 h-4">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {isLiked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* ── DESKTOP PHOTO BENTO GRID ── */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[460px] rounded-2xl overflow-hidden mb-10 relative">
          <div className="col-span-2 row-span-2">
            <img src={allPhotos[0]} alt="Main" className="w-full h-full object-cover hover:brightness-95 transition cursor-pointer" onClick={() => setShowAllPhotos(true)} />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-span-1 row-span-1 overflow-hidden">
              <img src={allPhotos[i]} alt={`Photo ${i}`} className="w-full h-full object-cover hover:brightness-95 transition cursor-pointer" onClick={() => { setActivePhotoIndex(i); setShowAllPhotos(true); }} />
            </div>
          ))}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            Show all photos
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-col lg:flex-row gap-12 px-4 md:px-0 relative">

          {/* LEFT COLUMN */}
          <div className="flex-1 lg:max-w-[60%]">

            {/* Mobile title */}
            <div className="md:hidden mb-4">
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{hotel.name}</h1>
            </div>

            {/* Subtitle + rating */}
            <div className="mb-5">
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
            </div>
            <hr className="border-gray-200" />

            {/* Host card */}
            <div className="py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF385C] to-[#E61E4D] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {hotel.name?.charAt(0) || 'H'}
              </div>
              <div>
                <div className="font-semibold text-gray-900">Hosted by {hotel.name?.split(' ')[0] || 'Host'}</div>
                <div className="text-sm text-gray-500">Superhost · 3 years hosting</div>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1 text-sm font-medium">
                <StarIcon className="w-3.5 h-3.5" />
                {rating} · Superhost
              </div>
            </div>
            <hr className="border-gray-200" />

            {/* Feature highlights */}
            <div className="py-6 flex flex-col gap-4">
              {[
                { icon: '🏠', title: 'Entire place',     desc: "You'll have the place to yourself." },
                { icon: '✨', title: 'Enhanced Clean',   desc: 'Committed to a higher standard of clean.' },
                { icon: '🔑', title: 'Self check-in',    desc: 'Check yourself in with the key lockbox.' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{f.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="border-gray-200" />

            {/* Description */}
            <div className="py-6">
              <p className="text-gray-700 leading-relaxed text-base">
                Bring the whole family to this great place with lots of room for fun.
                Beautifully located in the heart of {hotel.city}, this property offers
                unmatched convenience and luxury. Every detail has been thoughtfully
                curated for a memorable stay.
              </p>
            </div>
            <hr className="border-gray-200" />

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <>
                <div className="py-6">
                  <h3 className="text-xl font-semibold mb-5">What this place offers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    {hotel.amenities.slice(0, 10).map((amenity, i) => (
                      <div key={i} className="flex items-center gap-4 text-gray-700 text-base">
                        <span className="text-gray-900">{getAmenityIcon(amenity)}</span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                  {hotel.amenities.length > 10 && (
                    <button className="mt-6 border border-gray-900 rounded-xl px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition">
                      Show all {hotel.amenities.length} amenities
                    </button>
                  )}
                </div>
                <hr className="border-gray-200" />
              </>
            )}

            {/* Available rooms */}
            {rooms.length > 0 && (
              <>
                <div className="py-6">
                  <h3 className="text-xl font-semibold mb-5">Available rooms</h3>
                  <div className="flex flex-col gap-3">
                    {rooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${
                          String(selectedRoomId) === String(room.id)
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-gray-900">{room.type}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{room.description || 'Standard room'}</div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="font-bold text-gray-900">₹{Math.round(room.basePrice).toLocaleString('en-IN')}</div>
                          <div className="text-xs text-gray-500">/ night</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="border-gray-200" />
              </>
            )}

            {/* Reviews */}
            <div className="py-6">
              <div className="flex items-center gap-2 mb-6">
                <StarIcon />
                <span className="text-xl font-semibold">{rating}</span>
                <span className="text-gray-500">·</span>
                <span className="text-xl font-semibold">14 reviews</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: 'Priya S.',   date: 'May 2025',      review: 'Absolutely beautiful property! The amenities were top-notch and the location was perfect.' },
                  { name: 'Rahul M.',   date: 'April 2025',    review: 'Had a wonderful stay. Very clean, well-maintained and the host was extremely responsive.' },
                  { name: 'Ananya K.', date: 'March 2025',    review: "Loved the interiors and the overall vibe. Would definitely book again for my next trip!" },
                  { name: 'Vikram P.', date: 'February 2025', review: 'Great value for money. The beds were comfortable and the kitchen was fully stocked.' },
                ].map(r => (
                  <div key={r.name}>
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP BOOKING WIDGET ── */}
          <div className="hidden lg:block w-full max-w-[36%] relative shrink-0">
            <div className="sticky top-32">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 pb-7">
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
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-5 py-4 z-50 flex justify-between items-center">
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
        <button
          onClick={() => setIsMobileSheetOpen(true)}
          className="bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white px-8 py-3 rounded-xl font-bold text-[15px] hover:opacity-90 transition"
        >
          Reserve
        </button>
      </div>

      {/* ── MOBILE BOOKING SHEET ── */}
      {isMobileSheetOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[200] flex justify-center items-end"
          onClick={() => setIsMobileSheetOpen(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
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
          </div>
        </div>
      )}

      {/* ── CALENDAR PICKER (full screen, on top of everything) ── */}
      {isCalendarOpen && (
        <CalendarPicker
          checkIn={checkInDate}
          checkOut={checkOutDate}
          pricePerNight={pricePerNight}
          onSave={handleCalendarSave}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      {/* ── FULLSCREEN PHOTO GALLERY ── */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-[300] flex flex-col">
          <div className="flex items-center justify-between p-4 text-white shrink-0">
            <button onClick={() => setShowAllPhotos(false)} className="p-2 hover:bg-white/10 rounded-full transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="font-semibold">{activePhotoIndex + 1} / {allPhotos.length}</span>
            <div className="w-9" />
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4">
            <button onClick={prevPhoto} className="absolute left-4 bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition z-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <img
              src={allPhotos[activePhotoIndex]}
              alt="Gallery"
              className="max-h-full max-w-full object-contain rounded-lg"
              onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
            />
            <button onClick={nextPhoto} className="absolute right-4 bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition z-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 p-4 overflow-x-auto justify-center shrink-0">
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhotoIndex(i)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${i === activePhotoIndex ? 'border-white' : 'border-transparent opacity-60'}`}
              >
                <img src={photo} alt="" className="w-16 h-12 object-cover" onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}