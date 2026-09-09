import React from "react";
import { Loader2 } from "lucide-react";

function LoadingState({ message = "Loading content...", height = "min-h-[250px]" }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 ${height}`}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export { LoadingState };
