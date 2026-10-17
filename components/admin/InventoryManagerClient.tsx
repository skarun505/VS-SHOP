"use client";

import React, { useState, useEffect } from "react";
import { ConditionBadge } from "@/components/ConditionBadge";
import { formatINR, maskSerialOrImei } from "@/lib/utils";
import { suggestPrice, GRADE_DISCOUNT } from "@/lib/pricing";
import {
  Plus,
  Package,
  Wrench,
  BatteryCharging,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

interface ProductOption {
  id: string;
  title: string;
  brand: string;
  modelNumber: string;
  mrp: number;
}

interface UnitItem {
  id: string;
  serialOrImei: string;
  grade: string;
  source: string;
  costPaise: number;
  pricePaise: number;
  floorPaise: number;
  repairNotes?: string | null;
  batteryHealth?: number | null;
  status: string;
  product: {
    id: string;
    title: string;
    modelNumber: string;
    mrp: number;
  };
}

export function InventoryManagerClient({
  products,
  initialUnits,
}: {
  products: ProductOption[];
  initialUnits: UnitItem[];
}) {
  const [units, setUnits] = useState<UnitItem[]>(initialUnits);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Price Edit Modal State
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [newSellingPriceInr, setNewSellingPriceInr] = useState("");
  const [newCostPriceInr, setNewCostPriceInr] = useState("");
  const [newStatus, setNewStatus] = useState("AVAILABLE");
  const [newGrade, setNewGrade] = useState("A_PLUS");
  const [newRepairNotes, setNewRepairNotes] = useState("");
  const [newBatteryHealth, setNewBatteryHealth] = useState("");
  const [priceEditError, setPriceEditError] = useState<string | null>(null);
  const [priceEditSaving, setPriceEditSaving] = useState(false);

  // Form State for Adding New Unit
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [serialOrImei, setSerialOrImei] = useState("");
  const [grade, setGrade] = useState("A_PLUS");
  const [source, setSource] = useState("OPEN_BOX");
  const [costRupees, setCostRupees] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [repairNotes, setRepairNotes] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [repairPhotoUrl, setRepairPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-detect productId from URL query params (e.g. ?productId=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paramProdId = params.get("productId");
      if (paramProdId && products.some((p) => p.id === paramProdId)) {
        setProductId(paramProdId);
        setShowAddModal(true);
      }
    }
  }, [products]);

  // Selected product for addition
  const selectedProduct = products.find((p) => p.id === productId) || products[0];

  // Auto calculate price suggestion and floor
  const costPaise = Math.round((parseFloat(costRupees) || 0) * 100);
  const calculated = selectedProduct
    ? suggestPrice(selectedProduct.mrp, grade, costPaise)
    : { price: 0, floor: 0 };

  const proposedPricePaise = Math.round((parseFloat(priceRupees) || 0) * 100);
  const isBelowFloor = proposedPricePaise > 0 && proposedPricePaise < calculated.floor;

  const handleAutoSuggest = () => {
    if (calculated.price > 0) {
      setPriceRupees((calculated.price / 100).toString());
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isBelowFloor) {
      setErrorMsg(`Cannot save unit: Price is below the 12% margin floor (₹${calculated.floor / 100}).`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          serialOrImei: serialOrImei.trim(),
          grade,
          source,
          costPaise,
          pricePaise: proposedPricePaise,
          repairNotes: repairNotes.trim() || null,
          batteryHealth: batteryHealth ? parseInt(batteryHealth, 10) : null,
          repairPhotos: repairPhotoUrl.trim() ? [repairPhotoUrl.trim()] : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create unit");
        setSubmitting(false);
        return;
      }

      setUnits((prev) => [
        {
          ...data.unit,
          product: selectedProduct,
        },
        ...prev,
      ]);

      setSuccessMsg(`Unit with IMEI/SN ${serialOrImei} registered successfully!`);
      setShowAddModal(false);
      // Reset form
      setSerialOrImei("");
      setCostRupees("");
      setPriceRupees("");
      setRepairNotes("");
      setBatteryHealth("");
      setRepairPhotoUrl("");
    } catch {
      setErrorMsg("Network error saving unit");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Quick Edit Unit
  const openEditUnitModal = (u: UnitItem) => {
    setEditingUnit(u);
    setNewSellingPriceInr((u.pricePaise / 100).toString());
    setNewCostPriceInr((u.costPaise / 100).toString());
    setNewStatus(u.status);
    setNewGrade(u.grade);
    setNewRepairNotes(u.repairNotes || "");
    setNewBatteryHealth(u.batteryHealth?.toString() || "");
    setPriceEditError(null);
  };

  const handleSaveUnitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    setPriceEditSaving(true);
    setPriceEditError(null);

    const pricePaise = Math.round(parseFloat(newSellingPriceInr) * 100);
    const costPaise = Math.round(parseFloat(newCostPriceInr) * 100);

    try {
      const res = await fetch("/api/admin/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUnit.id,
          pricePaise,
          costPaise,
          status: newStatus,
          grade: newGrade,
          repairNotes: newRepairNotes.trim() || null,
          batteryHealth: newBatteryHealth ? parseInt(newBatteryHealth, 10) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update unit");
      }

      // Update in state
      setUnits((prev) =>
        prev.map((item) =>
          item.id === editingUnit.id
            ? {
                ...item,
                pricePaise,
                costPaise,
                status: newStatus,
                grade: newGrade,
                repairNotes: newRepairNotes,
                batteryHealth: newBatteryHealth ? parseInt(newBatteryHealth, 10) : null,
                floorPaise: data.unit?.floorPaise ?? item.floorPaise,
              }
            : item
        )
      );

      setSuccessMsg(`Unit updated with selling price ₹${newSellingPriceInr}!`);
      setEditingUnit(null);
    } catch (err: any) {
      setPriceEditError(err.message || "Failed to update unit");
    } finally {
      setPriceEditSaving(false);
    }
  };

  const handleDeleteUnit = async (u: UnitItem) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete unit "${u.serialOrImei}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/units?id=${u.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to delete unit");
        return;
      }

      setUnits((prev) => prev.filter((item) => item.id !== u.id));
      setSuccessMsg(`Unit ${u.serialOrImei} deleted from inventory.`);
    } catch (err: any) {
      alert("Error deleting unit: " + err.message);
    }
  };

  // Quick status toggle without modal
  const handleQuickStatusChange = async (unitId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "AVAILABLE"
        ? "RESERVED"
        : currentStatus === "RESERVED"
        ? "SOLD"
        : "AVAILABLE";

    try {
      const res = await fetch("/api/admin/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: unitId,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setUnits((prev) =>
          prev.map((u) => (u.id === unitId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUnits = units.filter((u) => {
    const matchesStatus = filterStatus === "ALL" || u.status === filterStatus;
    const matchesSearch =
      u.serialOrImei.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.product.modelNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control bar: Filters, Search, Add Unit */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {["ALL", "AVAILABLE", "RESERVED", "SOLD"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st} ({units.filter((u) => (st === "ALL" ? true : u.status === st)).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by IMEI, Serial, or Model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Add Unit Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Unit</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="p-3.5">Product &amp; Model</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">IMEI / Serial</th>
                <th className="p-3.5">Cost Price</th>
                <th className="p-3.5">Floor (12% Min)</th>
                <th className="p-3.5">Selling Price</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUnits.map((u) => {
                const marginPaise = u.pricePaise - u.costPaise;
                const marginPercent = Math.round((marginPaise / u.costPaise) * 100);

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {u.product.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        MRP: {formatINR(u.product.mrp)} &bull; Mod: {u.product.modelNumber}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <ConditionBadge grade={u.grade} size="sm" />
                    </td>

                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {maskSerialOrImei(u.serialOrImei)}
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {formatINR(u.costPaise)}
                    </td>

                    <td className="p-3.5 font-mono text-amber-600 font-medium">
                      {formatINR(u.floorPaise)}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                        {formatINR(u.pricePaise)}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          marginPercent >= 12 ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        +{marginPercent}% margin
                      </div>
                    </td>

                    <td className="p-3.5">
                      {u.batteryHealth ? (
                        <span className="font-semibold text-emerald-600">{u.batteryHealth}%</span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleQuickStatusChange(u.id, u.status)}
                        title="Click to toggle status"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                          u.status === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:ring-2 hover:ring-emerald-400"
                            : u.status === "RESERVED"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:ring-2 hover:ring-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:ring-2 hover:ring-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "AVAILABLE"
                              ? "bg-emerald-500"
                              : u.status === "RESERVED"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span>{u.status}</span>
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Price / Unit details */}
                        <button
                          onClick={() => openEditUnitModal(u)}
                          className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-semibold text-[11px] flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-800"
                          title="Edit Price & Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Fix Price</span>
                        </button>

                        {/* Delete Unit */}
                        <button
                          onClick={() => handleDeleteUnit(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No physical units found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Quick Edit Selling Price & Unit Specs */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <button
              onClick={() => setEditingUnit(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Price &amp; Unit Adjuster
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                Edit Unit: {editingUnit.product.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Serial/IMEI: {editingUnit.serialOrImei}
              </p>
            </div>

            {priceEditError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{priceEditError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUnitEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newSellingPriceInr}
                    onChange={(e) => setNewSellingPriceInr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-sm font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Min floor: ₹{editingUnit.floorPaise / 100}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCostPriceInr}
                    onChange={(e) => setNewCostPriceInr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Procurement cost
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inventory Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Condition Grade
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold focus:outline-none"
                  >
                    <option value="A_PLUS">Grade A+ (Pristine Untouched)</option>
                    <option value="A">Grade A (Mint Like-New)</option>
                    <option value="B">Grade B (Very Good)</option>
                    <option value="C">Grade C (Smart Choice)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Battery Health (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  placeholder="e.g. 96"
                  value={newBatteryHealth}
                  onChange={(e) => setNewBatteryHealth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quality Assurance / Hardware Notes
                </label>
                <textarea
                  rows={2}
                  value={newRepairNotes}
                  onChange={(e) => setNewRepairNotes(e.target.value)}
                  placeholder="Notes for customer inspection..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={priceEditSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {priceEditSaving ? "Updating..." : "Update Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Register Unique Physical Unit
                </h3>
                <p className="text-xs text-slate-500">
                  Add stock to catalog. Automatic price recommendations and 12% minimum margin floor enforced.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
              {/* Product selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Catalog Model *
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (MRP: {formatINR(p.mrp)}) - Model: {p.modelNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMEI/Serial + Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IMEI or Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 358921104829104"
                    value={serialOrImei}
                    onChange={(e) => setSerialOrImei(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cosmetic Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold focus:outline-none"
                  >
                    <option value="A_PLUS">Grade A+ (Pristine Untouched)</option>
                    <option value="A">Grade A (Mint Like-New)</option>
                    <option value="B">Grade B (Very Good)</option>
                    <option value="C">Grade C (Smart Choice)</option>
                  </select>
                </div>
              </div>

              {/* Source & Battery Health */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Origin Source *
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium focus:outline-none"
                  >
                    <option value="OPEN_BOX">Open-Box Return (Pristine)</option>
                    <option value="REFURBISHED">Certified Tested</option>
                    <option value="REPAIRED">Factory Calibrated</option>
                    <option value="PREOWNED">Quality Inspected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Battery Health (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    placeholder="Leave empty if appliance/TV"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Cost Price & Selling Price with Live Floor Calculation */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Margin &amp; Pricing Engine
                  </span>
                  {calculated.floor > 0 && (
                    <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold">
                      Min 12% Floor: ₹{calculated.floor / 100}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Procurement Cost Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 80000"
                      value={costRupees}
                      onChange={(e) => setCostRupees(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 dark:text-slate-400 font-medium">
                        Target Selling Price (₹) *
                      </label>
                      {calculated.price > 0 && (
                        <button
                          type="button"
                          onClick={handleAutoSuggest}
                          className="text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          Use Auto (₹{calculated.price / 100})
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 95000"
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono text-xs font-bold focus:outline-none ${
                        isBelowFloor
                          ? "border-red-500 bg-red-50 dark:bg-red-950 text-red-600"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      }`}
                    />
                  </div>
                </div>

                {isBelowFloor && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    Warning: Selling price ₹{priceRupees} violates the minimum 12% margin floor (₹{calculated.floor / 100}).
                  </p>
                )}
              </div>

              {/* Quality assurance notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quality Assurance &amp; Verification Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flawless condition. Battery tested at 96%. All 42-point hardware tests passed."
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isBelowFloor}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Save Unit to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
