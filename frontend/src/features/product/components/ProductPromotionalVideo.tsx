
"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type ProductPromotionalVideoProps = {
  videoUrl: string | null;
};

export default function ProductPromotionalVideo({
  videoUrl,
}: ProductPromotionalVideoProps) {
  const t = useTranslations("ProductPromotionalVideo");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoUrl) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

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
      aria-label={t("sectionLabel")}
      className="mt-5 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm sm:mt-6"
    >
      {/* Video Header */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cyan-500" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t("eyebrow")}
          </p>
        </div>

        <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
          {t("heading")}
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
          {t("unsupportedMessage")}
        </video>
      </div>
    </section>
  );
}
