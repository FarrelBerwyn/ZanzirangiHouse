import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  FileImage,
  RefreshCw,
} from 'lucide-react';
import { contentApi } from '../../services/contentApi';

export interface AdminImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
  placeholder?: string;
  className?: string;
  presets?: { label: string; url: string }[];
  previewHeight?: string;
}

const SUPPORTED_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

const MAX_IMAGE_MB = 25;

export const AdminImageInput: React.FC<AdminImageInputProps> = ({
  value,
  onChange,
  label = 'Foto / Gambar',
  hint = 'Masukkan URL gambar atau unggah langsung file foto dari komputer.',
  altText,
  onAltTextChange,
  placeholder = 'https://... atau /uploads/...',
  className = '',
  presets,
  previewHeight = 'h-44',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    // Validate extension
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
    const expected = SUPPORTED_MIME_TYPES[ext];

    if (!expected && !file.type.startsWith('image/')) {
      setUploadError(`Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau AVIF.`);
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setUploadError(`Ukuran file "${file.name}" melebihi batas maksimum ${MAX_IMAGE_MB} MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const mimeType = file.type || expected || 'image/jpeg';
      const uploadPayload = file.type ? file : new File([file], file.name, { type: mimeType });

      const asset = await contentApi.uploadMediaFile(uploadPayload, altText || file.name);
      if (!asset?.url) {
        throw new Error('Server tidak mengembalikan URL foto.');
      }

      onChange(asset.url);
      setImageBroken(false);
      setUploadSuccess(`✓ Foto "${file.name}" berhasil diunggah!`);

      setTimeout(() => {
        setUploadSuccess(null);
      }, 4000);
    } catch (err: any) {
      console.error('Upload image error:', err);
      setUploadError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label & Action Header */}
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 font-medium">
              {label}
            </label>
          )}
          {hint && <p className="text-[11px] text-adm-muted mt-0.5">{hint}</p>}
        </div>

        {value && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-adm-surface border border-adm-line text-adm-accent">
            {value.startsWith('/uploads/') ? '📁 Upload Lokal' : value.startsWith('http') ? '🌐 External URL' : '🖼️ Asset'}
          </span>
        )}
      </div>

      {/* Main Controls: URL Input + Upload Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setImageBroken(false);
              setUploadError(null);
            }}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none pr-8"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setImageBroken(false);
              }}
              title="Kosongkan URL"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-adm-muted hover:text-adm-text cursor-pointer p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {/* Direct Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload dari PC</span>
            </>
          )}
        </button>
      </div>

      {/* Optional Alt Text Field */}
      {onAltTextChange && (
        <div className="flex items-center space-x-2">
          <label className="text-[10px] font-mono uppercase text-adm-muted whitespace-nowrap">
            Alt Text (SEO):
          </label>
          <input
            type="text"
            value={altText || ''}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Deskripsi singkat foto untuk SEO & screen reader"
            className="w-full px-2.5 py-1 bg-adm-bg border border-adm-line rounded text-xs text-adm-text focus:border-adm-accent outline-none"
          />
        </div>
      )}

      {/* Notification Banner */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 font-mono">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Presets if provided */}
      {presets && presets.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-adm-muted uppercase">Pilihan Cepat / Preset Foto:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(p.url);
                  setImageBroken(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                  value === p.url
                    ? 'bg-adm-accent/20 border-adm-accent text-adm-accent font-bold'
                    : 'bg-adm-surface border-adm-line text-adm-text-2 hover:border-adm-accent/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dropzone & Live Image Preview Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl overflow-hidden border transition-all ${previewHeight} ${
          isDragging
            ? 'border-adm-accent bg-adm-accent/10 border-dashed'
            : 'border-adm-line bg-adm-bg'
        }`}
      >
        {value && !imageBroken ? (
          <>
            <img
              src={value}
              alt={altText || 'Preview'}
              className="w-full h-full object-cover"
              onError={() => setImageBroken(true)}
            />

            {/* Overlay Bar */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3 opacity-90 hover:opacity-100 transition-opacity">
              <div className="min-w-0 pr-2">
                <p className="text-[11px] font-mono text-[#FAF8F5] truncate font-medium">
                  {value}
                </p>
                <p className="text-[10px] text-adm-muted truncate">
                  {isDragging ? 'Lepaskan file untuk mengganti foto ini' : 'Foto siap disimpan ke database'}
                </p>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  title="Lihat ukuran penuh"
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-[#FAF8F5] border border-white/20 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti Foto"
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-[#FAF8F5] border border-white/20 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-adm-surface/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-adm-surface border border-adm-line flex items-center justify-center text-adm-muted mb-2">
              {imageBroken ? <AlertCircle className="w-5 h-5 text-amber-400" /> : <FileImage className="w-5 h-5 text-adm-accent" />}
            </div>
            <p className="text-xs font-mono text-adm-text font-medium">
              {imageBroken ? 'Link gambar tidak dapat dimuat' : 'Belum ada foto atau tarik file ke sini'}
            </p>
            <p className="text-[10px] text-adm-muted mt-0.5">
              {imageBroken
                ? 'Periksa URL atau klik untuk upload file gambar baru dari komputer.'
                : 'Klik untuk memilih file gambar dari komputer (JPG, PNG, WebP, max 25MB).'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
