import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/* ── Categories ── */
const CATEGORIES = [
  { id: 'all',       label: 'All homes',  emoji: '🏠' },
  { id: 'trending',  label: 'Trending',   emoji: '🔥' },
  { id: 'beach',     label: 'Beach',      emoji: '🏖️' },
  { id: 'mountains', label: 'Mountains',  emoji: '⛰️' },
  { id: 'city',      label: 'City',       emoji: '🌆' },
  { id: 'luxury',    label: 'Luxury',     emoji: '✨' },
  { id: 'budget',    label: 'Budget',     emoji: '💰' },
  { id: 'pool',      label: 'Pool',       emoji: '🏊' },
  { id: 'family',    label: 'Family',     emoji: '👨‍👩‍👧' },
  { id: 'new',       label: 'New',        emoji: '🆕' },
];

const SORT_OPTIONS = [
  { id: 'default',    label: 'Default' },
  { id: 'price_asc',  label: 'Price: Low → High' },
  { id: 'price_desc', label: 'Price: High → Low' },
  { id: 'rating',     label: 'Top Rated' },
];

const FALLBACKS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-c53cd4b85d05?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
];

/* ── Wishlist helpers ── */
const WL_KEY = 'staylux_wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); }
  catch { return []; }
}

function toggleWishlist(id) {
  const wl = getWishlist();
  const next = wl.includes(id) ? wl.filter((x) => x !== id) : [...wl, id];
  localStorage.setItem(WL_KEY, JSON.stringify(next));
  return next;
}

/* ── Recently viewed helpers ── */
const RV_KEY = 'staylux_recently_viewed';

function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(RV_KEY) || '[]'); }
  catch { return []; }
}

// BUG FIX: was filtering on hotel?.id but stored objects are hotelData (shape: { hotel, price })
function addRecentlyViewed(hotelData) {
  const rv = getRecentlyViewed().filter((h) => h.hotel?.id !== hotelData.hotel?.id);
  const next = [hotelData, ...rv].slice(0, 6);
  localStorage.setItem(RV_KEY, JSON.stringify(next));
}

/* ── Image helper ── */
// BUG FIX: previous logic tried to extract slug from 'unsplash.com/photos/' but then
// prepended 'photo-' — which only works if the URL path segment already starts with 'photo-'.
// Simplified: just return the URL directly if it's http(s), else fallback.
function getCardImage(photos, seedId) {
  const fallback = FALLBACKS[(seedId ?? 0) % FALLBACKS.length];
  if (!photos || !Array.isArray(photos) || photos.length === 0) return fallback;
  for (const p of photos) {
    if (!p || typeof p !== 'string') continue;
    const t = p.trim();
    if (!t) continue;
    if (t.toLowerCase().startsWith('http')) return t;
  }
  return fallback;
}

/* ── Price helpers ── */
function computeBounds(hotelList) {
  const prices = hotelList.map((h) => Number(h.price)).filter((p) => p > 0);
  if (!prices.length) return { min: 0, max: 50000 };
  return {
    min: Math.floor(Math.min(...prices) / 500) * 500,
    max: Math.ceil(Math.max(...prices) / 500) * 500,
  };
}

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 animate-pulse w-full">
      <div className="aspect-square w-full rounded-2xl bg-gray-200" />
      <div className="h-4 bg-gray-200 rounded-lg w-3/4 mt-1" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-200 rounded-lg w-1/3 mt-1" />
    </div>
  );
}

