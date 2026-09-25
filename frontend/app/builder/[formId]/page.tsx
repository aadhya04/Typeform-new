"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { api } from "@/lib/api";
import { FormWithQuestions, Question, Theme } from "@/lib/types";
import { QUESTION_TYPES, typeMeta } from "@/lib/questionTypes";
import QuestionEditor from "@/components/QuestionEditor";
import QuestionRenderer from "@/components/QuestionRenderer";
import ThemePanel from "@/components/ThemePanel";
import SettingsModal from "@/components/SettingsModal";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useToast } from "@/components/Toast";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";

export default function Builder() {
  const { formId } = useParams<{ formId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [titleDraft, setTitleDraft] = useState("");

  useEffect(() => {
    api.getForm(formId).then((f) => {
      setForm(f);
      setTitleDraft(f.title);
      if (f.questions.length) setSelectedId(f.questions[0].id);
    });
  }, [formId]);

  const debouncedTitleSave = useDebouncedCallback((title: string) => {
    api.updateForm(formId, { title });
  }, 600);

  if (!form) return <div className="flex h-screen items-center justify-center text-neutral-400">Loading builder…</div>;

  const selected = form.questions.find((q) => q.id === selectedId) || null;
  const accent = form.theme.primaryColor;

  const addQuestion = async (type: Question["type"]) => {
    const meta = typeMeta(type);
    if (meta.comingSoon) { toast.show("File upload is coming soon", "info"); setShowAddMenu(false); return; }
    const q = await api.createQuestion(formId, {
      type, title: "", description: "", required: false,
      options: meta.defaultOptions || [], settings: meta.defaultSettings || {}, logic: [],
    });
    setForm({ ...form, questions: [...form.questions, q] });
    setSelectedId(q.id);
    setShowAddMenu(false);
  };

  const patchQuestion = (id: string, patch: Partial<Question>) => {
    setForm({ ...form, questions: form.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
    api.updateQuestion(formId, id, patch).catch(() => toast.show("Failed to save change", "error"));
  };

  const deleteQuestion = async (id: string) => {
    await api.deleteQuestion(formId, id);
    const remaining = form.questions.filter((q) => q.id !== id);
    setForm({ ...form, questions: remaining });
    setSelectedId(remaining[0]?.id ?? null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !form) return;
    const items = Array.from(form.questions);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setForm({ ...form, questions: items });
    api.reorderQuestions(formId, items.map((q) => q.id));
  };

  const togglePublish = async () => {
    try {
      const updated = form.status === "published" ? await api.unpublishForm(formId) : await api.publishForm(formId);
      setForm({ ...updated, questions: form.questions });
      toast.show(updated.status === "published" ? "Form published!" : "Form unpublished", "success");
    } catch (e: any) {
      toast.show(e.message, "error");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${form.share_slug}`);
    toast.show("Share link copied", "success");
  };

  const updateTheme = (theme: Theme) => {
    setForm({ ...form, theme });
    api.updateForm(formId, { theme });
  };

  return (
    <div className="flex h-screen flex-col" style={{ ["--accent" as any]: accent }}>
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">←</button>
          <input
            value={titleDraft}
            onChange={(e) => { setTitleDraft(e.target.value); debouncedTitleSave(e.target.value); }}
            className="bg-transparent text-lg font-semibold outline-none"
          />
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${form.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}>
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <div className="relative">
            <button onClick={() => setShowTheme((s) => !s)} className="rounded-full border px-3 py-1.5 text-sm dark:border-neutral-700">🎨 Theme</button>
            {showTheme && (
              <div className="absolute right-0 top-11 z-20">
                <ThemePanel theme={form.theme} onChange={updateTheme} />
              </div>
            )}
          </div>
          <button onClick={() => setShowSettings(true)} className="rounded-full border px-3 py-1.5 text-sm dark:border-neutral-700">⚙ Settings</button>
          <button onClick={() => router.push(`/forms/${formId}/responses`)} className="rounded-full border px-3 py-1.5 text-sm dark:border-neutral-700">Results</button>
          {form.status === "published" && (
            <button onClick={copyLink} className="rounded-full border px-3 py-1.5 text-sm dark:border-neutral-700">Copy link</button>
          )}
          <button onClick={togglePublish} className="btn-accent rounded-full px-4 py-1.5 text-sm font-semibold">
            {form.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: question list */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-neutral-200 p-3 dark:border-neutral-800">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-1.5">
                  {form.questions.map((q, i) => (
                    <Draggable
                        key={q.id}
                        draggableId={q.id}
                        index={i}
                        disableInteractiveElementBlocking
                      >
                      {(dragProvided, snapshot) => (
                        <button
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => setSelectedId(q.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                            selectedId === q.id ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                        >
                          <span className="text-neutral-400">{i + 1}</span>
                          <span>{typeMeta(q.type).icon}</span>
                          <span className="flex-1 truncate">{q.title || "Untitled question"}</span>
                        </button>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="relative mt-3">
            <button
              onClick={() => setShowAddMenu((s) => !s)}
              className="w-full rounded-lg border border-dashed border-neutral-300 py-2 text-sm font-medium text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
            >
              + Add question
            </button>
            {showAddMenu && (
              <div className="absolute left-0 top-11 z-20 w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                {QUESTION_TYPES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => addQuestion(t.type)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${t.comingSoon ? "opacity-50" : ""}`}
                  >
                    <span>{t.icon}</span>
                    <span className="flex-1">{t.label}</span>
                    {t.comingSoon && <span className="text-[10px] text-neutral-400">Soon</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Editor */}
        <main className="w-96 shrink-0 overflow-y-auto border-r border-neutral-200 p-6 dark:border-neutral-800">
          {selected ? (
            <QuestionEditor
              key={selected.id}
              question={selected}
              onChange={(patch) => patchQuestion(selected.id, patch)}
              onDelete={() => deleteQuestion(selected.id)}
            />
          ) : (
            <p className="text-sm text-neutral-400">Add a question to get started.</p>
          )}
        </main>

        {/* Live preview */}
        <section
          className="flex flex-1 items-center justify-center overflow-y-auto p-10"
          style={{ background: form.theme.background }}
        >
          {selected ? (
            <div key={selected.id} className="animate-fade-slide-up w-full max-w-xl">
              <p className="mb-2 text-sm font-medium" style={{ color: accent }}>
                Question {form.questions.findIndex((q) => q.id === selected.id) + 1}
              </p>
              <h2 className="mb-1 text-3xl font-bold">
                {selected.title || "Untitled question"} {selected.required && <span style={{ color: accent }}>*</span>}
              </h2>
              {selected.description && <p className="mb-6 text-neutral-500">{selected.description}</p>}
              <QuestionRenderer
                question={selected}
                value={previewAnswers[selected.id]}
                onChange={(v) => setPreviewAnswers((p) => ({ ...p, [selected.id]: v }))}
                accent={accent}
                autoFocus={false}
              />
              <p className="mt-6 text-xs text-neutral-400">Press Enter ↵ (this is a live preview only)</p>
            </div>
          ) : (
            <p className="text-neutral-400">Live preview will appear here</p>
          )}
        </section>
      </div>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        welcome={form.welcome_screen}
        thankyou={form.thankyou_screen}
        onSave={(welcome, thankyou) => {
          setForm({ ...form, welcome_screen: welcome, thankyou_screen: thankyou });
          api.updateForm(formId, { welcome_screen: welcome, thankyou_screen: thankyou });
        }}
      />
    </div>
  );
}
