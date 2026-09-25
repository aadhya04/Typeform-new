"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { PublicForm } from "@/lib/types";
import QuestionRenderer from "@/components/QuestionRenderer";

type Stage = "loading" | "welcome" | "filling" | "submitting" | "done" | "error";

export default function PublicFormFill() {
  const { slug } = useParams<{ slug: string }>();
  const [stage, setStage] = useState<Stage>("loading");
  const [form, setForm] = useState<PublicForm | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api.getPublicForm(slug).then((f) => {
      setForm(f);
      setStage(f.welcome_screen.enabled ? "welcome" : "filling");
    }).catch(() => setStage("error"));
  }, [slug]);

  const start = async () => {
    if (!form) return;
    const { response_id } = await api.startResponse(slug);
    setResponseId(response_id);
    setStage("filling");
  };

  useEffect(() => {
    if (stage !== "filling" || !form) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement?.tagName !== "TEXTAREA") goNext();
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, index, answers, form]);

  if (stage === "loading") return <div className="flex h-screen items-center justify-center text-neutral-400">Loading…</div>;
  if (stage === "error" || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-xl font-semibold">This form isn't available</p>
        <p className="text-neutral-400 text-sm">It may be unpublished or the link is incorrect.</p>
      </div>
    );
  }

  const accent = form.theme.primaryColor;
  const question = form.questions[index];

  async function goNext() {
    if (!form || !responseId) return;
    const q = form.questions[index];
    const val = answers[q.id];
    if (q.required && (val === undefined || val === null || val === "")) {
      setErrorMsg("This question is required");
      return;
    }
    if (q.type === "email" && val && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    setErrorMsg("");
    try {
      await api.submitAnswer({ response_id: responseId, question_id: q.id, value: val ?? "", last_question_index: index });
    } catch (e: any) {
      setErrorMsg(e.message);
      return;
    }
    if (index === form.questions.length - 1) {
      setStage("submitting");
      await api.completeResponse(responseId);
      setStage("done");
    } else {
      setDirection(1);
      setIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (index === 0) return;
    setDirection(-1);
    setErrorMsg("");
    setIndex((i) => i - 1);
  }

  if (stage === "welcome") {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-6 text-center" style={{ background: form.theme.background }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="mb-3 text-4xl font-extrabold">{form.welcome_screen.title}</h1>
          <p className="mb-8 max-w-md text-neutral-500">{form.description}</p>
          <button onClick={start} className="btn-accent rounded-full px-8 py-3 text-lg font-semibold" style={{ background: accent }}>
            {form.welcome_screen.buttonText} →
          </button>
        </motion.div>
      </div>
    );
  }

  if (stage === "submitting") {
    return <div className="flex h-screen items-center justify-center text-neutral-400">Submitting…</div>;
  }

  if (stage === "done") {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-6 text-center" style={{ background: form.theme.background }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-2 text-3xl font-bold">{form.thankyou_screen.title}</h1>
          <p className="text-neutral-500">{form.thankyou_screen.message}</p>
        </motion.div>
      </div>
    );
  }

  const progress = ((index + 1) / form.questions.length) * 100;

  return (
    <div className="flex h-screen flex-col" style={{ background: form.theme.background, ["--accent" as any]: accent }}>
      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800">
        <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: accent }} />
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl"
          >
            <p className="mb-2 text-sm font-medium" style={{ color: accent }}>
              {index + 1} → {form.questions.length}
            </p>
            <h2 className="mb-1 text-3xl font-bold sm:text-4xl">
              {question.title} {question.required && <span style={{ color: accent }}>*</span>}
            </h2>
            {question.description && <p className="mb-6 text-neutral-500">{question.description}</p>}

            <QuestionRenderer
              question={question}
              value={answers[question.id]}
              onChange={(v) => setAnswers((a) => ({ ...a, [question.id]: v }))}
              onEnter={goNext}
              accent={accent}
            />
            {errorMsg && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}

            <div className="mt-8 flex items-center gap-3">
              <button onClick={goNext} className="btn-accent rounded-full px-6 py-2.5 text-sm font-semibold" style={{ background: accent }}>
                {index === form.questions.length - 1 ? "Submit" : "OK"} ✓
              </button>
              {index > 0 && (
                <button onClick={goPrev} className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                  ← Back
                </button>
              )}
              <span className="text-xs text-neutral-400">press Enter ↵</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
