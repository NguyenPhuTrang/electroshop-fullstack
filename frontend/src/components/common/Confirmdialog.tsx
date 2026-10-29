"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    itemName?: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    loadingLabel: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    open,
    title,
    itemName,
    description,
    confirmLabel,
    cancelLabel,
    loadingLabel,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    // Close with Escape (not while the action is running).
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, loading, onCancel]);

    if (typeof document === "undefined") {
        return null;
    }

return createPortal(
    <AnimatePresence>
        {open && (
            <motion.div
                key="confirm-dialog-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onMouseDown={(event) => {
                    event.stopPropagation();

                    if (event.target === event.currentTarget && !loading) {
                        onCancel();
                    }
                }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4"
            >
                <motion.section
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                    aria-describedby="confirm-dialog-description"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
                >
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-6"
                            aria-hidden="true"
                        >
                            <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                        </svg>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        <h2
                            id="confirm-dialog-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            {title}
                        </h2>

                        {itemName && (
                            <p className="break-words text-sm font-semibold text-rose-600">
                                {itemName}
                            </p>
                        )}
                    </div>

                    <p
                        id="confirm-dialog-description"
                        className="mt-2 text-sm leading-6 text-slate-500"
                    >
                        {description}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                    />
                                    {loadingLabel}
                                </>
                            ) : (
                                confirmLabel
                            )}
                        </button>
                    </div>
                </motion.section>
            </motion.div>
        )}
    </AnimatePresence>,
    document.body
);
}