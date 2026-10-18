"use client";

import React, { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface BulkProductImporterProps {
  onSuccess: (newProducts: any[]) => void;
  onClose: () => void;
}

const SAMPLE_CSV = `title,brand,modelNumber,category,mrpInr,priceInr,count,grade,serialOrImeis,batteryHealth,description,images
iPhone 15 Pro 128GB,Apple,A2848,smartphones,134900,89999,5,A_PLUS,"IMEI-358921001,IMEI-358921002",98,"Certified untouched like-new condition.",https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80
MacBook Air M2 13-inch,Apple,A2681,laptops,114900,74999,3,A_PLUS,SN-C02GF9281,100,"Battery cycles under 5. Untouched body.",https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80
Sony Bravia 55 OLED 4K,Sony,XR-55A80L,televisions,149900,92999,2,A,SN-SONY-55-901,,"Zero burn-in certified. Factory wall mount included.",https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80
LG 8kg AI Front Load Washer,LG,FHM1408BDW,appliances,48990,28999,4,A,SN-LG-WASH-102,,"Sanitized drum and 42-point motor calibration.",https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80`;

export function BulkProductImporter({ onSuccess, onClose }: BulkProductImporterProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ count: number; errors?: string[] } | null>(null);

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple CSV Parser handling quoted strings
  const parseCsv = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setErrorMsg("CSV must contain at least a header row and 1 product row.");
      setParsedRows([]);
      return;
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ""));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
    const items: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || values.every((v) => !v)) continue;

      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || "";
      });

      if (obj.title) {
        items.push(obj);
      }
    }

    setParsedRows(items);
    setErrorMsg(null);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseCsv(content);
    };
    reader.readAsText(file);
  };

  // Handle Submit
  const handleImport = async () => {
    if (parsedRows.length === 0) {
      setErrorMsg("No valid product rows to import.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedRows }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to import products.");
      } else {
        setImportResult({
          count: data.importedCount,
          errors: data.errors,
        });
        if (data.products && data.products.length > 0) {
          onSuccess(data.products);
        }
      }
    } catch (err: any) {
      setErrorMsg("Network error during bulk import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                Bulk Product &amp; Inventory Intake
              </h2>
              <p className="text-xs text-slate-500">
                Upload CSV or paste dozens of products to list them in seconds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Action Row: Sample Template & Tab selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "upload"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Upload CSV File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "paste"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Direct Paste CSV
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Sample CSV Template</span>
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === "upload" && (
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center transition-colors bg-white dark:bg-slate-950/50">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Drop your CSV file here, or <span className="text-emerald-600 underline">browse</span>
                </div>
                <p className="text-xs text-slate-400">
                  Supports comma-separated values (.csv) with header columns.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Direct Paste */}
          {activeTab === "paste" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Paste CSV Rows (including header line):
              </label>
              <textarea
                rows={6}
                value={csvText}
                placeholder={SAMPLE_CSV}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCsv(e.target.value);
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Successfully imported {importResult.count} products into live inventory!</span>
              </div>
              {importResult.errors && (
                <div className="text-xs text-amber-700 space-y-1 pl-7">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx}>&bull; {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && !importResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Preview: {parsedRows.length} Products Detected</span>
                <span className="text-emerald-600">Ready to save</span>
              </div>

              <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Brand</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Price (₹)</th>
                      <th className="p-2.5">Stock Count</th>
                      <th className="p-2.5">Grade</th>
                      <th className="p-2.5">IMEI / Serial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-[180px]">
                          {row.title}
                        </td>
                        <td className="p-2.5">{row.brand || "Apple"}</td>
                        <td className="p-2.5 capitalize">{row.category || "smartphones"}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600">
                          ₹{Number(row.priceinr || row.priceInr || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600">
                          {row.count || row.quantity || (row.serialorimeis ? row.serialorimeis.split(",").length : 1)} Units
                        </td>
                        <td className="p-2.5 font-bold">{row.grade || "A+"}</td>
                        <td className="p-2.5 font-mono text-slate-500 text-[11px] truncate max-w-[120px]">
                          {row.serialorimeis || row.serialOrImeis || "Auto-Generated"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            {importResult ? "Close" : "Cancel"}
          </button>

          {!importResult && (
            <button
              type="button"
              disabled={loading || parsedRows.length === 0}
              onClick={handleImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing {parsedRows.length} Products...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Import All {parsedRows.length} Products</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
