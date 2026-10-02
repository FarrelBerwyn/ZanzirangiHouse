import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Loader2,
  Crop,
  Sparkles,
} from 'lucide-react';
import { contentApi } from '../../services/contentApi';

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile?: File | null;
  initialImageUrl?: string;
  onCroppedAndUploaded: (url: string) => void;
  title?: string;
  supportName?: string;
  supportTitle?: string;
  supportStatus?: string;
}

const CROP_BOX_SIZE = 280; // Size in px of the square cropping viewport

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  initialImageUrl,
  onCroppedAndUploaded,
  title = 'Adjust & Crop Photo',
  supportName = 'Juma',
  supportTitle = 'Customer Support',
  supportStatus = 'Active 24/7',
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Zoom: 1.0 (cover crop box completely) to 3.0
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  // Load image from File or URL
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsImageLoaded(false);
    setLivePreviewUrl(null);

    let objectUrl: string | null = null;
    if (imageFile) {
      objectUrl = URL.createObjectURL(imageFile);
      setImageSrc(objectUrl);
    } else if (initialImageUrl) {
      setImageSrc(initialImageUrl);
    } else {
      setImageSrc(null);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, imageFile, initialImageUrl]);

  // Compute base scale to cover CROP_BOX_SIZE completely
  const getBaseScale = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0) return 1;
    return Math.max(CROP_BOX_SIZE / w, CROP_BOX_SIZE / h);
  }, []);

  // Clamp offset to ensure image edges never enter inside the crop box
  const clampOffset = useCallback(
    (x: number, y: number, currentZoom: number) => {
      if (naturalSize.width <= 0 || naturalSize.height <= 0) return { x: 0, y: 0 };
      const baseScale = getBaseScale(naturalSize.width, naturalSize.height);
      const scale = baseScale * currentZoom;

      const renderedW = naturalSize.width * scale;
      const renderedH = naturalSize.height * scale;

      const maxPanX = Math.max(0, (renderedW - CROP_BOX_SIZE) / 2);
      const maxPanY = Math.max(0, (renderedH - CROP_BOX_SIZE) / 2);

      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, x)),
        y: Math.min(maxPanY, Math.max(-maxPanY, y)),
      };
    },
    [naturalSize, getBaseScale]
  );

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setIsImageLoaded(true);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Re-clamp offset if zoom changes
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(3.0, Math.max(1.0, newZoom));
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, clampedZoom));
  };

  // Pointer Drag Handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!isImageLoaded) return;
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const rawX = clientX - dragStart.x;
    const rawY = clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, zoom));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    handleZoomChange(zoom + delta);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Render high-res cropped canvas (512x512)
  const renderCroppedCanvas = useCallback(
    (outputSize = 512): HTMLCanvasElement | null => {
      if (!imageRef.current || !isImageLoaded || naturalSize.width <= 0 || naturalSize.height <= 0) {
        return null;
      }

      const img = imageRef.current;
      const baseScale = getBaseScale(naturalSize.width, naturalSize.height);
      const scale = baseScale * zoom;

      // The crop box in natural image coordinates
      const cropNaturalSize = CROP_BOX_SIZE / scale;

      // Center of the crop in natural image coordinates
      const centerNaturalX = naturalSize.width / 2 - offset.x / scale;
      const centerNaturalY = naturalSize.height / 2 - offset.y / scale;

      let srcX = centerNaturalX - cropNaturalSize / 2;
      let srcY = centerNaturalY - cropNaturalSize / 2;

      // Strict boundary check on source coordinates
      srcX = Math.max(0, Math.min(naturalSize.width - cropNaturalSize, srcX));
      srcY = Math.max(0, Math.min(naturalSize.height - cropNaturalSize, srcY));

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        srcX,
        srcY,
        cropNaturalSize,
        cropNaturalSize,
        0,
        0,
        outputSize,
        outputSize
      );

      return canvas;
    },
    [isImageLoaded, naturalSize, zoom, offset, getBaseScale]
  );

  // Update live preview URL
  useEffect(() => {
    if (!isOpen || !isImageLoaded) return;
    const canvas = renderCroppedCanvas(160);
    if (canvas) {
      setLivePreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
    }
  }, [isOpen, isImageLoaded, zoom, offset, renderCroppedCanvas]);

  const handleCropAndSave = async () => {
    try {
      setIsUploading(true);
      setErrorMessage(null);

      const canvas = renderCroppedCanvas(600);
      if (!canvas) {
        throw new Error('Unable to render cropped avatar image.');
      }

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.94);
      });

      if (!blob) {
        throw new Error('Failed to create avatar image blob.');
      }

      const filename = `avatar-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      // Upload via media repository
      const asset = await contentApi.uploadMediaFile(file, `${supportName} - Customer Support Avatar`);
      if (!asset?.url) {
        throw new Error('Upload succeeded but server did not return image URL.');
      }

      onCroppedAndUploaded(asset.url);
      onClose();
    } catch (err: any) {
      console.error('Error saving cropped avatar:', err);
      setErrorMessage(err.message || 'Failed to crop and upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const baseScale = getBaseScale(naturalSize.width, naturalSize.height);
  const currentScale = baseScale * zoom;
  const renderedW = naturalSize.width * currentScale;
  const renderedH = naturalSize.height * currentScale;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141413] border border-[#C4A27A]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#FAF8F5]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2C2B28] flex items-center justify-between bg-gradient-to-r from-[#1C1B1A] via-[#22211F] to-[#1C1B1A]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C4A27A]/15 border border-[#C4A27A]/40 flex items-center justify-center text-[#C4A27A]">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#FAF8F5] tracking-wide">{title}</h2>
              <p className="text-[11px] text-[#A6A29A]">
                Drag photo to position. Zoom adjusts seamlessly within photo edges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#2C2B28] text-[#A6A29A] hover:text-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-700/60 rounded-xl text-xs text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Interactive 1:1 Crop Viewport */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div
                style={{ width: `${CROP_BOX_SIZE}px`, height: `${CROP_BOX_SIZE}px` }}
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={(e) => {
                  if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={handlePointerUp}
                onWheel={handleWheel}
                className="relative rounded-2xl overflow-hidden bg-[#0A0A09] border-2 border-[#C4A27A]/60 shadow-2xl cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
              >
                {imageSrc ? (
                  <>
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Crop target"
                      onLoad={handleImageLoad}
                      style={{
                        width: `${renderedW}px`,
                        height: `${renderedH}px`,
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                      }}
                      className="max-w-none pointer-events-none select-none object-cover"
                    />

                    {/* Circular Mask Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-[#C4A27A] rounded-full shadow-[0_0_0_9999px_rgba(10,10,9,0.7)]" />

                    {/* Subtle grid lines inside circle */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                      <div className="border-r border-b border-[#FAF8F5]" />
                      <div className="border-r border-b border-[#FAF8F5]" />
                      <div className="border-b border-[#FAF8F5]" />
                      <div className="border-r border-b border-[#FAF8F5]" />
                      <div className="border-r border-b border-[#FAF8F5]" />
                      <div className="border-b border-[#FAF8F5]" />
                      <div className="border-r border-b border-[#FAF8F5]" />
                      <div className="border-r border-b border-[#FAF8F5]" />
                      <div />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C4A27A] mb-2" />
                    <span className="text-xs text-[#A6A29A]">Loading image...</span>
                  </div>
                )}
              </div>

              {/* Zoom & Reset Toolbar */}
              <div className="w-full max-w-[280px] mt-4 space-y-2">
                <div className="flex items-center space-x-3 text-xs text-[#A6A29A]">
                  <ZoomOut className="w-4 h-4 text-[#8C8880]" />
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-[#C4A27A] cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-[#8C8880]" />
                  <button
                    onClick={handleReset}
                    title="Reset position and zoom"
                    className="p-1 rounded-lg hover:bg-[#2C2B28] text-[#C4A27A] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#8C8880]">
                  <span>Zoom: {Math.round(zoom * 100)}%</span>
                  <span>Photo Borders Clamped</span>
                </div>
              </div>
            </div>

            {/* Right: Realistic Crisp Live Previews */}
            <div className="md:col-span-5 flex flex-col space-y-4 bg-[#1C1B1A] p-4 sm:p-5 rounded-2xl border border-[#2C2B28]">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#2C2B28]">
                <Sparkles className="w-4 h-4 text-[#C4A27A]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#FAF8F5] font-semibold">
                  Live Web Preview
                </span>
              </div>

              {/* Preview 1: Floating Chat Button on Website */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#8C8880] uppercase tracking-wider block">
                  1. Floating Bottom Widget:
                </span>
                <div className="flex items-center space-x-2.5 p-2.5 bg-[#141413] rounded-2xl border border-[#C4A27A]/30">
                  {/* Glowing Circle Avatar with Golden Ring */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#B8966C] via-[#C4A27A] to-[#FAF8F5] shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#141413]">
                        {livePreviewUrl ? (
                          <img
                            src={livePreviewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#2C2B28] animate-pulse" />
                        )}
                      </div>
                    </div>
                    {/* Active online pulsing radar signal */}
                    <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#141413]" />
                    </span>
                  </div>

                  {/* Badge Pill */}
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
                      {supportTitle}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center space-x-1 mt-0.5 font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span>Online • {supportName}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview 2: Inside Chat Window Header */}
              <div className="space-y-2 pt-2 border-t border-[#2C2B28]">
                <span className="text-[10px] font-mono text-[#8C8880] uppercase tracking-wider block">
                  2. Chat Window Header:
                </span>
                <div className="flex items-center space-x-2.5 p-2 bg-[#141413] rounded-xl border border-[#2C2B28]">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C4A27A] flex-shrink-0">
                    {livePreviewUrl ? (
                      <img
                        src={livePreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2C2B28] animate-pulse" />
                    )}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-serif text-[#FAF8F5]">{supportTitle}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{supportStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#181716] border-t border-[#2C2B28] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#A6A29A] hover:text-[#FAF8F5] hover:bg-[#2C2B28] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCropAndSave}
            disabled={isUploading || !isImageLoaded}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B8966C] via-[#C4A27A] to-[#B8966C] hover:opacity-95 text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Avatar...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Avatar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
