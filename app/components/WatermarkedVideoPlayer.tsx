"use client";

import { useRef, useState } from "react";

export default function WatermarkedVideoPlayer({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full"
        style={{ maxHeight: "500px" }}
      />

      {/* Watermark overlay bottom-right */}
      <div className="pointer-events-none absolute bottom-14 right-3 z-10 flex flex-col items-end gap-1">
        <div className="rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <div className="text-xs font-black tracking-wide text-white drop-shadow-lg">
            BALRAY AUTOS
          </div>
          <div className="text-[10px] font-bold text-[#D2B66A]">
            balrayautos.co.za
          </div>
        </div>
      </div>

      {/* Watermark top-left (larger) */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm">
        <span className="text-base">🎥</span>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">
            Balray Autos
          </div>
          <div className="text-[9px] font-bold text-[#D2B66A]">
            balrayautos.co.za
          </div>
        </div>
      </div>

      {/* Center watermark — visible until user plays */}
      {!playing && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
          <div className="rounded-2xl bg-black/45 px-6 py-4 backdrop-blur-sm">
            <div className="text-xl font-black tracking-widest text-white/95">
              BALRAY AUTOS
            </div>
            <div className="mt-1 text-center text-xs font-bold text-[#D2B66A]">
              balrayautos.co.za
            </div>
          </div>
        </div>
      )}
    </div>
  );
}