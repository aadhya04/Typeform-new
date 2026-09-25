"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { FormResponse, FormStats, FormWithQuestions } from "@/lib/types";
import Modal from "@/components/Modal";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function ResponsesPage() {
  const { formId } = useParams<{ formId: string }>();
  const router = useRouter();
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [viewing, setViewing] = useState<FormResponse | null>(null);

  useEffect(() => {
    api.getForm(formId).then(setForm);
    api.listResponses(formId).then(setResponses);
    api.getStats(formId).then(setStats);
  }, [formId]);

  if (!form || !stats) return <div className="flex h-screen items-center justify-center text-neutral-400">Loading…</div>;

  const questionTitle = (id: string) => form.questions.find((q) => q.id === id)?.title || id;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">←</button>
          <div>
            <h1 className="text-xl font-bold">{form.title}</h1>
            <p className="text-sm text-neutral-400">Results</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <a href={api.csvExportUrl(formId)} className="rounded-full border px-4 py-2 text-sm font-medium dark:border-neutral-700">
            ⬇ Export CSV
          </a>
        </div>
      </header>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Total responses" value={stats.total_responses} />
        <StatCard label="Completed" value={stats.completed_responses} />
        <StatCard label="Completion rate" value={`${stats.completion_rate}%`} />
      </div>

      {/* Per-question breakdown */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.question_summaries.map((qs) => (
          <div key={qs.question_id} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="mb-2 text-sm font-semibold">{qs.title}</p>
            <p className="mb-2 text-xs text-neutral-400">{qs.total_answers} answers</p>
            {qs.breakdown && (
              <div className="flex flex-col gap-1.5">
                {Object.entries(qs.breakdown).map(([opt, count]) => (
                  <div key={opt} className="flex items-center gap-2 text-xs">
                    <span className="w-28 truncate">{opt}</span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(count / qs.total_answers) * 100}%`, background: form.theme.primaryColor }}
                      />
                    </div>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
            {qs.average !== undefined && qs.average !== null && (
              <p className="text-2xl font-bold">{qs.average} <span className="text-sm font-normal text-neutral-400">avg</span></p>
            )}
          </div>
        ))}
      </div>

      {/* Responses table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="px-4 py-3">{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : new Date(r.started_at).toLocaleString() + " (in progress)"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.completed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>
                    {r.completed ? "Complete" : "Partial"}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-neutral-500">
                  {r.answers.slice(0, 2).map((a) => String(a.value)).join(", ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setViewing(r)} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">View →</button>
                </td>
              </tr>
            ))}
            {responses.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-neutral-400">No responses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Response detail">
        {viewing && (
          <div className="flex max-h-96 flex-col gap-4 overflow-y-auto">
            {viewing.answers.map((a) => (
              <div key={a.question_id}>
                <p className="text-xs font-medium uppercase text-neutral-400">{questionTitle(a.question_id)}</p>
                <p className="text-sm">{String(a.value)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