/* ── Heart Icon ── */
function HeartIcon({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? '#FF385C' : 'rgba(0,0,0,0.35)'}
      stroke={filled ? '#FF385C' : '#ffffff'}
      strokeWidth={1.8}
      className="w-6 h-6 drop-shadow-sm transition-colors"
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

/* ── Hotel Card ── */
function HotelCard({ hotelData, wishlist, onWishlistToggle }) {
  const navigate  = useNavigate();
  const { hotel, price } = hotelData;
  const [imgError, setImgError] = useState(false);

  // BUG FIX: wishlist stores hotel.id (number/string), so check hotel.id not hotel?.id
  const isLiked = wishlist.includes(hotel.id);
  const imgSrc  = imgError
    ? FALLBACKS[(hotel.id ?? 0) % FALLBACKS.length]
    : getCardImage(hotel.photos, hotel.id);

  // Deterministic pseudo-rating seeded by id
  const rating  = (4.5 + ((hotel.id ?? 0) % 5) / 10).toFixed(1);

  // BUG FIX: price could be a string from JSON; always coerce before formatting
  const priceNum = Number(price);
  const displayPrice = Number.isFinite(priceNum) && priceNum > 0
    ? `₹${Math.round(priceNum).toLocaleString('en-IN')}`
    : '—';

  const handleClick = () => {
    addRecentlyViewed(hotelData);
    navigate(`/hotel/${hotel.id}`);
  };

  return (
    <div className="flex flex-col gap-2 relative cursor-pointer group">
      {/* Image */}
      <div
        onClick={handleClick}
        className="aspect-square w-full relative overflow-hidden rounded-2xl bg-gray-100"
      >
        <img
          src={imgSrc}
          onError={() => setImgError(true)}
          alt={hotel.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-900 shadow-sm">
          Guest favourite
        </span>
      </div>

      {/* Wishlist heart */}
      <button
        onClick={(e) => { e.stopPropagation(); onWishlistToggle(hotel.id); }}
        className="absolute top-3 right-3 z-10 p-1 hover:scale-110 active:scale-95 transition"
        aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <HeartIcon filled={isLiked} />
      </button>

      {/* Info */}
      <div className="flex flex-col gap-0.5" onClick={handleClick}>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900 text-sm md:text-[15px] truncate leading-snug">
            {hotel.city}, India
          </h3>
          <div className="flex items-center gap-0.5 text-xs font-semibold text-gray-900 shrink-0">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-current">
              <path d="M16 1l4.5 9.5 10.5 1.5-7.5 7.5 2 10.5-9.5-5-9.5 5 2-10.5-7.5-7.5 10.5-1.5z" />
            </svg>
            {rating}
          </div>
        </div>
        <p className="text-gray-500 text-xs md:text-sm truncate">{hotel.name}</p>
        <p className="text-gray-400 text-xs">Available now</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-bold text-gray-900 text-sm md:text-[15px]">{displayPrice}</span>
          {displayPrice !== '—' && (
            <span className="text-gray-500 text-xs font-normal">/ night</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Card grid ── */
function CardGrid({ children }) {
  return (
    <div
      className="grid gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-10"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))' }}
    >
      {children}
    </div>
  );
}

/* ── Price Range Slider ── */
/*
 * Uses a single <style> tag injected once for the thumb styling so it works
 * in both Webkit and Firefox without brittle Tailwind arbitrary-value stacking.
 * The track fill is drawn via a linear-gradient on the wrapper div — no
 * overlapping absolute-positioned inputs needed.
 */
const SLIDER_STYLE = `
  .price-range-input {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: transparent;
    outline: none;
    cursor: pointer;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .price-range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #111827;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    cursor: pointer;
    pointer-events: all;
  }
  .price-range-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #111827;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    cursor: pointer;
    pointer-events: all;
  }
  .price-range-input::-webkit-slider-runnable-track { background: transparent; }
  .price-range-input::-moz-range-track { background: transparent; }
`;

let sliderStyleInjected = false;
function injectSliderStyle() {
  if (sliderStyleInjected) return;
  const el = document.createElement('style');
  el.textContent = SLIDER_STYLE;
  document.head.appendChild(el);
  sliderStyleInjected = true;
}

function PriceSlider({ min, max, value, onChange }) {
  useEffect(() => { injectSliderStyle(); }, []);

  const [localMin, localMax] = value;
  if (min >= max) return null;

  const handleMin = (e) => {
    const v = Math.min(Number(e.target.value), localMax - 500);
    onChange([v, localMax]);
  };
  const handleMax = (e) => {
    const v = Math.max(Number(e.target.value), localMin + 500);
    onChange([localMin, v]);
  };

  const pctMin = ((localMin - min) / (max - min)) * 100;
  const pctMax = ((localMax - min) / (max - min)) * 100;

  // Track gradient: gray | gray → dark fill between thumbs → gray | gray
  const trackBg = `linear-gradient(to right,
    #e5e7eb 0%, #e5e7eb ${pctMin}%,
    #111827 ${pctMin}%, #111827 ${pctMax}%,
    #e5e7eb ${pctMax}%, #e5e7eb 100%)`;

  const quickPicks = [[0, 3000], [3000, 7000], [7000, 15000], [15000, 50000]];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-900">Price range</span>
        <span className="text-sm text-gray-600">
          ₹{localMin.toLocaleString('en-IN')} – ₹{localMax.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Slider track + dual thumbs */}
      <div
        className="relative mx-1"
        style={{ height: '20px' }}
      >
        {/* Coloured track bar sitting in the middle */}
        <div
          className="absolute rounded-full"
          style={{
            left: 0, right: 0,
            top: '50%', transform: 'translateY(-50%)',
            height: '4px',
            background: trackBg,
            pointerEvents: 'none',
          }}
        />
        {/* Min thumb input */}
        <input
          type="range"
          min={min} max={max} step={500}
          value={localMin}
          onChange={handleMin}
          className="price-range-input"
          style={{ zIndex: localMin > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        {/* Max thumb input */}
        <input
          type="range"
          min={min} max={max} step={500}
          value={localMax}
          onChange={handleMax}
          className="price-range-input"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Quick picks */}
      <div className="flex gap-2 mt-5 flex-wrap">
        {quickPicks.map(([a, b]) => {
          const qMin = Math.max(a, min);
          const qMax = Math.min(b, max);
          const active = localMin === qMin && localMax === qMax;
          return (
            <button
              key={`${a}-${b}`}
              type="button"
              onClick={() => onChange([qMin, qMax])}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                active
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-600'
              }`}
            >
              {a === 0 ? 'Under ' : ''}₹{b >= 50000 ? '15k+' : `${b / 1000}k`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Filters Panel ── */
function FiltersPanel({ isOpen, onClose, allHotels, priceRange, setPriceRange, sortBy, setSortBy, onClear }) {
  // BUG FIX: allHotels items have shape { hotel, price } — use h.price not h.price directly
  // (they did use h.price which is correct since price is at root of each item)
  const { min: globalMin, max: globalMax } = computeBounds(allHotels);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[150] backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div
        className="fixed z-[160] bottom-0 left-0 right-0 rounded-t-3xl
          md:bottom-auto md:top-[160px] md:right-6 md:left-auto md:rounded-2xl md:w-[380px]
          bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'min(92vh, calc(100dvh - 180px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Close filters">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6 flex flex-col gap-8">
          {/* Sort */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Sort by</p>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortBy(opt.id)}
                  className={`py-2.5 px-3 border-2 rounded-xl text-sm font-medium transition text-left ${
                    sortBy === opt.id
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <hr className="border-gray-100" />
          {/* Price range */}
          <PriceSlider
            min={globalMin}
            max={globalMax}
            value={priceRange}
            onChange={setPriceRange}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

/* ── City Section ── */
function CitySection({ cityName, cityHotels, wishlist, onWishlistToggle }) {
  const INITIAL = 5;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? cityHotels : cityHotels.slice(0, INITIAL);
  const hasMore = cityHotels.length > INITIAL;

  if (cityHotels.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-end mb-4 md:mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Available in {cityName}</h2>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            {cityHotels.length} space{cityHotels.length !== 1 ? 's' : ''}
          </p>
        </div>
        {hasMore && (
          <button
            onClick={() => setShowAll((p) => !p)}
            className="text-sm font-semibold underline text-gray-900 hover:text-gray-600 transition shrink-0 ml-4"
          >
            {showAll ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>
      <CardGrid>
        {visible.map((hd, i) => (
          <HotelCard
            key={hd.hotel?.id ?? i}
            hotelData={hd}
            wishlist={wishlist}
            onWishlistToggle={onWishlistToggle}
          />
        ))}
      </CardGrid>
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 w-full border border-gray-300 rounded-2xl py-3 text-sm font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
        >
          Show all {cityHotels.length} places in {cityName}
        </button>
      )}
    </div>
  );
}

/* ── Filters / Sort icon ── */
function FiltersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Main Home
════════════════════════════════════════════════════ */
export default function Home() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotels,         setHotels]         = useState([]);
  const [isLoading,      setIsLoading]       = useState(true);
  const [errorMsg,       setErrorMsg]        = useState('');
  const [activeCategory, setActiveCategory]  = useState('all');
  const [filtersOpen,    setFiltersOpen]     = useState(false);
  const [sortBy,         setSortBy]          = useState('default');
  // BUG FIX: initialise priceRange with null to indicate "not yet set from data"
  const [priceRange,     setPriceRange]      = useState(null);
  const [wishlist,       setWishlist]        = useState(getWishlist);
  const [recentlyViewed, setRecentlyViewed]  = useState(getRecentlyViewed);

  const urlCity     = searchParams.get('city') || '';
  const isSearchActive = !!searchParams.get('city');
  const startDate   = searchParams.get('startDate')  || new Date().toISOString().split('T')[0];
  const endDate     = searchParams.get('endDate')    || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const roomsCount  = Number(searchParams.get('roomsCount')) || 1;

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    const fetchHotels = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch('http://localhost:8080/api/v1/hotels/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city:       urlCity,
            startDate,
            endDate,
            roomsCount,
            category:   activeCategory,
            page:       0,
            size:       50,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch hotels.');
        const data = json.data;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        if (cancelled) return;
        setHotels(list);
        // BUG FIX: set priceRange from real data so initial slider matches actual prices
        const { min, max } = computeBounds(list);
        setPriceRange([min, max]);
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message || 'Server disconnected.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchHotels();
    // BUG FIX: cleanup to avoid state updates on unmounted component
    return () => { cancelled = true; };
  }, [urlCity, startDate, endDate, roomsCount, activeCategory]);

  /* ── Wishlist ── */
  const handleWishlistToggle = useCallback((id) => {
    setWishlist(toggleWishlist(id));
  }, []);

  /* ── Refresh recently viewed when returning to home ── */
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  /* ── Derived state ── */
  const { min: globalMin, max: globalMax } = computeBounds(hotels);
  // While priceRange is null (first load), don't filter anything out
  const effectivePriceRange = priceRange ?? [globalMin, globalMax];

  const filtered = hotels.filter((h) => {
    const p = Number(h.price);
    return p >= effectivePriceRange[0] && p <= effectivePriceRange[1];
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc')  return Number(a.price) - Number(b.price);
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'rating')     return ((b.hotel?.id ?? 0) % 5) - ((a.hotel?.id ?? 0) % 5);
    return 0;
  });

  const activeFilterCount =
    (sortBy !== 'default' ? 1 : 0) +
    (effectivePriceRange[0] > globalMin || effectivePriceRange[1] < globalMax ? 1 : 0);

  const groupedByCity = sorted.reduce((acc, h) => {
    const c = h.hotel?.city || 'Other Locations';
    (acc[c] = acc[c] || []).push(h);
    return acc;
  }, {});

  // BUG FIX: hotels items are { hotel, price } — filter by hotel.id, not h.id
  const savedHotels = hotels.filter((h) => wishlist.includes(h.hotel?.id));

  const handleClearFilters = () => {
    setSortBy('default');
    setPriceRange([globalMin, globalMax]);
  };

  return (
    <div className="pt-[72px] md:pt-[160px] min-h-screen bg-white">
      {/* ── CATEGORY BAR ── */}
      <div className="sticky top-[72px] md:top-[80px] bg-white z-[85] border-b border-gray-100">
        <div className="max-w-[2560px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20">
          <div className="flex items-center gap-3">
            {/* BUG FIX: added [&::-webkit-scrollbar]:hidden for webkit browsers */}
            <div
              className="flex items-center gap-5 md:gap-7 overflow-x-auto py-4 flex-1
                [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 shrink-0 pb-1 border-b-2 transition-all ${
                    activeCategory === cat.id
                      ? 'border-gray-900 opacity-100'
                      : 'border-transparent opacity-55 hover:opacity-90 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl md:text-2xl leading-none">{cat.emoji}</span>
                  <span className="text-[11px] font-semibold text-gray-900 whitespace-nowrap">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Filters button */}
            <div className="shrink-0 border-l border-gray-200 pl-4">
              <button
                onClick={() => setFiltersOpen(true)}
                className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilterCount > 0
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-900 hover:border-gray-900'
                }`}
              >
                <FiltersIcon />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <FiltersPanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        allHotels={hotels}
        priceRange={effectivePriceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClear={handleClearFilters}
      />

      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 pb-24 pt-6 md:pt-8">
        {/* Error */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl max-w-xl mx-auto text-sm text-center">
            {errorMsg}
            <button
              onClick={() => window.location.reload()}
              className="block mx-auto mt-2 underline font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── RECENTLY VIEWED ── */}
        {!isSearchActive && !isLoading && recentlyViewed.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recently viewed</h2>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">Pick up where you left off</p>
              </div>
              <button
                onClick={() => { localStorage.removeItem(RV_KEY); setRecentlyViewed([]); }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition shrink-0 ml-4"
              >
                Clear
              </button>
            </div>
            <CardGrid>
              {recentlyViewed.map((hd, i) => (
                <HotelCard
                  key={hd.hotel?.id ?? i}
                  hotelData={hd}
                  wishlist={wishlist}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </CardGrid>
          </div>
        )}

        {/* ── SAVED / WISHLIST ── */}
        {!isSearchActive && !isLoading && savedHotels.length > 0 && (
          <div className="mb-12">
            <div className="flex items-end mb-4 gap-2">
              <HeartIcon filled />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Saved places</h2>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                  {savedHotels.length} place{savedHotels.length !== 1 ? 's' : ''} in your wishlist
                </p>
              </div>
            </div>
            <CardGrid>
              {savedHotels.map((hd, i) => (
                <HotelCard
                  key={hd.hotel?.id ?? i}
                  hotelData={hd}
                  wishlist={wishlist}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </CardGrid>
          </div>
        )}

        {/* ── PAGE HEADING ── */}
        {isSearchActive ? (
          <div className="mb-6 md:mb-8 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Stays in {urlCity}
              </h1>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                {isLoading
                  ? 'Searching…'
                  : `${sorted.length} place${sorted.length !== 1 ? 's' : ''} found · ${startDate} – ${endDate}`}
              </p>
            </div>
            {!isLoading && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-gray-900 transition bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Trending destinations
            </h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Explore curated residential spaces across India
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <CardGrid>
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </CardGrid>
        )}

        {/* Empty state */}
        {!isLoading && sorted.length === 0 && !errorMsg && (
          <div className="text-center mt-16 max-w-sm mx-auto">
            <div className="text-6xl mb-4">{activeFilterCount > 0 ? '🔧' : '🔍'}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeFilterCount > 0 ? 'No places match your filters' : 'No places found'}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {activeFilterCount > 0
                ? 'Try adjusting your price range or sort order.'
                : 'Try different dates, city, or number of rooms.'}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={handleClearFilters}
                className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Search results grid */}
        {!isLoading && sorted.length > 0 && isSearchActive && (
          <CardGrid>
            {sorted.map((hd, i) => (
              <HotelCard
                key={hd.hotel?.id ?? i}
                hotelData={hd}
                wishlist={wishlist}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </CardGrid>
        )}

        {/* Default city sections */}
        {!isLoading && sorted.length > 0 && !isSearchActive && (
          <div className="flex flex-col gap-14">
            {Object.entries(groupedByCity).map(([cityName, cityHotels]) => (
              <CitySection
                key={cityName}
                cityName={cityName}
                cityHotels={cityHotels}
                wishlist={wishlist}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}