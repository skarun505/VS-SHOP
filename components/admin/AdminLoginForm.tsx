"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.ok) {
        window.location.href = "/admin";
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Login network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
      <div className="text-center space-y-3">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs inline-block">
          <Image
            src="/logo.png"
            alt="Vercel Shop"
            width={140}
            height={38}
            className="h-8 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          Admin Portal Access
        </h1>
        <p className="text-xs text-slate-500">
          Enter your admin authorization credentials to access inventory and payments.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Admin Master Password
          </label>
          <input
            type="password"
            required
            placeholder="Enter admin password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Authorize &amp; Enter</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Restricted Store Admin Gateway</span>
      </div>
    </div>
  );
}
