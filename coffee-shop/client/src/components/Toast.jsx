import { CheckCircle2 } from "lucide-react";

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <CheckCircle2 size={16} className="text-emerald-400" /> {message}
    </div>
  );
}
