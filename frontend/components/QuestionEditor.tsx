"use client";
import { Question } from "@/lib/types";

export default function QuestionEditor({
  question, onChange, onDelete,
}: { question: Question; onChange: (patch: Partial<Question>) => void; onDelete: () => void }) {
  const updateOption = (i: number, value: string) => {
    const opts = [...question.options];
    opts[i] = value;
    onChange({ options: opts });
  };
  const addOption = () => onChange({ options: [...question.options, `Option ${question.options.length + 1}`] });
  const removeOption = (i: number) => onChange({ options: question.options.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">Question</label>
        <input
          value={question.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="underline-input accent-ring w-full bg-transparent py-2 text-lg outline-none"
          placeholder="Type your question"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">Description (optional)</label>
        <input
          value={question.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="underline-input accent-ring w-full bg-transparent py-2 text-sm outline-none"
          placeholder="Add helper text"
        />
      </div>

      {(question.type === "multiple_choice" || question.type === "dropdown") && (
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-400">Options</label>
          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="underline-input accent-ring flex-1 bg-transparent py-1 text-sm outline-none"
                />
                <button onClick={() => removeOption(i)} className="text-neutral-400 hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addOption} className="mt-2 text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
            + Add option
          </button>
        </div>
      )}

      {question.type === "rating" && (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">Max rating</label>
          <select
            value={question.settings?.max ?? 5}
            onChange={(e) => onChange({ settings: { ...question.settings, max: Number(e.target.value) } })}
            className="underline-input w-24 bg-transparent py-1 text-sm outline-none"
          >
            {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onChange({ required: e.target.checked })}
          className="h-4 w-4"
        />
        Required question
      </label>

      <button onClick={onDelete} className="mt-2 self-start rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
        Delete question
      </button>
    </div>
  );
}
