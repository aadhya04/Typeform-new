"use client";
import { Theme } from "@/lib/types";

const PRESETS = ["#FF3D71", "#0F9D58", "#3B82F6", "#8B5CF6", "#F59E0B", "#111827"];

export default function ThemePanel({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="w-64 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Accent color</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ ...theme, primaryColor: c })}
            className="h-7 w-7 rounded-full ring-offset-2 transition"
            style={{ background: c, boxShadow: theme.primaryColor === c ? `0 0 0 2px ${c}` : undefined }}
          />
        ))}
        <input
          type="color"
          value={theme.primaryColor}
          onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
          className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
      </div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Background</p>
      <input
        type="color"
        value={theme.background}
        onChange={(e) => onChange({ ...theme, background: e.target.value })}
        className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
      />
    </div>
  );
}
