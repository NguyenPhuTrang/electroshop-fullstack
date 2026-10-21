"use client";

import { useEffect, useRef } from "react";

type ProductPromotionalVideoProps = {
  videoUrl: string | null;
};

export default function ProductPromotionalVideo({
  videoUrl,
}: ProductPromotionalVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoUrl) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        // Automatically play when at least 50% of the video is visible
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.5
        ) {
          video.muted = true;

          void video.play().catch((error: unknown) => {
            console.warn(
              "Unable to autoplay product promotional video:",
              error
            );
          });
        } else {
          // Pause when the video leaves the visible area
          video.pause();
        }
      },
      {
        threshold: [0, 0.5],
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [videoUrl]);

  // Do not display this section if the product has no video
  if (!videoUrl) {
    return null;
  }

  return (
    <section
      aria-label="Product promotional video"
      className="mt-5 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm sm:mt-6"
    >
      {/* Video Header */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cyan-500" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Discover the Product
          </p>
        </div>

        <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
          Product Promotional Video
        </h2>
      </div>

      {/* Full-Bleed Video Player */}
      <div className="w-full bg-black">
        <video
          ref={videoRef}
          className="block max-h-[85vh] w-full object-contain"
          src={videoUrl}
          controls
          muted
          playsInline
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      </div>
    </section>
  );
}