"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, X } from "lucide-react";

export function ExitIntentOffer({ onApply }: { onApply: (code: string) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    if (typeof window === "undefined" || sessionStorage.getItem("exit_shown")) {
      return;
    }

    const showModal = () => {
      setOpen(true);
      sessionStorage.setItem("exit_shown", "1");
    };

    // Desktop mouse leave check (cursor leaves top of viewport)
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showModal();
      }
    };

    document.addEventListener("mouseleave", onLeave);

    // Mobile timeout check (20s idle)
    const timer = setTimeout(showModal, 20000);

    return () => {
      document.removeEventListener("mouseleave", onLeave);
      clearTimeout(timer);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative max-w-sm w-full rounded-3xl bg-white dark:bg-slate-900 p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Close icon */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Exclusive Session Privilege
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
            Wait! Take an Extra 5% Off
          </h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            We hold this unit for your checkout. Apply code{" "}
            <span className="font-mono font-bold text-emerald-600">EXIT5</span> to save 5% extra immediately if paid within the reserved window.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              onApply("EXIT5");
              setOpen(false);
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            Apply 5% Off Now (Code: EXIT5)
          </button>
          <button
            className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-2"
            onClick={() => setOpen(false)}
          >
            No thanks, I will pay regular price
          </button>
        </div>
      </div>
    </div>
  );
}
