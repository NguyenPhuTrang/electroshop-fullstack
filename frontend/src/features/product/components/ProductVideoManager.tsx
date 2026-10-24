
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  uploadProductVideo,
  uploadProductVideoFromUrl,
  updateProductVideo,
  updateProductVideoFromUrl,
  deleteProductVideo,
} from "@/src/features/product/services/product-video.service";

type VideoSource = "file" | "url";

type ProductVideoManagerProps = {
  productId: number;
  productName: string;
  initialVideoUrl: string | null;
};

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProductVideoManager({
  productId,
  productName,
  initialVideoUrl,
}: ProductVideoManagerProps) {
  const t = useTranslations("ProductVideoManager");

  const [videoUrl, setVideoUrl] = useState<string | null>(
    initialVideoUrl
  );

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [source, setSource] = useState<VideoSource>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = submitting || deleting;
  const hasVideo = Boolean(videoUrl);

  // Synchronize the local video URL with the product data.
  useEffect(() => {
    setVideoUrl(initialVideoUrl);
  }, [initialVideoUrl]);

  const resetForm = useCallback(() => {
    setSource("file");
    setSelectedFile(null);
    setSourceUrl("");
    setEditing(false);
    setFormError("");
    setVideoModalOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Allow closing the modal with Escape.
  useEffect(() => {
    if (!videoModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        resetForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoModalOpen, busy, resetForm]);

  const handleAddVideo = () => {
    if (busy || hasVideo) {
      return;
    }

    resetForm();
    setVideoModalOpen(true);
  };

  const handleEditVideo = () => {
    if (busy || !hasVideo) {
      return;
    }

    setSource("file");
    setSelectedFile(null);
    setSourceUrl("");
    setEditing(true);
    setFormError("");
    setVideoModalOpen(true);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    setFormError("");

    const trimmedUrl = sourceUrl.trim();

    // Validate the selected file.
    if (source === "file" && !selectedFile) {
      setFormError(t("errors.selectFile"));
      return;
    }

    if (
      source === "file" &&
      selectedFile?.type &&
      !selectedFile.type.startsWith("video/")
    ) {
      setFormError(t("errors.invalidFile"));
      return;
    }

    // Validate the video URL.
    if (source === "url") {
      if (!trimmedUrl) {
        setFormError(t("errors.urlRequired"));
        return;
      }

      if (!isValidHttpUrl(trimmedUrl)) {
        setFormError(t("errors.invalidUrl"));
        return;
      }
    }

    const replacingVideo = Boolean(videoUrl);

    const toastId = toast.loading(
      replacingVideo
        ? t("toast.loadingReplace")
        : t("toast.loadingAdd")
    );

    setSubmitting(true);

    try {
      let result;

      if (source === "file") {
        const file = selectedFile!;

        result = replacingVideo
          ? await updateProductVideo(productId, file)
          : await uploadProductVideo(productId, file);
      } else {
        result = replacingVideo
          ? await updateProductVideoFromUrl(productId, trimmedUrl)
          : await uploadProductVideoFromUrl(productId, trimmedUrl);
      }

      // Update the UI only after the API succeeds.
      setVideoUrl(result.videoUrl);

      toast.success(
        replacingVideo
          ? t("toast.updated")
          : t("toast.added"),
        { id: toastId }
      );

      resetForm();
    } catch (error) {
      console.error("Failed to save product video:", error);

      const message =
        error instanceof Error
          ? error.message
          : t("errors.saveGeneric");

      setFormError(message);

      toast.error(t("toast.saveFailed"), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (busy || !hasVideo) {
      return;
    }

    const confirmed = window.confirm(
      t("confirmDelete", { productName })
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading(t("toast.loadingDelete"));

    setDeleting(true);

    try {
      await deleteProductVideo(productId);

      // Remove the video from the UI only after deletion succeeds.
      setVideoUrl(null);

      toast.success(t("toast.deleted"), { id: toastId });
    } catch (error) {
      console.error("Failed to delete product video:", error);

      toast.error(t("toast.deleteFailed"), { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const handleModalMouseDown = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget && !busy) {
      resetForm();
    }
  };

  return (
    <section
      aria-label={t("sectionLabel")}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            {t("header.eyebrow")}
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {t("header.title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("header.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-cyan-500" />
            {t("header.videoCount", { count: hasVideo ? 1 : 0 })}
          </span>

          {!hasVideo && (
            <button
              type="button"
              onClick={handleAddVideo}
              disabled={busy}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>

              {t("buttons.addVideo")}
            </button>
          )}
        </div>
      </header>

      {/* Video Library */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            {t("library.title")}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {t("library.description")}
          </p>
        </div>

        {!hasVideo ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="13" height="14" rx="2" />
                <path d="m16 10 5-3v10l-5-3" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              {t("empty.title")}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:p-5">
            <motion.article
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
            >
              {/* Video Preview */}
              <div className="relative overflow-hidden bg-black">
                <video
                  key={videoUrl}
                  src={videoUrl ?? undefined}
                  controls
                  preload="metadata"
                  className="aspect-video w-full"
                >
                  {t("player.unsupportedMessage")}
                </video>

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7-11-7Z" />
                  </svg>

                  {t("player.badge")}
                </span>
              </div>

              {/* Video Information */}
              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate text-sm font-medium text-slate-900">
                    {productName}
                  </p>

                  <p
                    className="mt-1 break-all text-xs leading-5 text-slate-500"
                    title={videoUrl ?? ""}
                  >
                    {videoUrl}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {t("player.available")}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={handleEditVideo}
                    disabled={busy}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("buttons.edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={busy}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting
                      ? t("buttons.deleting")
                      : t("buttons.delete")}
                  </button>

                  <a
                    href={videoUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                      aria-hidden="true"
                    >
                      <path d="M14 3h7v7M10 14 21 3" />
                      <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
                    </svg>

                    {t("buttons.openVideo")}
                  </a>
                </div>
              </div>
            </motion.article>
          </div>
        )}
      </section>

      {/* Add / Edit Video Modal */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
          onMouseDown={handleModalMouseDown}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-video-modal-title"
            className="my-auto w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            style={{ maxHeight: "calc(100dvh - 2rem)" }}
          >
            {/* Modal Header */}
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h3
                  id="product-video-modal-title"
                  className="text-lg font-semibold tracking-tight text-slate-900"
                >
                  {editing
                    ? t("modal.editTitle")
                    : t("modal.addTitle")}
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {editing
                    ? t("modal.editDescription")
                    : t("modal.addDescription")}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={busy}
                aria-label={t("modal.closeLabel")}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 p-5 sm:p-6"
            >
              {/* Video Source */}
              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">
                  {t("source.title")}
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setSource("file");
                      setFormError("");
                    }}
                    aria-pressed={source === "file"}
                    className={`rounded-lg border p-4 text-left transition ${
                      source === "file"
                        ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      {t("source.fileTitle")}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {t("source.fileDescription")}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setSource("url");
                      setFormError("");
                    }}
                    aria-pressed={source === "url"}
                    className={`rounded-lg border p-4 text-left transition ${
                      source === "url"
                        ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      {t("source.urlTitle")}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {t("source.urlDescription")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Video File */}
              {source === "file" ? (
                <div key="video-file-source">
                  <label
                    htmlFor="product-video-file"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {t("fields.file")}{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    id="product-video-file"
                    type="file"
                    accept="video/*"
                    disabled={busy}
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] ?? null);
                      setFormError("");
                    }}
                    className="block w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-700 file:mr-4 file:h-11 file:border-0 file:bg-slate-50 file:px-4 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {selectedFile && (
                    <p className="mt-2 break-all text-xs text-slate-500">
                      {t("fields.selectedFile", {
                        fileName: selectedFile.name,
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <div key="video-url-source">
                  <label
                    htmlFor="product-video-url"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {t("fields.url")}{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id="product-video-url"
                    type="url"
                    value={sourceUrl}
                    onChange={(event) => {
                      setSourceUrl(event.target.value);
                      setFormError("");
                    }}
                    placeholder="https://example.com/video.mp4"
                    disabled={busy}
                    className={inputClassName}
                  />

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    {t("fields.urlHelp")}
                  </p>
                </div>
              )}

              {/* Form Error */}
              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                >
                  {formError}
                </p>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("buttons.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  )}

                  {submitting
                    ? t("buttons.saving")
                    : editing
                      ? t("buttons.saveChanges")
                      : t("buttons.addVideo")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
