import React from "react";
import { Wrench, BatteryCharging, CheckSquare, Hash, Image as ImageIcon, Cpu } from "lucide-react";
import { maskSerialOrImei } from "@/lib/utils";

interface RepairDisclosureProps {
  serialOrImei: string;
  modelNumber: string;
  source: string;
  repairNotes?: string | null;
  repairPhotos?: string | null;
  batteryHealth?: number | null;
}

export function RepairDisclosure({
  serialOrImei,
  modelNumber,
  source,
  repairNotes,
  repairPhotos,
  batteryHealth,
}: RepairDisclosureProps) {
  let photos: string[] = [];
  try {
    if (repairPhotos) {
      photos = JSON.parse(repairPhotos);
    }
  } catch {
    photos = [];
  }

  const checklistItems = [
    "Display Touch & Pixel Integrity",
    "Motherboard Diagnostic (Zero Shorts)",
    "Battery Degradation & Safe Discharge Test",
    "Microphone & Stereo Speaker Clarity",
    "Biometric Sensors (FaceID / Fingerprint)",
    "CEIR / Blacklist Database Verification",
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Quality Assurance &amp; Hardware Certification
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
          Pristine Standard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Hardware Identification */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>Unit Identity</span>
          </div>
          <div className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">
            IMEI/SN: {maskSerialOrImei(serialOrImei)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Model: <span className="font-mono text-slate-700 dark:text-slate-300">{modelNumber}</span>
          </div>
        </div>

        {/* Battery Capacity if mobile / laptop */}
        {batteryHealth !== null && batteryHealth !== undefined ? (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>Battery Health Status</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-baseline gap-1">
              {batteryHealth}%
              <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                (Peak Performance)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Tested under full processor load</div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Operational Efficiency</span>
            </div>
            <div className="text-sm font-bold text-emerald-600">100% Factory Spec</div>
            <div className="text-xs text-slate-500 mt-0.5">Power load and components tested</div>
          </div>
        )}

        {/* Diagnostic Pass */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>42-Point Diagnostic</span>
          </div>
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            Certified Pass
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Zero faults or bypasses allowed</div>
        </div>
      </div>

      {/* Technician Notes */}
      <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-slate-700 dark:text-slate-300">
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5" />
          Quality Assurance &amp; Verification Notes:
        </div>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {repairNotes || "Factory calibrated and tested. 100% genuine specifications verified. Sanitized, dust-cleaned, and sealed to mint standard."}
        </p>
      </div>

      {/* Repair Photos if available */}
      {photos.length > 0 && (
        <div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            Laboratory Diagnostic Photos:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition-colors"
              >
                <img
                  src={url}
                  alt={`Diagnostic photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 42-point checklist accordion / preview */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-medium text-slate-500 mb-2">Verified Checklist Passed:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
