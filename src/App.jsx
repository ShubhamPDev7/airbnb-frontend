import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import HotelDetails from './pages/HotelDetails';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import MyTrips from './pages/MyTrips';
import CreateHotel from './pages/CreateHotel';
import AdminDashboard from './pages/AdminDashboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CompleteProfile from './pages/CompleteProfile';


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchBarRef = useRef(null);
  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);

  const isHomePage = location.pathname === '/';
  const isHotelDetails = location.pathname.startsWith('/hotel/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const [isExpanded, setIsExpanded] = useState(isHomePage);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const [searchCity, setSearchCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomsCount, setRoomsCount] = useState(1);
  const [activeTab, setActiveTab] = useState('stays');
  const [activeMenu, setActiveMenu] = useState(null);
  const [viewingMonth, setViewingMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    if (!isMobileSearchOpen) setIsExpanded(isHomePage);
    setActiveMenu(null);
    setIsProfileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname, isHomePage]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setActiveMenu(null);
        if (!isHomePage && !isMobileSearchOpen) setIsExpanded(false);
      }
      const clickedOutsideDesktop = desktopProfileRef.current && !desktopProfileRef.current.contains(event.target);
      const clickedOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(event.target);
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHomePage, isMobileSearchOpen]);

  if (isHotelDetails || isAuthPage) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsProfileMenuOpen(false);
    navigate('/login');
  };

  const menuNav = (path) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActiveMenu(null);
    setIsMobileSearchOpen(false);
    if (!isHomePage) setIsExpanded(false);
    const finalCity = searchCity.trim() === '' ? 'Pune' : searchCity.trim();
    const finalStart = startDate || new Date().toISOString().split('T')[0];
    const finalEnd = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    navigate(`/?city=${finalCity}&startDate=${finalStart}&endDate=${finalEnd}&roomsCount=${roomsCount}`);
  };

  const changeMonth = (offset) =>
    setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + offset, 1));

  const generateMonthGrid = (baseDate) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleDateSelect = (dateObj) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) return;
    if (activeMenu === 'checkin') {
      setStartDate(dateStr);
      if (endDate && dateStr >= endDate) setEndDate('');
      setActiveMenu('checkout');
    } else if (activeMenu === 'checkout') {
      if (startDate && dateStr <= startDate) {
        setStartDate(dateStr);
        setEndDate('');
        setActiveMenu('checkout');
      } else {
        setEndDate(dateStr);
        setActiveMenu('who');
      }
    }
  };

  /* ── THE FIX: calendar cells use w-full inside a strict grid ── */
  const renderCalendar = (monthOffset) => {
    const targetMonth = new Date(
      viewingMonth.getFullYear(),
      viewingMonth.getMonth() + monthOffset,
      1
    );
    const grid = generateMonthGrid(targetMonth);
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="flex-1 min-w-0 px-2 md:px-4">
        {/* Month title */}
        <h3 className="text-center font-semibold text-gray-900 mb-4 text-sm md:text-base">
          {targetMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>

        {/* Day-of-week headers — each column is exactly 1/7 wide */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Date cells — CRITICAL: NO w-9/w-10 on the cell itself.
            The outer div takes the full column width; the inner span is the circle. */}
        <div className="grid grid-cols-7">
          {grid.map((dateObj, i) => {
            if (!dateObj) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = dateObj.toISOString().split('T')[0];
            const isPast   = dateStr < today;
            const isStart  = dateStr === startDate;
            const isEnd    = dateStr === endDate;
            const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;

            let cellBg = '';
            let textCls = 'text-gray-900 hover:ring-1 hover:ring-gray-900';
            let cursor = 'cursor-pointer';

            if (isStart || isEnd) {
              cellBg = 'bg-gray-900 text-white';
              textCls = '';
            } else if (isInRange) {
              cellBg = 'bg-gray-100 text-gray-900';
              textCls = '';
            } else if (isPast) {
              cellBg = '';
              textCls = 'text-gray-300 line-through';
              cursor = 'cursor-not-allowed';
            }

            return (
              <div
                key={dateStr}
                className={`aspect-square flex items-center justify-center ${cursor}`}
                onClick={(e) => { e.stopPropagation(); handleDateSelect(dateObj); }}
              >
                <span
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-full
                    text-sm font-medium transition-all select-none
                    ${cellBg} ${textCls}
                  `}
                >
                  {dateObj.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-[100] py-3 md:py-4">
        <div className="max-w-[2560px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 relative">

          {/* ── TOP ROW ── */}
          <div className="flex items-center justify-between gap-3 md:gap-4 h-12 relative z-[110]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0 select-none text-[#FF385C]">
              <svg viewBox="0 0 448 512" className="w-7 h-7 md:w-8 md:h-8 fill-current">
                <path d="M224 373.12c-25.24-31.67-40.08-59.43-45-83.18-22.55-88 112.61-88 90.06 0-5.45 24.25-20.29 52-45.06 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.43-89.11-41.06-71.3-91.09 15.1-39.16 111.72-231.18 115.87-241.56 15.75-30.07 25.56-57.4 59.38-57.4 32.34 0 43.4 25.94 60.37 59.87 36 70.62 89.35 177.48 114.84 239.09 13.17 33.07-1.37 71.29-37.01 86.64zm47-136.12C280.27 35.93 273.13 32 224 32c-45.52 0-64.87 31.67-84.66 72.79C33.18 317.1 22.89 347.19 22 349.81-3.22 419.14 48.74 480 111.63 480c21.71 0 60.61-6.06 112.37-62.4 58.68 63.78 101.26 62.4 112.37 62.4 62.89.05 114.85-60.86 89.61-130.19.02-3.89-16.82-38.9-16.82-39.58z" />
              </svg>
              <span className="hidden lg:inline font-bold text-[22px] tracking-tight">airbnb</span>
            </Link>

            {/* Desktop: tab switcher (expanded) OR collapsed pill */}
            {isExpanded ? (
              <div className="hidden md:flex items-center justify-center gap-6 text-[15px] text-gray-500">
                {['stays', 'experiences'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-2 border-b-2 hover:text-black transition-all capitalize ${activeTab === t ? 'border-black text-black font-medium' : 'border-transparent'}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            ) : (
              <div
                onClick={() => setIsExpanded(true)}
                className="hidden md:flex items-center border border-gray-300 rounded-full py-2 px-4 shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <div className="px-4 border-r border-gray-300 font-semibold text-gray-900 text-sm truncate max-w-[120px]">
                  {searchCity || 'Anywhere'}
                </div>
                <div className="px-4 border-r border-gray-300 font-semibold text-gray-900 text-sm">
                  {startDate && endDate ? `${startDate.slice(5)} – ${endDate.slice(5)}` : 'Any week'}
                </div>
                <div className="px-4 text-gray-500 text-sm">
                  {roomsCount > 1 ? `${roomsCount} rooms` : 'Add guests'}
                </div>
                <div className="bg-[#FF385C] text-white p-2 rounded-full ml-2">
                  <SearchIcon />
                </div>
              </div>
            )}

            {/* Mobile search pill */}
            <div
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex md:hidden flex-1 items-center bg-white border border-gray-300 rounded-full py-2 px-4 shadow-sm cursor-pointer"
            >
              <SearchIcon className="w-5 h-5 text-gray-800 mr-3 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-gray-900 leading-tight">Where to?</span>
                <span className="text-[12px] text-gray-500 leading-tight mt-0.5 truncate">
                  {searchCity || 'Anywhere'} · {startDate ? startDate.slice(5) : 'Any week'} · {roomsCount} room{roomsCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/host/create')}
                className="hover:bg-gray-100 px-4 py-2 rounded-full transition text-gray-800 text-sm font-semibold"
              >
                Become a host
              </button>

              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </button>

              {/* Desktop profile */}
              <div className="relative" ref={desktopProfileRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}
                  className="flex items-center border border-gray-300 rounded-full p-1.5 pl-3 gap-3 bg-white hover:shadow-md transition cursor-pointer select-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center overflow-hidden font-bold text-sm">
                    {isLoggedIn ? 'A' : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mt-1">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-14 right-0 bg-white border border-gray-200 shadow-xl rounded-2xl w-64 py-2 text-sm text-gray-700 flex flex-col z-[120] overflow-hidden">
                    {isLoggedIn ? (
                      <>
                        <MenuItem onClick={() => menuNav('/my-trips')} bold>My Trips</MenuItem>
                        <MenuItem onClick={() => menuNav('/host/create')}>Host a property</MenuItem>
                        <MenuItem onClick={() => menuNav('/admin/dashboard')}>Manage Listings</MenuItem>
                        <hr className="my-1 border-gray-200" />
                        <MenuItem onClick={handleLogout}>Log out</MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem onClick={() => menuNav('/login')} bold>Log in</MenuItem>
                        <MenuItem onClick={() => menuNav('/signup')}>Sign up</MenuItem>
                        <hr className="my-1 border-gray-200" />
                        <MenuItem onClick={() => menuNav('/host/create')}>Become a host</MenuItem>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile profile */}
            <div className="md:hidden relative" ref={mobileProfileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className="flex items-center border border-gray-300 rounded-full p-1 gap-2 bg-white hover:shadow-md transition"
              >
                <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {isLoggedIn ? 'A' : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[115]" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute top-12 right-0 bg-white border border-gray-200 shadow-xl rounded-2xl w-56 py-2 text-sm text-gray-700 flex flex-col z-[120] overflow-hidden">
                    {isLoggedIn ? (
                      <>
                        <MenuItem onClick={() => menuNav('/my-trips')} bold>My Trips</MenuItem>
                        <MenuItem onClick={() => menuNav('/host/create')}>Host a property</MenuItem>
                        <MenuItem onClick={() => menuNav('/admin/dashboard')}>Manage Listings</MenuItem>
                        <hr className="my-1 border-gray-200" />
                        <MenuItem onClick={handleLogout}>Log out</MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem onClick={() => menuNav('/login')} bold>Log in</MenuItem>
                        <MenuItem onClick={() => menuNav('/signup')}>Sign up</MenuItem>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── DESKTOP EXPANDED SEARCH BAR ── */}
          {isExpanded && (
            <div className="hidden md:flex justify-center relative z-[90] mt-4 w-full" ref={searchBarRef}>
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-white border border-gray-300 rounded-full shadow-md w-full max-w-[860px] h-[66px] relative"
              >
                {/* Where */}
                <div
                  onClick={() => setActiveMenu('where')}
                  className={`flex flex-col flex-1 h-full justify-center pl-8 pr-4 cursor-pointer transition-all rounded-full ${activeMenu === 'where' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] z-20' : 'hover:bg-gray-100 z-10'}`}
                >
                  <label className="text-[11px] font-extrabold tracking-wider uppercase text-gray-900 cursor-pointer">Where</label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    className="bg-transparent text-[15px] text-gray-800 outline-none placeholder-gray-400 w-full"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                </div>

                <div className="h-8 w-px bg-gray-300 shrink-0" />

                {/* Check in */}
                <div
                  onClick={() => setActiveMenu('checkin')}
                  className={`flex flex-col h-full w-[140px] justify-center px-6 cursor-pointer transition-all rounded-full ${activeMenu === 'checkin' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] z-20' : 'hover:bg-gray-100 z-10'}`}
                >
                  <label className="text-[11px] font-extrabold tracking-wider uppercase text-gray-900 cursor-pointer">Check in</label>
                  <span className={`text-[15px] truncate ${startDate ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {startDate || 'Add dates'}
                  </span>
                </div>

                <div className="h-8 w-px bg-gray-300 shrink-0" />

                {/* Check out */}
                <div
                  onClick={() => setActiveMenu('checkout')}
                  className={`flex flex-col h-full w-[140px] justify-center px-6 cursor-pointer transition-all rounded-full ${activeMenu === 'checkout' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] z-20' : 'hover:bg-gray-100 z-10'}`}
                >
                  <label className="text-[11px] font-extrabold tracking-wider uppercase text-gray-900 cursor-pointer">Check out</label>
                  <span className={`text-[15px] truncate ${endDate ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {endDate || 'Add dates'}
                  </span>
                </div>

                <div className="h-8 w-px bg-gray-300 shrink-0" />

                {/* Who */}
                <div
                  onClick={() => setActiveMenu(activeMenu === 'who' ? null : 'who')}
                  className={`flex flex-col flex-1 h-full justify-center pl-6 pr-2 cursor-pointer transition-all rounded-full ${activeMenu === 'who' ? 'bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] z-20' : 'hover:bg-gray-100 z-10'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col">
                      <label className="text-[11px] font-extrabold tracking-wider uppercase text-gray-900 cursor-pointer">Who</label>
                      <span className={`text-[15px] ${roomsCount > 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {roomsCount > 1 ? `${roomsCount} rooms` : 'Add rooms'}
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#FF385C] text-white rounded-full flex items-center gap-2 px-4 h-[48px] hover:bg-[#E61E4D] shrink-0 ml-2 font-semibold text-sm"
                    >
                      <SearchIcon className="w-4 h-4" />
                      <span className={activeMenu ? 'inline' : 'hidden'}>Search</span>
                    </button>
                  </div>
                </div>

                {/* ── CALENDAR POPOVER ── */}
                {(activeMenu === 'checkin' || activeMenu === 'checkout') && (
                  <div
                    className="absolute top-[78px] left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-[700px] md:w-[860px] border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* prev/next month buttons */}
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="absolute left-4 top-8 p-2 rounded-full hover:bg-gray-100 transition z-10"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="absolute right-4 top-8 p-2 rounded-full hover:bg-gray-100 transition z-10"
                    >
                      <ChevronRight />
                    </button>

                    {/* Two months side by side */}
                    <div className="flex gap-4">
                      {renderCalendar(0)}
                      <div className="w-px bg-gray-100 shrink-0" />
                      {renderCalendar(1)}
                    </div>

                    {/* Clear dates link */}
                    {(startDate || endDate) && (
                      <div className="flex justify-center mt-4">
                        <button
                          type="button"
                          onClick={() => { setStartDate(''); setEndDate(''); }}
                          className="text-sm font-semibold underline text-gray-700 hover:text-gray-900"
                        >
                          Clear dates
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Who popover */}
                {activeMenu === 'who' && (
                  <div
                    className="absolute top-[78px] right-0 bg-white rounded-3xl shadow-2xl p-6 w-[340px] border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center py-4">
                      <div>
                        <div className="font-semibold text-gray-900">Rooms</div>
                        <div className="text-sm text-gray-500">Accommodation needed</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                          className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 transition text-lg"
                        >−</button>
                        <span className="font-semibold w-4 text-center">{roomsCount}</span>
                        <button
                          type="button"
                          onClick={() => setRoomsCount(roomsCount + 1)}
                          className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 transition text-lg"
                        >+</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Where suggestions */}
                {activeMenu === 'where' && (
                  <div
                    className="absolute top-[78px] left-0 bg-white rounded-3xl shadow-2xl p-4 w-[420px] border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-3">Popular destinations</p>
                    {['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Pune', 'Jaipur'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setSearchCity(c); setActiveMenu('checkin'); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-100 rounded-xl transition text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg shrink-0">📍</div>
                        <div>
                          <div className="font-medium text-gray-900">{c}</div>
                          <div className="text-sm text-gray-500">India</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN SEARCH OVERLAY ── */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-50 z-[200] overflow-y-auto">
          <div className="bg-white p-4 pb-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 bg-gray-100 rounded-full shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="font-bold text-lg text-gray-900">Search</span>
            </div>
            <div className="flex gap-3 mb-5">
              {['stays', 'experiences'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold border transition ${activeTab === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4 pb-28">
            {/* Where */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <h2 className="text-base font-bold mb-3 text-gray-900">Where to?</h2>
              <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:border-gray-900 transition">
                <SearchIcon className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search destinations"
                  className="w-full text-sm font-medium outline-none placeholder-gray-400"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                {searchCity && (
                  <button onClick={() => setSearchCity('')} className="ml-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['Mumbai', 'Goa', 'Delhi', 'Bangalore', 'Pune', 'Jaipur'].map(c => (
                  <button
                    key={c}
                    onClick={() => setSearchCity(c)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${searchCity === c ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400'}`}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <h2 className="text-base font-bold mb-3 text-gray-900">When's your trip?</h2>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <div className="flex-1 p-3 border-r border-gray-300">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Check in</label>
                  <input type="date" className="w-full text-sm outline-none mt-1 cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex-1 p-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Check out</label>
                  <input type="date" className="w-full text-sm outline-none mt-1 cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <h2 className="text-base font-bold mb-3 text-gray-900">Who's coming?</h2>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Rooms</div>
                  <div className="text-xs text-gray-500 mt-0.5">Number of rooms needed</div>
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))} className="w-9 h-9 rounded-full border border-gray-400 flex items-center justify-center text-gray-700 text-lg hover:border-gray-900 transition">−</button>
                  <span className="font-semibold text-gray-900 w-5 text-center">{roomsCount}</span>
                  <button type="button" onClick={() => setRoomsCount(roomsCount + 1)} className="w-9 h-9 rounded-full border border-gray-400 flex items-center justify-center text-gray-700 text-lg hover:border-gray-900 transition">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 flex justify-between items-center z-[210]">
            <button
              onClick={() => { setSearchCity(''); setStartDate(''); setEndDate(''); setRoomsCount(1); }}
              className="font-semibold underline text-gray-900 text-sm"
            >
              Clear all
            </button>
            <button
              onClick={handleSearch}
              className="bg-[#FF385C] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-[#E61E4D] transition"
            >
              <SearchIcon className="w-4 h-4" /> Search
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Small helpers ── */
function MenuItem({ onClick, bold, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer w-full text-left text-sm transition-colors ${bold ? 'font-semibold' : 'font-normal'}`}
    >
      {children}
    </button>
  );
}

function SearchIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/checkout/:bookingId" element={<Checkout />} />
        <Route path="/payments/success" element={<PaymentSuccess />} />
        <Route path="/payments/failure" element={<PaymentFailure />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/host/create" element={<CreateHotel />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}