import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Copy,
  Check,
  Video,
  FileText,
  RefreshCw,
  ExternalLink,
  X,
  UploadCloud,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Loader2,
} from 'lucide-react';
import {
  contentApi,
  MediaAsset,
  API_BASE,
  ADMIN_SESSION_EXPIRED_EVENT,
} from '../../services/contentApi';
import { authApi } from '../../services/authApi';

/** Mirrors the server allow-list (server/storage/LocalMediaStorage.ts): extension -> MIME type. */
const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};
const ALLOWED_LABEL = 'JPG, PNG, WebP, GIF, AVIF, MP4, WebM or PDF';
const ACCEPT_ATTR = Object.keys(ALLOWED_UPLOAD_TYPES).join(',');
const MAX_UPLOAD_MB = 25;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

type MediaKind = 'image' | 'video' | 'document';
type StagedStatus = 'ready' | 'uploading' | 'done' | 'error';

interface StagedFile {
  key: string;
  file: File;
  previewUrl: string | null;
  kind: MediaKind;
  altText: string;
  status: StagedStatus;
  error?: string;
}

interface Notice {
  type: 'success' | 'error';
  text: string;
}

const extensionOf = (name: string): string => {
  const clean = name.split(/[?#]/)[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot).toLowerCase() : '';
};

const kindFromMime = (mime: string): MediaKind =>
  mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'document';

const assetKind = (asset: MediaAsset): MediaKind => {
  if (asset.type === 'image' || asset.type === 'video' || asset.type === 'document') return asset.type;
  if (asset.mimeType) return kindFromMime(asset.mimeType);
  const mime = ALLOWED_UPLOAD_TYPES[extensionOf(asset.url || asset.filename || '')];
  return mime ? kindFromMime(mime) : 'image';
};

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value?: string): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/** Client-side checks; the server repeats them (and also verifies the file signature). */
const validateFile = (file: File): string | null => {
  const ext = extensionOf(file.name);
  const expected = ALLOWED_UPLOAD_TYPES[ext];
  if (!expected) return `"${file.name}" is not a supported file type. Allowed: ${ALLOWED_LABEL}.`;
  if (file.type && file.type !== expected) {
    return `"${file.name}": the extension ${ext} does not match the file type (${file.type}).`;
  }
  if (file.size === 0) return `"${file.name}" is empty.`;
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}; the maximum upload size is ${MAX_UPLOAD_MB} MB.`;
  }
  return null;
};

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

const EMPTY_URL_ASSET = { filename: '', url: '', type: 'image' as MediaKind, altText: '' };

export const AdminMediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | MediaKind>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Upload staging
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const stagedRef = useRef<StagedFile[]>([]);
  stagedRef.current = staged;

  // Add by URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState(EMPTY_URL_ASSET);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await contentApi.getAdminMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load the media library.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
    // Release preview object URLs when leaving the page.
    return () => {
      stagedRef.current.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
    };
  }, []);

  // ---------------------------------------------------------------- upload staging
  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    const errors: string[] = [];
    const accepted: StagedFile[] = [];
    files.forEach((original, idx) => {
      const problem = validateFile(original);
      if (problem) {
        errors.push(problem);
        return;
      }
      const expected = ALLOWED_UPLOAD_TYPES[extensionOf(original.name)];
      // Some browsers leave File.type empty (e.g. AVIF); the server requires a MIME type that matches.
      const file = original.type ? original : new File([original], original.name, { type: expected });
      const kind = kindFromMime(expected);
      accepted.push({
        key: `${Date.now()}-${idx}-${original.name}`,
        file,
        previewUrl: kind === 'document' ? null : URL.createObjectURL(file),
        kind,
        altText: '',
        status: 'ready',
      });
    });
    setRejected(errors);
    if (accepted.length) setStaged((prev) => [...prev, ...accepted]);
    setNotice(null);
  };

  const removeStaged = (key: string) => {
    setStaged((prev) => {
      const item = prev.find((s) => s.key === key);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((s) => s.key !== key);
    });
  };

  const clearStaged = () => {
    staged.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
    setStaged([]);
    setRejected([]);
  };

  const updateStaged = (key: string, patch: Partial<StagedFile>) =>
    setStaged((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const handleUploadAll = async () => {
    const queue = staged.filter((s) => s.status === 'ready' || s.status === 'error');
    if (queue.length === 0 || isUploading) return;
    setIsUploading(true);
    setNotice(null);
    setUploadProgress({ done: 0, total: queue.length });
    let ok = 0;
    let failed = 0;
    for (const item of queue) {
      updateStaged(item.key, { status: 'uploading', error: undefined });
      try {
        await contentApi.uploadMediaFile(item.file, item.altText.trim() || undefined);
        updateStaged(item.key, { status: 'done' });
        ok += 1;
      } catch (err: any) {
        updateStaged(item.key, { status: 'error', error: err?.message || 'Upload failed.' });
        failed += 1;
      }
      setUploadProgress({ done: ok + failed, total: queue.length });
    }
    setIsUploading(false);
    setUploadProgress(null);
    // Drop the files that made it; keep failed ones so they can be retried.
    setStaged((prev) => {
      prev.filter((s) => s.status === 'done').forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
      return prev.filter((s) => s.status !== 'done');
    });
    if (failed === 0) {
      setNotice({ type: 'success', text: `${ok} ${ok === 1 ? 'file' : 'files'} uploaded to the media library.` });
    } else {
      setNotice({
        type: 'error',
        text:
          ok > 0
            ? `${ok} uploaded, ${failed} failed. See the error on each remaining file below.`
            : `Upload failed for ${failed} ${failed === 1 ? 'file' : 'files'}. See the error on each file below.`,
      });
    }
    if (ok > 0) await loadMedia();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;
    addFiles(e.dataTransfer.files);
  };

  // ---------------------------------------------------------------- asset actions
  const handleCopyUrl = async (id: string, url: string) => {
    const ok = await copyText(url);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2500);
    } else {
      setNotice({ type: 'error', text: `Could not copy automatically. URL: ${url}` });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const message = await contentApi.deleteMediaAsset(deleteTarget.id);
      setNotice({ type: 'success', text: `${deleteTarget.filename}: ${message}` });
      setDeleteTarget(null);
      await loadMedia();
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete the media asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openUrlModal = () => {
    setNewAsset(EMPTY_URL_ASSET);
    setUrlError(null);
    setIsModalOpen(true);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const url = newAsset.url.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setUrlError('Enter a full URL starting with https:// (or a site path starting with /).');
      return;
    }
    const derivedName = url.split(/[?#]/)[0].split('/').filter(Boolean).pop() || '';
    const filename = newAsset.filename.trim() || derivedName;
    if (!filename) {
      setUrlError('Please enter a filename for this asset.');
      return;
    }
    const knownMime = ALLOWED_UPLOAD_TYPES[extensionOf(url)] || ALLOWED_UPLOAD_TYPES[extensionOf(filename)] || '';
    try {
      setIsSavingUrl(true);
      await contentApi.createMediaAsset({
        filename,
        url,
        type: newAsset.type,
        altText: newAsset.altText.trim(),
        caption: '',
        // Size is unknown for external URLs; the MIME type is only set when the extension tells us.
        sizeBytes: 0,
        mimeType: knownMime,
      });
      setIsModalOpen(false);
      setNewAsset(EMPTY_URL_ASSET);
      setNotice({ type: 'success', text: `${filename} was added to the media library.` });
      await loadMedia();
    } catch (err: any) {
      setUrlError(err?.message || 'Failed to add the media asset.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredMedia = media.filter((m) => {
    if (kindFilter !== 'all' && assetKind(m) !== kindFilter) return false;
    if (!query) return true;
    return (
      (m.filename || '').toLowerCase().includes(query) ||
      (m.altText || '').toLowerCase().includes(query) ||
      (m.url || '').toLowerCase().includes(query)
    );
  });
  const pendingCount = staged.filter((s) => s.status === 'ready' || s.status === 'error').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              ASSET STORAGE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Media Asset Library
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Centralized media repository for villa imagery, video reels, and sanctuary photography.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
          <button
            type="button"
            onClick={openUrlModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-adm-surface border border-adm-line hover:border-adm-accent/50 text-adm-text-2 hover:text-adm-text text-xs font-mono uppercase tracking-widest transition-all cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
            <span>Add by URL</span>
          </button>
        </div>
      </div>

      {/* Hidden native file picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          // Reset so picking the same file again still triggers onChange.
          e.target.value = '';
        }}
      />

      {/* Notices */}
      {notice && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-mono flex items-start justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-red-950/40 border-red-800/60 text-red-200'
          }`}
        >
          <div className="flex items-start space-x-2 min-w-0">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            )}
            <span className="break-words">{notice.text}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & drop upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isUploading) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-adm-accent bg-adm-accent/10'
            : 'border-adm-line-strong bg-adm-panel hover:border-adm-accent/60'
        }`}
      >
        <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-adm-accent' : 'text-adm-muted'}`} />
        <p className="text-sm text-adm-text">
          {isDragging ? 'Drop files to add them' : 'Drag & drop files here, or click to choose'}
        </p>
        <p className="text-[11px] font-mono text-adm-muted mt-1">
          {ALLOWED_LABEL} &middot; up to {MAX_UPLOAD_MB} MB each &middot; multiple files allowed
        </p>
      </div>

      {/* Rejected files (client-side validation) */}
      {rejected.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {rejected.length} {rejected.length === 1 ? 'file was' : 'files were'} not added
            </span>
            <button type="button" onClick={() => setRejected([])} className="opacity-70 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {rejected.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Staged uploads */}
      {staged.length > 0 && (
        <div className="rounded-xl border border-adm-line bg-adm-panel p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-adm-text">Ready to upload</h3>
              <p className="text-[11px] text-adm-muted">
                Add alt text for images so screen readers and search engines can describe them.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearStaged}
                disabled={isUploading}
                className="px-3 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 hover:text-adm-text cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading || pendingCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>
                  {isUploading && uploadProgress
                    ? `Uploading ${Math.min(uploadProgress.done + 1, uploadProgress.total)} of ${uploadProgress.total}...`
                    : `Upload ${pendingCount} ${pendingCount === 1 ? 'file' : 'files'}`}
                </span>
              </button>
            </div>
          </div>

          {uploadProgress && (
            <div className="h-1.5 rounded-full bg-adm-raised overflow-hidden">
              <div
                className="h-full bg-adm-accent-fill transition-all duration-300"
                style={{ width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%` }}
              />
            </div>
          )}

          <div className="divide-y divide-adm-line">
            {staged.map((item) => (
              <div key={item.key} className="py-2.5 flex items-center gap-3">
                <div className="w-16 h-12 rounded-md overflow-hidden bg-adm-bg border border-adm-line shrink-0 flex items-center justify-center">
                  {item.kind === 'image' && item.previewUrl ? (
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                  ) : item.kind === 'video' && item.previewUrl ? (
                    <video src={item.previewUrl} muted preload="metadata" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-adm-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-adm-text truncate" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <span className="text-[10px] font-mono text-adm-muted shrink-0">{formatBytes(item.file.size)}</span>
                  </div>
                  <input
                    type="text"
                    value={item.altText}
                    disabled={item.status === 'uploading' || isUploading}
                    onChange={(e) => updateStaged(item.key, { altText: e.target.value })}
                    placeholder={item.kind === 'image' ? 'Alt text (describe the image)' : 'Alt text / description (optional)'}
                    className="w-full px-2.5 py-1.5 bg-adm-bg border border-adm-line rounded-md text-[11px] text-adm-text focus:border-adm-accent outline-none disabled:opacity-60"
                  />
                  {item.status === 'error' && item.error && (
                    <p className="text-[11px] text-red-300 flex items-start gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>{item.error}</span>
                    </p>
                  )}
                </div>
                <div className="shrink-0 w-20 text-right">
                  {item.status === 'uploading' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-adm-accent">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                    </span>
                  ) : item.status === 'done' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeStaged(item.key)}
                      disabled={isUploading}
                      className="p-1.5 rounded-md text-adm-muted hover:text-red-300 hover:bg-red-950/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from upload list"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-adm-muted" />
          <input
            type="text"
            placeholder="Search by filename, alt text or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'image', 'video', 'document'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono capitalize border transition-colors cursor-pointer ${
                kindFilter === k
                  ? 'bg-adm-accent/20 border-adm-accent/60 text-adm-text'
                  : 'bg-adm-bg border-adm-line text-adm-muted hover:text-adm-text'
              }`}
            >
              {k === 'all' ? 'All' : k === 'document' ? 'PDF' : `${k}s`}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <span className="text-[11px] font-mono text-adm-muted">
            {filteredMedia.length} of {media.length} assets
          </span>
          <button
            type="button"
            onClick={loadMedia}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-adm-raised text-adm-muted hover:text-adm-text cursor-pointer disabled:opacity-50"
            title="Reload media library"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading && media.length === 0 ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-adm-accent" />
          <p className="font-mono text-xs uppercase tracking-widest text-adm-text-2">Loading Assets...</p>
        </div>
      ) : loadError ? (
        <div className="py-12 text-center bg-adm-panel rounded-xl border border-red-800/50">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-adm-text">Could not load the media library</p>
          <p className="text-xs font-mono text-red-300 mt-1">{loadError}</p>
          <button
            type="button"
            onClick={loadMedia}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 hover:text-adm-text cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center bg-adm-panel rounded-xl border border-adm-line">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 text-adm-muted" />
          <p className="text-sm font-serif text-adm-text">
            {media.length === 0 ? 'No media assets yet' : 'No media assets match your search'}
          </p>
          {media.length === 0 && (
            <p className="text-xs text-adm-muted mt-1">Upload files above or add an existing asset by URL.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((asset) => {
            const kind = assetKind(asset);
            const usage = typeof asset.usageCount === 'number' ? asset.usageCount : asset.referenceCount;
            const size = formatBytes(asset.sizeBytes);
            const date = formatDate(asset.uploadedAt);
            return (
              <div
                key={asset.id}
                className="bg-adm-panel rounded-xl border border-adm-line overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative aspect-video bg-black/60 overflow-hidden">
                  {kind === 'video' ? (
                    <video
                      src={asset.url}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover bg-black"
                    />
                  ) : kind === 'document' ? (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex flex-col items-center justify-center bg-adm-surface text-adm-accent"
                    >
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px] font-mono mt-1 text-adm-muted">Open document</span>
                    </a>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.filename}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 right-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono uppercase text-adm-accent inline-flex items-center gap-1">
                      {kind === 'video' && <Video className="w-2.5 h-2.5" />}
                      {kind === 'document' ? 'pdf' : kind}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <p className="font-mono text-xs text-adm-text truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <p
                    className={`text-[10px] truncate ${asset.altText ? 'text-adm-muted' : 'text-adm-faint italic'}`}
                    title={asset.altText || undefined}
                  >
                    {asset.altText ? `Alt: ${asset.altText}` : 'No alt text'}
                  </p>
                  {(size || date || typeof usage === 'number') && (
                    <p className="text-[9px] font-mono text-adm-faint truncate">
                      {[size, date, typeof usage === 'number' ? `used ${usage}x` : ''].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.id, asset.url)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-adm-raised hover:bg-adm-line text-[10px] font-mono text-adm-text-2 cursor-pointer"
                      title={asset.url}
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-adm-raised hover:bg-adm-line text-adm-text-2 hover:text-adm-text"
                        title="Open in a new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(asset);
                        }}
                        className="p-1 rounded bg-adm-raised hover:bg-red-950/50 text-adm-text-2 hover:text-red-300 cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-adm-panel border border-adm-line rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-adm-line flex items-center justify-between bg-adm-surface">
              <h2 className="font-serif text-lg text-adm-text">Delete media asset?</h2>
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteTarget(null)}
                className="p-1 text-adm-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-adm-text-2">
              <p>
                <span className="font-mono text-adm-text break-all">{deleteTarget.filename}</span> will be removed from
                the media library.
                {deleteTarget.url?.startsWith('/uploads/')
                  ? ' The uploaded file is deleted from storage as well. This cannot be undone.'
                  : ' The file itself is hosted elsewhere and is not touched.'}
              </p>
              <p className="text-adm-muted">
                Any page, villa or gallery item that still uses this URL will show a broken image or video.
              </p>
              {typeof deleteTarget.usageCount === 'number' && deleteTarget.usageCount > 0 && (
                <p className="text-amber-300">This asset is recorded as used {deleteTarget.usageCount} time(s).</p>
              )}
              {deleteError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{deleteError}</span>
                </div>
              )}
              <div className="pt-3 border-t border-adm-line flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-mono uppercase font-bold cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: add by URL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-adm-panel border border-adm-line rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-adm-line flex items-center justify-between bg-adm-surface">
              <h2 className="font-serif text-lg text-adm-text">Add Media by URL</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-adm-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="p-5 space-y-3">
              <p className="text-[11px] text-adm-muted">
                Registers an asset that is already hosted somewhere. To store a file on this server, use Upload Files instead.
              </p>
              {urlError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{urlError}</span>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={newAsset.filename}
                  onChange={(e) => setNewAsset({ ...newAsset, filename: e.target.value })}
                  placeholder="Optional — taken from the URL when left empty"
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Direct Asset URL *
                </label>
                <input
                  type="text"
                  required
                  value={newAsset.url}
                  onChange={(e) => {
                    const url = e.target.value;
                    const mime = ALLOWED_UPLOAD_TYPES[extensionOf(url)];
                    // Pre-select the type from the extension when it is recognisable.
                    setNewAsset({ ...newAsset, url, type: mime ? kindFromMime(mime) : newAsset.type });
                  }}
                  placeholder="https://... or /uploads/photo.jpg"
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              {newAsset.type === 'image' && /^(https?:\/\/|\/)/i.test(newAsset.url.trim()) && (
                <div className="rounded-lg overflow-hidden border border-adm-line bg-adm-bg aspect-video">
                  <img src={newAsset.url.trim()} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Asset Type
                </label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as MediaKind })}
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document (PDF)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={newAsset.altText}
                  onChange={(e) => setNewAsset({ ...newAsset, altText: e.target.value })}
                  placeholder="Descriptive text for SEO & screen-readers..."
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <div className="pt-3 border-t border-adm-line flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSavingUrl}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSavingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSavingUrl ? 'Saving...' : 'Save Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
