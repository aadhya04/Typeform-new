"use client";
import { useEffect, useRef } from "react";
import { Question } from "@/lib/types";

export default function QuestionRenderer({
  question, value, onChange, onEnter, error, accent, autoFocus = true,
}: {
  question: Question;
  value: any;
  onChange: (v: any) => void;
  onEnter?: () => void;
  error?: string | null;
  accent: string;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [question.id, autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
  };

  const baseInputClass = "underline-input accent-ring w-full bg-transparent py-3 text-2xl outline-none placeholder:text-neutral-300";

  switch (question.type) {
    case "short_text":
    case "email":
    case "number":
      return (
        <input
          ref={inputRef as any}
          type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here…"
          className={baseInputClass}
          style={{ borderColor: error ? "#E53E3E" : undefined }}
        />
      );

    case "long_text":
      return (
        <textarea
          ref={inputRef as any}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) onEnter?.(); }}
          placeholder="Type your answer here… (Shift+Enter for a new line)"
          rows={4}
          className={baseInputClass + " resize-none"}
        />
      );

    case "multiple_choice":
      return (
        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); }}
              className={`accent-ring flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-lg transition ${
                value === opt ? "text-white" : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700"
              }`}
              style={value === opt ? { background: accent, borderColor: accent } : {}}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded border text-xs font-semibold opacity-70">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        >
          <option value="" disabled>Choose an option…</option>
          {question.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );

    case "yes_no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`accent-ring flex-1 rounded-xl border py-4 text-lg font-medium transition ${
                value === opt ? "text-white" : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700"
              }`}
              style={value === opt ? { background: accent, borderColor: accent } : {}}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case "rating": {
      const max = question.settings?.max ?? 5;
      return (
        <div className="flex gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="accent-ring flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold transition"
              style={n <= (value ?? 0) ? { background: accent, borderColor: accent, color: "white" } : {}}
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    case "file_upload":
      return (
        <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-400 dark:border-neutral-700">
          📎 File upload — Coming Soon
        </div>
      );

    default:
      return null;
  }
}
