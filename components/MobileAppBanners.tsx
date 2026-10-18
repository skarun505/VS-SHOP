"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Sparkles, Clock, ArrowRight, ShieldCheck, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

export function MobileAppBanners() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Live countdown timer for Flash Deals (Amazon / Zepto style)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto advance slides every 4.5 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, []);

  const slides = [
    {
      id: "flash-sale",
      badge: "⚡ LIGHTNING DEAL",
      badgeColor: "bg-red-500 text-white animate-pulse",
      title: "Mega Tech Festival",
      subtitle: "Flagship Phones & Laptops Up to 55% Off Retail",
      gradient: "from-rose-600 via-red-600 to-amber-600",
      cta: "Grab Deal",
      href: "#deals",
      hasTimer: true,
      icon: Zap,
    },
    {
      id: "fast-delivery",
      badge: "🚀 ZEPTO-STYLE DISPATCH",
      badgeColor: "bg-emerald-400 text-slate-950 font-black",
      title: "Express Free Delivery",
      subtitle: "Same-Day Dispatch &bull; Insured Doorstep Delivery Across India",
      gradient: "from-emerald-700 via-teal-800 to-cyan-900",
      cta: "Explore Models",
      href: "#deals",
      hasTimer: false,
      icon: ShieldCheck,
    },
    {
      id: "upi-offer",
      badge: "💳 EXTRA SAVINGS",
      badgeColor: "bg-amber-300 text-slate-950 font-black",
      title: "Instant ₹1,000 Off via UPI",
      subtitle: "Scan & Pay with GPay, PhonePe or Paytm &bull; Zero Fees",
      gradient: "from-purple-700 via-indigo-700 to-blue-800",
      cta: "Use Code VERCELLIVE",
      href: "#deals",
      hasTimer: false,
      icon: CreditCard,
    },
  ];

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="md:hidden px-3 pt-1 pb-2">
      {/* Banner Carousel Card */}
      <div className="relative overflow-hidden rounded-2xl shadow-md">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`transition-all duration-500 ease-in-out ${
                isActive ? "opacity-100 relative block" : "opacity-0 absolute inset-0 pointer-events-none"
              }`}
            >
              <div
                className={`p-4 sm:p-5 bg-gradient-to-r ${slide.gradient} text-white flex flex-col justify-between min-h-[140px]`}
              >
                {/* Top Row: Badge + Timer */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs ${slide.badgeColor}`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {slide.badge}
                  </span>

                  {slide.hasTimer && (
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20">
                      <Clock className="w-3 h-3 text-amber-300 animate-spin" />
                      <span>
                        Ends: {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle: Title & Subtitle */}
                <div className="my-2 space-y-0.5">
                  <h3 className="text-lg font-black tracking-tight leading-tight text-white drop-shadow-xs">
                    {slide.title}
                  </h3>
                  <p
                    className="text-xs text-white/90 line-clamp-1 font-medium"
                    dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                  />
                </div>

                {/* Bottom Row: CTA Button + Slide Count */}
                <div className="flex items-center justify-between pt-1">
                  <a
                    href={slide.href}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-sm active:scale-95 transition-transform"
                  >
                    <span>{slide.cta}</span>
                    <ArrowRight className="w-3 h-3 text-slate-900" />
                  </a>

                  <span className="text-[10px] font-bold text-white/70">
                    {currentSlide + 1} / {slides.length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Dots */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide ? "w-5 bg-white shadow-xs" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
