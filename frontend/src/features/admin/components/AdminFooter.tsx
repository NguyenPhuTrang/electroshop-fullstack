export default function AdminFooter() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                {/* Copyright */}
                <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5"
                            aria-hidden="true"
                        >
                            <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-sm font-semibold tracking-tight text-slate-800">
                            Electroshop
                            <span className="ml-2 font-medium text-slate-400">
                                Admin Panel
                            </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            © 2026 Electroshop. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 pl-12 sm:pl-0">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-40" />
                        <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                        Store Management System
                    </span>
                </div>
            </div>
        </footer>
    );
}