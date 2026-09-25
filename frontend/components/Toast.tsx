"use client";
import { createContext, useCallback, useContext, useState } from "react";

interface ToastItem { id: number; message: string; kind: "success" | "error" | "info"; }
interface ToastContextValue { show: (message: string, kind?: ToastItem["kind"]) => void; }

const ToastContext = createContext<ToastContextValue>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastItem["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-slide-up rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
              t.kind === "success" ? "bg-emerald-600" : t.kind === "error" ? "bg-red-600" : "bg-neutral-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
