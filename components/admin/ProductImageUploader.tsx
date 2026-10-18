"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Plus,
  Loader2,
  Check,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProductImageUploader({ images, onChange }: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setUploadError(`File "${file.name}" is not an image.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Upload failed");
        }

        uploadedUrls.push(data.url);
      } catch (err: any) {
        console.error("Upload error for file", file.name, err);
        setUploadError(err.message || `Failed to upload "${file.name}"`);
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }
    setIsUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("data:image/")) {
      setUploadError("Please enter a valid URL starting with https://");
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput("");
    setUploadError(null);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Product Images ({images.length})
        </label>
        <span className="text-[11px] text-slate-400">
          First image will be the primary cover photo
        </span>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Drag & Drop Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center ${
          dragActive
            ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30"
            : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-850/40 bg-slate-50/60 dark:bg-slate-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isUploading ? "Uploading to Cloud Storage..." : "Click or drag images here to upload"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              JPG, PNG, WEBP, or GIF up to 10MB each (Multi-upload supported)
            </div>
          </div>
        </div>
      </div>

      {/* Alternative URL adder */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="url"
            placeholder="Or paste external image URL (e.g. Unsplash or CDN)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl(e);
              }
            }}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add URL</span>
        </button>
      </div>

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((url, idx) => {
            const isCover = idx === 0;
            return (
              <div
                key={`${url}-${idx}`}
                className={`group relative rounded-2xl overflow-hidden border bg-slate-100 dark:bg-slate-950 transition-all ${
                  isCover
                    ? "border-emerald-500 ring-2 ring-emerald-500/30"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Image element */}
                <div className="aspect-square relative overflow-hidden bg-slate-200 dark:bg-slate-900">
                  <img
                    src={url}
                    alt={`Product preview ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400?text=Invalid+Image";
                    }}
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      <span>COVER</span>
                    </div>
                  )}

                  {/* Action Bar Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      {/* View Large */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(url);
                        }}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-white text-xs transition-colors"
                        title="View Full Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(idx);
                        }}
                        className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(idx, "left");
                          }}
                          className="p-1 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white text-xs"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(idx, "right");
                          }}
                          className="p-1 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white text-xs"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Make Cover Button */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeCover(idx);
                          }}
                          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>Set Cover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-1.5 text-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 truncate font-mono">
                    {url.startsWith("http") ? new URL(url).pathname.split("/").pop() : `Image #${idx + 1}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Large Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Expanded preview"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl mx-auto"
            />
            <div className="p-3 text-center flex items-center justify-between">
              <span className="text-xs text-slate-500 truncate max-w-sm font-mono">
                {previewImage}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
