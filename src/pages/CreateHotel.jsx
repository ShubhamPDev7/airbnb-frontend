import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Basics', 'Amenities', 'Photos'];

const AMENITY_OPTIONS = [
  { label: 'WiFi', icon: '📶' },
  { label: 'Pool', icon: '🏊' },
  { label: 'Kitchen', icon: '🍳' },
  { label: 'Free parking on premises', icon: '🚗' },
  { label: 'Air conditioning', icon: '❄️' },
  { label: 'Dedicated workspace', icon: '💼' },
  { label: 'TV', icon: '📺' },
  { label: 'Washing machine', icon: '🫧' },
  { label: 'Gym', icon: '🏋️' },
  { label: 'Hot tub', icon: '🛁' },
  { label: 'BBQ grill', icon: '🔥' },
  { label: 'Breakfast included', icon: '🥐' },
];

export default function CreateHotel() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phoneNumber: '',
    contactEmail: '',
  });
  const [amenities, setAmenities] = useState([]);
  const [photoUrls, setPhotoUrls] = useState(['', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const toggleAmenity = (label) => {
    setAmenities(prev =>
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
    );
  };

  const handlePhotoChange = (index, value) => {
    const next = [...photoUrls];
    next[index] = value;
    setPhotoUrls(next);
  };

  const validateStep = () => {
    if (step === 0) {
      const { name, city, address, phoneNumber, contactEmail } = formData;
      if (!name.trim() || !city.trim() || !address.trim() || !phoneNumber.trim() || !contactEmail.trim()) {
        setErrorMsg('Please fill in all fields before continuing.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setErrorMsg('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrorMsg('');
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const cleanPhotos = photoUrls.filter(url => url.trim() !== '');

    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, amenities, photos: cleanPhotos }),
      });

      const jsonResponse = await response.json();

      if (response.ok && jsonResponse.data) {
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(jsonResponse.error?.message || 'Failed to create property.');
      }
    } catch {
      setErrorMsg('Could not connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-white">

      {/* ── TOP PROGRESS BAR ── */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo / back */}
            <button
              onClick={() => step === 0 ? navigate(-1) : goBack()}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {step === 0 ? 'Exit' : 'Back'}
            </button>

            {/* Step pills */}
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    i === step
                      ? 'bg-gray-900 text-white'
                      : i < step
                      ? 'bg-gray-100 text-gray-500'
                      : 'text-gray-400'
                  }`}>
                    {i < step && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    {s}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px ${i < step ? 'bg-gray-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step count */}
            <span className="text-xs text-gray-400 font-medium">{step + 1} / {STEPS.length}</span>
          </div>
        </div>

        {/* thin progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full bg-[#FF385C] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="pt-24 pb-32 px-4 sm:px-6 max-w-2xl mx-auto">

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {errorMsg}
          </div>
        )}

        {/* ── STEP 0: Basics ── */}
        {step === 0 && (
          <div>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-2">Tell us about your place</h1>
              <p className="text-gray-500">Share some basics, so guests know what your property is like.</p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Property Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Property name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Koregaon Park Luxury Loft"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* City + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Pune"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, area, landmark"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Contact email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="host@example.com"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition text-gray-900 placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-2">Guests may use this to reach you before their stay.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Amenities ── */}
        {step === 1 && (
          <div>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-2">What does your place offer?</h1>
              <p className="text-gray-500">Pick everything that's available for guests to use.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map(({ label, icon }) => {
                const selected = amenities.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleAmenity(label)}
                    className={`relative flex flex-col items-start gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all text-left ${
                      selected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                    <span className="text-2xl leading-none">{icon}</span>
                    <span className={`text-sm font-medium leading-tight ${selected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {amenities.length > 0 && (
              <p className="text-sm text-gray-500 mt-5">
                {amenities.length} amenit{amenities.length === 1 ? 'y' : 'ies'} selected
              </p>
            )}
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 2 && (
          <div>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-2">Add some photos</h1>
              <p className="text-gray-500">Paste up to 5 image URLs. The first photo is your cover shot.</p>
            </div>

            {/* Live bento preview */}
            {photoUrls.some(u => u.trim()) && (
              <div className="mb-8 grid grid-cols-4 grid-rows-2 gap-2 h-[220px] sm:h-[280px] rounded-2xl overflow-hidden">
                <div className="col-span-2 row-span-2 bg-gray-100 overflow-hidden">
                  {photoUrls[0]?.trim()
                    ? <img src={photoUrls[0]} alt="Photo 1" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    : <EmptySlot label="Cover photo" />
                  }
                </div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="col-span-1 row-span-1 bg-gray-100 overflow-hidden">
                    {photoUrls[i]?.trim()
                      ? <img src={photoUrls[i]} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      : <EmptySlot label={`Photo ${i + 1}`} />
                    }
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {photoUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    url.trim() ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handlePhotoChange(index, e.target.value)}
                      placeholder={index === 0 ? 'Cover photo URL (required for listing)' : `Photo ${index + 1} URL (optional)`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition text-sm text-gray-900 placeholder-gray-400 pr-10"
                    />
                    {url.trim() && (
                      <button
                        type="button"
                        onClick={() => handlePhotoChange(index, '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-5 leading-relaxed">
              Tip: use Unsplash URLs like <span className="font-mono bg-gray-100 px-1 rounded">https://images.unsplash.com/photo-...</span>
            </p>
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM CTA ── */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#FF385C] text-white rounded-xl text-sm font-semibold hover:bg-[#E61E4D] transition disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing…
                </>
              ) : (
                'Publish property'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ label }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-50">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span className="text-[10px] text-gray-300 font-medium">{label}</span>
    </div>
  );
}