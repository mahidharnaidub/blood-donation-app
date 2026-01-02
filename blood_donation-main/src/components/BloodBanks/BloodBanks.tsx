import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  Phone,
  Clock,
  MapPin,
  Navigation,
  Building2,
  X
} from 'lucide-react';
import { supabase, BloodBank } from '../../lib/supabase';
import { calculateDistance, formatDistance } from '../../utils/helpers';

/* ---------- HELPERS ---------- */
const formatLocation = (data: any) => {
  if (!data?.address) return 'Current Location';

  const {
    suburb,
    neighbourhood,
    village,
    town,
    city,
    county,
    state
  } = data.address;

  return (
    suburb ||
    neighbourhood ||
    village ||
    town ||
    city ||
    county ||
    state ||
    'Current Location'
  );
};

interface BloodBankWithDistance extends BloodBank {
  distance?: number;
}

export function BloodBanks() {
  const [banks, setBanks] = useState<BloodBankWithDistance[]>([]);
  const [filtered, setFiltered] = useState<BloodBankWithDistance[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  /* 📍 Location */
  const [locationLabel, setLocationLabel] =
    useState('Detecting location…');
  const [baseLat, setBaseLat] = useState<number | null>(null);
  const [baseLng, setBaseLng] = useState<number | null>(null);

  /* Location sheet */
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const startY = useRef<number | null>(null);

  /* ---------- LOCATION ---------- */
  const detectLocation = () => {
    setLocationLabel('Detecting location…');

    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setBaseLat(latitude);
        setBaseLng(longitude);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocationLabel(formatLocation(data));
        } catch {
          setLocationLabel('Current Location');
        }
      },
      () => setLocationLabel('Location permission denied')
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  /* ---------- MANUAL LOCATION SEARCH ---------- */
  useEffect(() => {
    if (manualLocation.length < 3) {
      setSuggestions([]);
      return;
    }

    const load = async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${manualLocation}`
      );
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    };

    load();
  }, [manualLocation]);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!baseLat || !baseLng) return;
    loadBanks();
  }, [baseLat, baseLng]);

  useEffect(() => {
    filterBanks();
  }, [banks, search]);

  const loadBanks = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('blood_banks').select('*');
      const source = data || [];

      const withDistance = source
        .map((b) => ({
          ...b,
          distance: calculateDistance(
            baseLat!,
            baseLng!,
            b.latitude,
            b.longitude
          )
        }))
        .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

      setBanks(withDistance);
    } catch (err) {
      console.error('Failed to load blood banks', err);
    } finally {
      setLoading(false);
    }
  };

  const filterBanks = () => {
    let list = [...banks];
    if (search) {
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.address.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  };

  /* ---------- UI ---------- */
  return (
    <div
      className="min-h-screen bg-[#FFF6F6] pb-28"
      onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (
          startY.current &&
          e.changedTouches[0].clientY - startY.current > 80
        ) {
          loadBanks();
        }
        startY.current = null;
      }}
    >
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-semibold">Blood Banks</h1>
              <p className="text-xs text-gray-500">
                Showing nearest hospitals based on your location
              </p>
            </div>
          </div>

          {/* LOCATION BAR */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm font-medium truncate flex-1">
              {locationLabel}
            </span>
            <button
              onClick={detectLocation}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Use GPS
            </button>
            <button
              onClick={() => setShowLocationSheet(true)}
              className="text-xs text-gray-500 font-semibold hover:underline"
            >
              Change
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospital or area"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {loading ? (
          <p className="text-center py-16 text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-gray-500">
            No blood banks found
          </p>
        ) : (
          filtered.map((bank) => (
            <div
              key={bank.id}
              className="
                group rounded-2xl p-4
                bg-gradient-to-br from-white to-red-50
                border border-red-100
                shadow-sm
                transition-all duration-300
                hover:shadow-xl hover:-translate-y-1
                active:scale-[0.97]
              "
            >
              <div className="flex gap-4">
                {/* ICON */}
                <div
                  className="
                    w-12 h-12 rounded-xl
                    bg-white shadow-sm
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:shadow-md
                  "
                >
                  <Building2
                    className="
                      w-6 h-6 text-red-500
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                  />
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {bank.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {bank.address}
                  </p>

                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {formatDistance(bank.distance!)} away
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <Clock className="w-4 h-4" />
                    {bank.operating_hours}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() =>
                    (window.location.href = `tel:${bank.phone}`)
                  }
                  className="
                    py-2 rounded-xl
                    bg-green-500 text-white font-medium
                    transition-all duration-200
                    hover:bg-green-600
                    active:scale-95 active:shadow-inner
                  "
                >
                  <Phone className="inline w-4 h-4 mr-1" /> Call
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`,
                      '_blank'
                    )
                  }
                  className="
                    py-2 rounded-xl
                    bg-gray-100 text-gray-700
                    transition-all duration-200
                    hover:bg-gray-200
                    active:scale-95
                  "
                >
                  <Navigation className="inline w-4 h-4 mr-1" /> Directions
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LOCATION BOTTOM SHEET */}
      {showLocationSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold">Change location</p>
              <X
                onClick={() => setShowLocationSheet(false)}
                className="cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                detectLocation();
                setShowLocationSheet(false);
              }}
              className="
                w-full bg-red-500 text-white py-2 rounded-xl mb-3
                transition hover:bg-red-600 active:scale-95
              "
            >
              Use current location
            </button>

            <input
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Search area or city"
              className="w-full border rounded-xl px-3 py-2 mb-2"
            />

            {suggestions.map((s) => (
              <button
                key={s.place_id}
                onClick={() => {
                  setBaseLat(parseFloat(s.lat));
                  setBaseLng(parseFloat(s.lon));
                  setLocationLabel(
                    s.display_name.split(',').slice(0, 2).join(',')
                  );
                  setShowLocationSheet(false);
                }}
                className="
                  w-full text-left px-3 py-2 text-sm border-b
                  hover:bg-gray-50
                "
              >
                {s.display_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
