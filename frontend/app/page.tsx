"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { FormListItem } from "@/lib/types";
import Modal from "@/components/Modal";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useToast } from "@/components/Toast";

export default function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renaming, setRenaming] = useState<FormListItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const load = () => api.listForms().then(setForms).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const createForm = async () => {
    if (!newTitle.trim()) return;
    const form = await api.createForm(newTitle.trim());
    setCreating(false);
    setNewTitle("");
    router.push(`/builder/${form.id}`);
  };

  const duplicate = async (id: string) => {
    await api.duplicateForm(id);
    toast.show("Form duplicated", "success");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this form and all its responses? This can't be undone.")) return;
    await api.deleteForm(id);
    toast.show("Form deleted", "success");
    load();
  };

  const togglePublish = async (f: FormListItem) => {
    if (f.status === "published") await api.unpublishForm(f.id);
    else {
      try {
        await api.publishForm(f.id);
      } catch (e: any) {
        toast.show(e.message, "error");
        return;
      }
    }
    load();
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
    toast.show("Link copied to clipboard", "success");
  };

  const submitRename = async () => {
    if (!renaming) return;
    await api.updateForm(renaming.id, { title: renameValue });
    setRenaming(null);
    load();
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Form<span style={{ color: "#FF3D71" }}>ify</span>
        </h1>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button
            onClick={() => setCreating(true)}
            className="btn-accent rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            + New form
          </button>
        </div>
      </header>

      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">Your forms</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Create, manage and track your forms in one place.
        </p>
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading forms…</p>
      ) : forms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-16 text-center dark:border-neutral-700">
          <p className="mb-4 text-neutral-500">You don't have any forms yet.</p>
          <button onClick={() => setCreating(true)} className="btn-accent rounded-full px-5 py-2.5 text-sm font-semibold">
            Create your first form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => (
            <div
              key={f.id}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-black/30">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      f.status === "published"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {f.status}
                  </span>
                  <span className="text-xs text-neutral-400">{f.response_count} responses</span>
                </div>
                <button
                  onClick={() => router.push(`/builder/${f.id}`)}
                  className="text-left text-lg font-semibold leading-snug hover:underline"
                >
                  {f.title}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <button onClick={() => router.push(`/builder/${f.id}`)} className="rounded-full border px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Edit</button>
                <button onClick={() => router.push(`/forms/${f.id}/responses`)} className="rounded-full border px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Results</button>
                <button onClick={() => { setRenaming(f); setRenameValue(f.title); }} className="rounded-full border px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Rename</button>
                <button onClick={() => duplicate(f.id)} className="rounded-full border px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Duplicate</button>
                <button onClick={() => togglePublish(f)} className="rounded-full border px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                  {f.status === "published" ? "Unpublish" : "Publish"}
                </button>
                {f.status === "published" && (
                  <button onClick={() => copyLink(f.share_slug)} className="rounded-full border px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Copy link</button>
                )}
                <button onClick={() => remove(f.id)} className="rounded-full border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Name your form">
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createForm()}
          placeholder="e.g. Customer Feedback Survey"
          className="underline-input w-full bg-transparent py-2 text-lg outline-none"
        />
        <button onClick={createForm} className="btn-accent mt-5 w-full rounded-full py-2.5 text-sm font-semibold">
          Create form
        </button>
      </Modal>

      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Rename form">
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitRename()}
          className="underline-input w-full bg-transparent py-2 text-lg outline-none"
        />
        <button onClick={submitRename} className="btn-accent mt-5 w-full rounded-full py-2.5 text-sm font-semibold">
          Save
        </button>
      </Modal>
    </div>
  );
}
