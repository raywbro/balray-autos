"use client";

import { useState, useRef, useCallback } from "react";
import { WebCamera, WebCameraRef } from "@shivantra/react-web-camera";

type Props = {
  onPhotosCaptured: (files: File[]) => void;
  onClose: () => void;
};

export default function CameraCapture({ onPhotosCaptured, onClose }: Props) {
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const cameraRef = useRef<WebCameraRef>(null);

  const handleCapture = useCallback(async () => {
    if (cameraRef.current) {
      const file = await cameraRef.current.capture();
      if (file) {
        setCapturedPhotos((prev) => [...prev, file]);
      }
    }
  }, []);

  const handleDone = () => {
    onPhotosCaptured(capturedPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
      {/* Camera View */}
      <div className="relative w-full max-w-lg">
        <WebCamera
          ref={cameraRef}
          mode="environment" // Use back camera
          imageType="jpeg"
          imageQuality={0.9}
          style={{ width: "100%", height: "auto", borderRadius: "1rem" }}
        />
      </div>

      {/* Thumbnails of captured photos */}
      {capturedPhotos.length > 0 && (
        <div className="mt-4 flex w-full max-w-lg gap-2 overflow-x-auto p-2">
          {capturedPhotos.map((photo, index) => (
            <img
              key={index}
              src={URL.createObjectURL(photo)}
              alt={`Capture ${index + 1}`}
              className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={onClose}
          className="rounded-xl bg-gray-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleCapture}
          className="rounded-full bg-white p-6 text-4xl shadow-lg hover:bg-gray-200"
          aria-label="Capture photo"
        >
          📷
        </button>
        <button
          onClick={handleDone}
          disabled={capturedPhotos.length === 0}
          className="rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-50"
        >
          Done ({capturedPhotos.length})
        </button>
      </div>
    </div>
  );
}