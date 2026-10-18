"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  Layers,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { ProductImageUploader } from "./ProductImageUploader";
import { BulkProductImporter } from "./BulkProductImporter";


interface Product {
  id: string;
  title: string;
  slug: string;
  brand: string;
  modelNumber: string;
  category: string;
  description: string;
  images: string;
  mrp: number;
  warrantyMonths: number;
  returnDays: number;
  units: {
    id: string;
    status: string;
    pricePaise: number;
    grade: string;
  }[];
}

interface ProductManagerClientProps {
  initialProducts: Product[];
}

export function ProductManagerClient({ initialProducts }: ProductManagerClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [modelNumber, setModelNumber] = useState("");
  const [category, setCategory] = useState("smartphones");
  const [mrpInr, setMrpInr] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("6");
  const [returnDays, setReturnDays] = useState("7");
  const [description, setDescription] = useState("");
  const [imagesList, setImagesList] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setBrand("Apple");
    setModelNumber("");
    setCategory("smartphones");
    setMrpInr("");
    setWarrantyMonths("6");
    setReturnDays("7");
    setDescription("");
    setImagesList([
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80"
    ]);
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setBrand(p.brand);
    setModelNumber(p.modelNumber);
    setCategory(p.category);
    setMrpInr((p.mrp / 100).toString());
    setWarrantyMonths(p.warrantyMonths.toString());
    setReturnDays(p.returnDays.toString());
    setDescription(p.description);

    let parsed: string[] = [];
    try {
      parsed = JSON.parse(p.images);
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      parsed = p.images ? [p.images] : [];
    }
    setImagesList(parsed);
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const isEdit = !!editingProduct;
      const url = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...(isEdit && { id: editingProduct.id }),
        title,
        brand,
        modelNumber,
        category,
        mrpInr,
        warrantyMonths,
        returnDays,
        description,
        images: imagesList,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      // Refresh list
      const listRes = await fetch("/api/admin/products");
      const listData = await listRes.json();
      if (listData.products) {
        setProducts(listData.products);
      }

      setSuccess(isEdit ? "Product successfully updated!" : "Product catalog created!");
      setTimeout(() => setModalOpen(false), 900);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${p.title}" and its inventory units?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/products?id=${p.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Cannot delete product");
        return;
      }
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.modelNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalUnits = products.reduce((acc, p) => acc + p.units.length, 0);
  const availableUnits = products.reduce(
    (acc, p) => acc + p.units.filter((u) => u.status === "AVAILABLE").length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Catalog Management
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            Product Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update, or remove models. Assign prices, images, and warranty terms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Bulk Import (CSV)</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Single Product</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Catalog Models</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {products.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Available In Stock</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {availableUnits} Units
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Registered Units</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {totalUnits} Units
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, brand, or model number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="televisions">Televisions</option>
            <option value="appliances">Appliances</option>
          </select>
        </div>
      </div>

      {/* Product List Table / Grid */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">MRP (Retail)</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Store Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                let imgList: string[] = [];
                try {
                  imgList = JSON.parse(p.images);
                } catch {
                  imgList = [];
                }
                const firstImg = imgList[0] || "/placeholder.png";
                const inStockCount = p.units.filter((u) => u.status === "AVAILABLE").length;
                const minPrice =
                  p.units.length > 0
                    ? Math.min(...p.units.map((u) => u.pricePaise))
                    : null;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={firstImg}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-emerald-600">{p.brand}</span>
                            <span>&bull;</span>
                            <span className="font-mono">Model: {p.modelNumber}</span>
                            <span>&bull;</span>
                            <span>{p.warrantyMonths}m Warranty</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold capitalize text-slate-700 dark:text-slate-300">
                      {p.category}
                    </td>

                    <td className="py-4 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {formatINR(p.mrp)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inStockCount > 0
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-100 dark:bg-red-950 text-red-600"
                          }`}
                        >
                          {inStockCount > 0 ? `${inStockCount} In Stock` : "Out of Stock"}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {p.units.length} total units logged
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {minPrice ? (
                        <div>
                          <div className="font-bold text-emerald-600">
                            From {formatINR(minPrice)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Save {Math.round(((p.mrp - minPrice) / p.mrp) * 100)}% off MRP
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No active price</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Add inventory directly */}
                        <Link
                          href={`/admin/inventory?productId=${p.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800"
                          title="Add Units to this Product"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Unit</span>
                        </Link>

                        {/* View on website */}
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Live Listing"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit Product */}
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Product */}
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative max-w-xl w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {editingProduct ? "Edit Product Details" : "Create New Product Catalog"}
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 Pro Max 256GB (Pristine Untouched)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Samsung"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Model Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A3106"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold focus:outline-none"
                  >
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="televisions">Televisions</option>
                    <option value="appliances">Appliances</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 159900"
                    value={mrpInr}
                    onChange={(e) => setMrpInr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Return Window (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={returnDays}
                    onChange={(e) => setReturnDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <ProductImageUploader
                images={imagesList}
                onChange={setImagesList}
              />


              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Description &amp; Technical Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Natural Titanium finish, 48MP camera, A17 Pro chip, Ceramic Shield front..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bulk Product Importer Modal */}
      {bulkModalOpen && (
        <BulkProductImporter
          onSuccess={(newProducts) => {
            setProducts((prev) => [...newProducts, ...prev]);
            setBulkModalOpen(false);
          }}
          onClose={() => setBulkModalOpen(false)}
        />
      )}
    </div>
  );
}
