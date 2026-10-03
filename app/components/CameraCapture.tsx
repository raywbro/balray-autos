"use client";

import { useRef } from "react";

type Props = {
  onPhotosCaptured: (files: File[]) => void;
  onClose?: () => void;
};

export default function CameraCapture({ onPhotosCaptured, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onPhotosCaptured(files);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (onClose) onClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105"
      >
        📷 Take Photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}