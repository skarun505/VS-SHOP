"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Zap,
  X,
  Compass,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface LocationState {
  city: string;
  pincode: string;
  state?: string;
  area?: string;
  formatted: string;
}

const DEFAULT_LOCATION: LocationState = {
  city: "Bengaluru",
  pincode: "560038",
  state: "Karnataka",
  formatted: "Bengaluru 560038",
};

const POPULAR_CITIES = [
  { city: "Bengaluru", pin: "560001", tag: "Same Day" },
  { city: "Mumbai", pin: "400001", tag: "Same Day" },
  { city: "Delhi NCR", pin: "110001", tag: "Next Day" },
  { city: "Hyderabad", pin: "500001", tag: "Next Day" },
  { city: "Chennai", pin: "600001", tag: "Next Day" },
  { city: "Pune", pin: "411001", tag: "Next Day" },
  { city: "Kolkata", pin: "700001", tag: "2-Day Air" },
];

export function MobileSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualPin, setManualPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Auto-fetch location on initial mount
  useEffect(() => {
    // 1. Check local storage
    try {
      const saved = localStorage.getItem("pt_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city && parsed.pincode) {
          setLocation(parsed);
          return;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    // 2. Auto-fetch via IP/GeoIP API
    const autoFetch = async () => {
      try {
        const res = await fetch("/api/location/detect");
        if (res.ok) {
          const data = await res.json();
          if (data && data.city) {
            const loc: LocationState = {
              city: data.city,
              pincode: data.pincode || "560001",
              state: data.state || "",
              area: data.area || "",
              formatted: data.formatted || `${data.city} ${data.pincode || ""}`,
            };
            setLocation(loc);
            try {
              localStorage.setItem("pt_user_location", JSON.stringify(loc));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Auto location detect skipped:", err);
      }
    };

    autoFetch();
  }, []);

  // Handler for GPS Auto-Detect
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setPinError("GPS is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setPinError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`/api/location/detect?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const loc: LocationState = {
              city: data.city || "Bengaluru",
              pincode: data.pincode || "560001",
              state: data.state || "",
              area: data.area || "",
              formatted: data.formatted || `${data.city} ${data.pincode}`,
            };
            setLocation(loc);
            try {
              localStorage.setItem("pt_user_location", JSON.stringify(loc));
            } catch {}
            setModalOpen(false);
          } else {
            setPinError("Could not resolve location. Please enter pincode.");
          }
        } catch {
          setPinError("Network error detecting location.");
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPinError("Location access denied. Please enter your pincode below.");
        } else {
          setPinError("GPS timeout. Please select your city or enter pincode.");
        }
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Handler for Manual Pincode Submission
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualPin.trim().replace(/\D/g, "");
    if (clean.length !== 6) {
      setPinError("Please enter a 6-digit Indian postal code");
      return;
    }

    setIsDetecting(true);
    setPinError(null);

    try {
      const res = await fetch("/api/location/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const loc: LocationState = {
          city: data.city,
          pincode: data.pincode,
          state: data.state,
          formatted: data.formatted,
        };
        setLocation(loc);
        try {
          localStorage.setItem("pt_user_location", JSON.stringify(loc));
        } catch {}
        setModalOpen(false);
        setManualPin("");
      } else {
        setPinError(data.error || "Invalid pincode");
      }
    } catch {
      setPinError("Failed to save location");
    } finally {
      setIsDetecting(false);
    }
  };

  // Select Quick City
  const handleSelectQuickCity = (city: string, pin: string) => {
    const loc: LocationState = {
      city,
      pincode: pin,
      formatted: `${city} ${pin}`,
    };
    setLocation(loc);
    try {
      localStorage.setItem("pt_user_location", JSON.stringify(loc));
    } catch {}
    setModalOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const lower = query.toLowerCase();
    if (lower.includes("phone") || lower.includes("iphone") || lower.includes("samsung")) {
      router.push("/category/smartphones");
    } else if (lower.includes("mac") || lower.includes("laptop") || lower.includes("dell")) {
      router.push("/category/laptops");
    } else if (lower.includes("tv") || lower.includes("oled") || lower.includes("sony")) {
      router.push("/category/televisions");
    } else if (lower.includes("wash") || lower.includes("appliance")) {
      router.push("/category/appliances");
    } else {
      router.push("/#deals");
    }
  };

  return (
    <>
      <div className="md:hidden px-3 pt-2.5 pb-1.5 space-y-2 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        {/* Zepto/Blinkit Delivery Pill with 1-Tap Location Changer */}
        <div className="flex items-center justify-between text-xs gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold truncate active:opacity-70 transition-opacity text-left cursor-pointer select-none"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate text-[11px]">
              Deliver to:{" "}
              <strong className="text-slate-950 dark:text-white font-extrabold underline decoration-emerald-500/50 underline-offset-2">
                {location.city} {location.pincode}
              </strong>
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            <span>Express Free</span>
          </div>
        </div>

        {/* Amazon-style search box */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search 'iPhone 15', 'MacBook M3', 'Sony OLED'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Location Picker Bottom Sheet Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Choose Delivery Location
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Get accurate delivery dates and same-day courier dispatch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Auto-detect Button */}
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={isDetecting}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                {isDetecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Compass className="w-4 h-4 text-white" />
                )}
                <span>
                  {isDetecting ? "Detecting Your Precise GPS..." : "Auto-Fetch Current Location (GPS)"}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-700/60 px-2 py-0.5 rounded-md">
                1-Tap Auto
              </span>
            </button>

            {/* Manual Pincode Form */}
            <form onSubmit={handlePinSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="Or enter 6-digit Pincode (e.g. 560001)"
                  value={manualPin}
                  onChange={(e) => {
                    setManualPin(e.target.value);
                    setPinError(null);
                  }}
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="submit"
                  disabled={manualPin.trim().length !== 6 || isDetecting}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-40 transition-colors"
                >
                  Apply
                </button>
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-500 font-semibold px-1">{pinError}</p>
              )}
            </form>

            {/* Popular Express Delivery Hubs */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular Express Metro Hubs:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CITIES.map((c) => {
                  const isCurrent = location.city.toLowerCase().includes(c.city.toLowerCase().slice(0, 4));
                  return (
                    <button
                      key={c.city}
                      type="button"
                      onClick={() => handleSelectQuickCity(c.city, c.pin)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all active:scale-98 ${
                        isCurrent
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[11px] flex items-center gap-1">
                          {c.city}
                          {isCurrent && <Check className="w-3 h-3 text-emerald-600" />}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{c.pin}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {c.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Guarantee Pill */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Free doorstep courier delivery &amp; 7-day return policy active across India.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
