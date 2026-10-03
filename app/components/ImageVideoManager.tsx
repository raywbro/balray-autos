"use client";

import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { watermarkImage } from "@/app/utils/watermark";

type ExistingImage = {
  url: string;
  id: string;
  isNew: boolean;
  file?: File;
  preview?: string;
};

type Props = {
  userId: string;
  initialImages: string[];
  initialVideo?: string | null;
  onImagesChange: (images: string[]) => void;
  onVideoChange: (videoUrl: string | null) => void;
  maxImages?: number;
  uploadRef?: React.MutableRefObject<
    (() => Promise<{ images: string[]; video: string | null }>) | null
  >;
};

export default function ImageVideoManager({
  userId,
  initialImages,
  initialVideo,
  onImagesChange,
  onVideoChange,
  maxImages = 10,
  uploadRef,
}: Props) {
  const [images, setImages] = useState<ExistingImage[]>(
    initialImages.map((url, i) => ({
      url,
      id: `existing-${i}-${url.slice(-10)}`,
      isNew: false,
    }))
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideo || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    const toAdd = files.slice(0, remaining);

    if (toAdd.length < files.length) {
      setError(
        `Maximum ${maxImages} photos. ${files.length - toAdd.length} skipped.`
      );
    } else {
      setError("");
    }

    const newImages: ExistingImage[] = toAdd.map((file) => ({
      url: "",
      preview: URL.createObjectURL(file),
      file,
      isNew: true,
      id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (id: string) => {
    const removed = images.find((i) => i.id === id);
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setImages((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const makeMain = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      return updated;
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Video is too large. Maximum 50MB.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    setVideoFile(file);
    setError("");
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl(null);
    onVideoChange(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const uploadAll = async (): Promise<{
    images: string[];
    video: string | null;
  }> => {
    setUploading(true);
    setProgress("Preparing uploads...");
    const finalImages: string[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (img.isNew && img.file) {
          setProgress(`Processing image ${i + 1} of ${images.length}...`);

          // 1. Compress
          const compressed = await imageCompression(img.file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: 0.85,
          });

          // 2. Watermark
          setProgress(`Watermarking image ${i + 1} of ${images.length}...`);
          const watermarked = await watermarkImage(compressed);

          // 3. Upload
          setProgress(`Uploading image ${i + 1} of ${images.length}...`);
          const fileName = `${userId}-${Date.now()}-${i}-${Math.random()
            .toString(36)
            .substring(7)}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("car-images")
            .upload(fileName, watermarked, {
              contentType: "image/jpeg",
              cacheControl: "3600",
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("car-images").getPublicUrl(fileName);

          finalImages.push(publicUrl);
        } else {
          finalImages.push(img.url);
        }
      }

      let finalVideoUrl = videoUrl;

      if (videoFile) {
        setProgress("Uploading video...");
        const fileExt = videoFile.name.split(".").pop() || "mp4";
        const videoName = `${userId}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: videoUploadError } = await supabase.storage
          .from("car-videos")
          .upload(videoName, videoFile, {
            contentType: videoFile.type,
            cacheControl: "3600",
          });

        if (videoUploadError) throw videoUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("car-videos").getPublicUrl(videoName);

        finalVideoUrl = publicUrl;
      }

      onImagesChange(finalImages);
      onVideoChange(finalVideoUrl);

      setUploading(false);
      setProgress("");

      return { images: finalImages, video: finalVideoUrl };
    } catch (err: any) {
      setUploading(false);
      setProgress("");
      throw new Error(err.message || "Upload failed");
    }
  };

  useEffect(() => {
    if (uploadRef) {
      uploadRef.current = uploadAll;
    }
  });

  return (
    <div className="space-y-6">
      {/* PHOTOS */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-[#34414A]">
              Photos ({images.length} of {maxImages})
            </label>
            <p className="mt-0.5 text-xs text-[#89939A]">
              Every photo is automatically watermarked with the Balray Autos brand.
            </p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`relative overflow-hidden rounded-xl border-2 ${
                  index === 0 ? "border-[#B08D3C]" : "border-[#D5DBDF]"
                }`}
              >
                <img
                  src={img.preview || img.url}
                  alt={`Image ${index + 1}`}
                  className="aspect-[16/10] h-full w-full object-cover"
                />

                {index === 0 && (
                  <div className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-2 py-1 text-[10px] font-bold text-white shadow-md">
                    MAIN
                  </div>
                )}

                {img.isNew && (
                  <div className="absolute left-2 bottom-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white shadow-md">
                    NEW
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                  aria-label="Remove"
                >
                  ×
                </button>

                <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, "left")}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-[#34414A] shadow-md transition hover:bg-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(index)}
                      className="flex h-7 items-center justify-center rounded-full bg-gradient-to-r from-[#8F7130] to-[#B08D3C] px-2 text-[10px] font-bold text-white shadow-md transition hover:brightness-110"
                    >
                      ★ MAIN
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => moveImage(index, "right")}
                    disabled={index === images.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-[#34414A] shadow-md transition hover:bg-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length < maxImages && (
          <label
            htmlFor="add-photos"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D5DBDF] bg-[#F7F8F9] px-6 py-8 text-center transition hover:border-[#B08D3C] hover:bg-[#FBF7EC]"
          >
            <div className="text-4xl">📁</div>
            <div className="mt-3 font-bold text-[#34414A]">
              {images.length === 0 ? "Choose photos" : "Add more photos"}
            </div>
            <div className="mt-1 text-xs text-[#66737C]">
              Up to {maxImages} images — watermarked automatically
            </div>
            <input
              id="add-photos"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* VIDEO */}
      <div className="border-t border-[#E1E5E8] pt-6">
        <div className="mb-3">
          <label className="text-sm font-bold text-[#34414A]">
            Video (optional — max 50MB)
          </label>
          <p className="mt-0.5 text-xs text-[#89939A]">
            Short walk-around videos get up to 5x more views. Watermark overlay added on playback.
          </p>
        </div>

        {!videoUrl && !videoFile ? (
          <label
            htmlFor="add-video"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D3B86A] bg-[#FBF7EC] px-6 py-8 text-center transition hover:border-[#8F7130] hover:bg-[#F5EDD8]"
          >
            <div className="text-4xl">🎥</div>
            <div className="mt-3 font-bold text-[#34414A]">Upload a video</div>
            <div className="mt-1 text-xs text-[#66737C]">
              MP4, WEBM or MOV — max 50MB
            </div>
            <input
              id="add-video"
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="rounded-2xl border border-[#D5DBDF] bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-2xl text-white">
                  🎥
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[#34414A]">
                    {videoFile ? videoFile.name : "Video attached"}
                  </div>
                  <div className="text-xs text-[#66737C]">
                    {videoFile
                      ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB — uploads on save`
                      : "Existing video — kept unless replaced"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={removeVideo}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
              >
                Remove
              </button>
            </div>

            {videoUrl && !videoFile && (
              <video
                src={videoUrl}
                controls
                className="mt-3 w-full rounded-xl"
                style={{ maxHeight: "200px" }}
              />
            )}

            {videoFile && (
              <label
                htmlFor="replace-video"
                className="mt-3 block cursor-pointer rounded-xl border border-[#D5DBDF] bg-[#F7F8F9] px-4 py-2 text-center text-xs font-bold text-[#34414A] hover:bg-[#EEF1F3]"
              >
                🔄 Replace video
                <input
                  id="replace-video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {uploading && progress && (
        <div className="rounded-xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-3 text-center text-xs font-bold text-[#8F7130]">
          {progress}
        </div>
      )}
    </div>
  );
}