import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

function ErrorState({ title = "Something went wrong", message = "Unable to load data at this time.", onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export { ErrorState };
