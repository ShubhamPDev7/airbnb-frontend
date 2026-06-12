import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import { extractError } from '../config/apiError';
import { useNavigate } from 'react-router-dom';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

// ── Fallback photos pool ──────────────────────────────────────────────────────
const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-c53cd4b85d05?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
];

function getHotelCover(hotel) {
  // Try real photos first
  if (hotel.photos?.length > 0) {
    const first = hotel.photos[0];
    if (first && typeof first === 'string' && first.trim() !== '' && !first.includes('unsplash.com/photos/')) {
      return first;
    }
  }
  // Deterministic fallback based on hotel id
  return FALLBACK_PHOTOS[(hotel.id ?? 0) % FALLBACK_PHOTOS.length];
}

// ── Room type presets ─────────────────────────────────────────────────────────
const ROOM_PRESETS = [
  'Deluxe Suite',
  'Standard Double Room',
  'Twin Room',
  'Single Room',
  'Family Suite',
  'Presidential Suite',
  'Studio Apartment',
  'Penthouse',
];

// ── Amenity quick-picks for room ──────────────────────────────────────────────
const ROOM_AMENITY_OPTIONS = [
  { label: 'WiFi', icon: '📶' },
  { label: 'AC', icon: '❄️' },
  { label: 'TV', icon: '📺' },
  { label: 'Mini Bar', icon: '🍹' },
  { label: 'Balcony', icon: '🌅' },
  { label: 'Jacuzzi', icon: '🛁' },
  { label: 'Sea View', icon: '🌊' },
  { label: 'Kitchen', icon: '🍳' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedHotelForRoom, setSelectedHotelForRoom] = useState(null);
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [roomForm, setRoomForm] = useState({
    type: '',
    customType: '',
    basePrice: '',
    capacity: 2,
    totalCount: 1,
    amenities: [],
    extraAmenities: '',
  });

  useEffect(() => { fetchMyHotels(); }, []);

  const fetchMyHotels = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetch(apiUrl('/admin/hotels'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        const baseHotels = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : [json]);
        const hotelsWithRooms = await Promise.all(baseHotels.map(async (hotel) => {
          try {
            const roomRes = await fetch(apiUrl(`/admin/hotels/${hotel.id}/rooms`), {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (roomRes.ok) {
              const roomJson = await roomRes.json();
              hotel.rooms = Array.isArray(roomJson.data) ? roomJson.data : (Array.isArray(roomJson) ? roomJson : []);
            } else {
              hotel.rooms = [];
            }
          } catch {
            hotel.rooms = [];
          }
          return hotel;
        }));
        setHotels(hotelsWithRooms);
      }
    } catch (err) {
      console.error('Failed to load hotels', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (hotelId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl(`/admin/hotels/${hotelId}/activate`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchMyHotels();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl(`/admin/hotels/${hotelId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchMyHotels();
    } catch (err) { console.error(err); }
  };

  const openRoomModal = (hotel) => {
    setSelectedHotelForRoom(hotel);
    setRoomError('');
    setRoomForm({ type: '', customType: '', basePrice: '', capacity: 2, totalCount: 1, amenities: [], extraAmenities: '' });
  };

  const toggleRoomAmenity = (label) => {
    setRoomForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(label)
        ? prev.amenities.filter(a => a !== label)
        : [...prev.amenities, label],
    }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setRoomError('');

    const finalType = roomForm.type === '__custom__' ? roomForm.customType.trim() : roomForm.type.trim();
    if (!finalType) { setRoomError('Please enter a room type.'); return; }
    if (!roomForm.basePrice || Number(roomForm.basePrice) <= 0) { setRoomError('Please enter a valid price.'); return; }

    setIsSubmittingRoom(true);
    const token = localStorage.getItem('token');

    // Merge quick-pick amenities + extra comma-separated
    const extraList = roomForm.extraAmenities.split(',').map(i => i.trim()).filter(Boolean);
    const allAmenities = [...new Set([...roomForm.amenities, ...extraList])];

    const payload = {
      type: finalType,
      basePrice: Number(roomForm.basePrice),
      capacity: Number(roomForm.capacity),
      totalCount: Number(roomForm.totalCount),
      amenities: allAmenities,
      hotelId: Number(selectedHotelForRoom.id),
    };

    try {
      const res = await fetch(apiUrl(`/admin/hotels/${selectedHotelForRoom.id}/rooms`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSelectedHotelForRoom(null);
        fetchMyHotels();
      } else {
        const json = await res.json();
        setRoomError(extractError(json, 'Failed to add room.'));
      }
    } catch {
      setRoomError('Network error. Please try again.');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRooms = hotels.reduce((acc, h) => acc + (h.rooms?.length ?? 0), 0);
  const activeCount = hotels.filter(h => h.active || h.isActive).length;

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF385C] border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 lg:px-20 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Your Properties</h1>
            <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Manage listings, add rooms, and go live.</p>
          </div>
          <button
            onClick={() => navigate('/host/create')}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-black transition text-sm shadow-sm"
          >
            <PlusIcon />
            <span className="hidden sm:inline">New Property</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-10 lg:px-20 py-8">

        {/* ── STATS ROW ────────────────────────────────────────────────────── */}
        {hotels.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total Properties', value: hotels.length },
              { label: 'Active Listings', value: activeCount },
              { label: 'Room Configurations', value: totalRooms },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
        {hotels.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5 text-gray-400">
              <BuildingIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h2>
            <p className="text-gray-500 text-sm mb-7 max-w-xs">List your first property and start welcoming guests.</p>
            <button
              onClick={() => navigate('/host/create')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-md"
            >
              <PlusIcon /> Become a Host
            </button>
          </div>
        ) : (

          /* ── HOTEL GRID ──────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((hotel) => {
              const isActive = hotel.active || hotel.isActive;
              const roomCount = hotel.rooms?.length ?? 0;
              const coverPhoto = getHotelCover(hotel);

              return (
                <div
                  key={hotel.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col"
                >
                  {/* ── Cover photo ── */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={coverPhoto}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // If real photo fails, swap to a deterministic fallback
                        e.target.onerror = null;
                        e.target.src = FALLBACK_PHOTOS[(hotel.id ?? 0) % FALLBACK_PHOTOS.length];
                      }}
                    />
                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Status pill */}
                    <div className="absolute top-3 left-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/90 backdrop-blur text-green-700 px-2.5 py-1 rounded-full shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/90 backdrop-blur text-amber-700 px-2.5 py-1 rounded-full shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Hotel ID badge */}
                    <div className="absolute top-3 right-3 text-[11px] font-semibold bg-black/40 backdrop-blur text-white px-2 py-0.5 rounded-full">
                      #{hotel.id}
                    </div>

                    {/* Room count badge on photo bottom */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      <BedIcon />
                      {roomCount === 0 ? 'No rooms yet' : `${roomCount} room type${roomCount > 1 ? 's' : ''}`}
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 truncate leading-snug">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1 mb-4">
                      <LocationIcon />
                      <span>{hotel.city}, India</span>
                    </div>

                    {/* Add Room button */}
                    <button
                      onClick={() => openRoomModal(hotel)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition mb-3"
                    >
                      <PlusIcon /> Add Room
                    </button>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-auto">
                      {!isActive && (
                        <button
                          onClick={() => handleActivate(hotel.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-sm"
                        >
                          <CheckIcon /> Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(hotel.id)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition ${!isActive ? 'px-4' : 'flex-1'}`}
                      >
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD ROOM MODAL ──────────────────────────────────────────────────── */}
      {selectedHotelForRoom && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelectedHotelForRoom(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-start px-6 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add a room type</h3>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <LocationIcon />
                  {selectedHotelForRoom.name} · {selectedHotelForRoom.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedHotelForRoom(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 shrink-0 mt-0.5"
              >
                <XIcon />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {roomError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {roomError}
                </div>
              )}

              <form onSubmit={handleCreateRoom} id="roomForm">
                <div className="flex flex-col gap-5">

                  {/* ── Room type select ── */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Room type</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {ROOM_PRESETS.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRoomForm(f => ({ ...f, type: preset, customType: '' }))}
                          className={`py-2.5 px-3 border-2 rounded-xl text-sm font-medium text-left transition ${
                            roomForm.type === preset
                              ? 'border-gray-900 bg-gray-50 text-gray-900'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRoomForm(f => ({ ...f, type: '__custom__' }))}
                        className={`py-2.5 px-3 border-2 rounded-xl text-sm font-medium text-left transition col-span-2 ${
                          roomForm.type === '__custom__'
                            ? 'border-gray-900 bg-gray-50 text-gray-900'
                            : 'border-dashed border-gray-300 text-gray-500 hover:border-gray-500'
                        }`}
                      >
                        + Custom type…
                      </button>
                    </div>
                    {roomForm.type === '__custom__' && (
                      <input
                        autoFocus
                        type="text"
                        placeholder="e.g. Garden Cottage"
                        value={roomForm.customType}
                        onChange={e => setRoomForm(f => ({ ...f, customType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                      />
                    )}
                  </div>

                  {/* ── Price / Capacity / Count ── */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Pricing & availability</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Price / night (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">₹</span>
                          <input
                            required type="number" min="1"
                            value={roomForm.basePrice}
                            onChange={e => setRoomForm(f => ({ ...f, basePrice: e.target.value }))}
                            placeholder="2999"
                            className="w-full pl-7 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Capacity</label>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-[46px]">
                          <button type="button" onClick={() => setRoomForm(f => ({ ...f, capacity: Math.max(1, f.capacity - 1) }))} className="w-10 h-full flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition shrink-0">−</button>
                          <span className="flex-1 text-center text-sm font-semibold text-gray-900">{roomForm.capacity}</span>
                          <button type="button" onClick={() => setRoomForm(f => ({ ...f, capacity: f.capacity + 1 }))} className="w-10 h-full flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition shrink-0">+</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Inventory</label>
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-[46px]">
                          <button type="button" onClick={() => setRoomForm(f => ({ ...f, totalCount: Math.max(1, f.totalCount - 1) }))} className="w-10 h-full flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition shrink-0">−</button>
                          <span className="flex-1 text-center text-sm font-semibold text-gray-900">{roomForm.totalCount}</span>
                          <button type="button" onClick={() => setRoomForm(f => ({ ...f, totalCount: f.totalCount + 1 }))} className="w-10 h-full flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition shrink-0">+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Amenities quick-picks ── */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Room amenities</label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {ROOM_AMENITY_OPTIONS.map(({ label, icon }) => {
                        const selected = roomForm.amenities.includes(label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleRoomAmenity(label)}
                            className={`relative flex flex-col items-center gap-1 py-3 px-2 border-2 rounded-xl transition ${
                              selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {selected && (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-gray-900 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-2 h-2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            )}
                            <span className="text-lg leading-none">{icon}</span>
                            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Extra amenities text field */}
                    <input
                      type="text"
                      value={roomForm.extraAmenities}
                      onChange={e => setRoomForm(f => ({ ...f, extraAmenities: e.target.value }))}
                      placeholder="More amenities, comma separated (e.g. Safe, Hairdryer)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition placeholder-gray-400"
                    />
                  </div>

                </div>
              </form>
            </div>

            {/* ── Modal footer CTA ── */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3 bg-white">
              <button
                type="button"
                onClick={() => setSelectedHotelForRoom(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="roomForm"
                disabled={isSubmittingRoom}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#FF385C] text-white hover:bg-[#E61E4D] transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmittingRoom
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  : 'Save room'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}