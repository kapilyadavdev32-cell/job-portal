import { SearchX } from "lucide-react";

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <SearchX className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

export { EmptyState };
