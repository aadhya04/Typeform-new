"use client";
import { useState } from "react";
import Modal from "./Modal";
import { ThankyouScreen, WelcomeScreen } from "@/lib/types";

export default function SettingsModal({
  open, onClose, welcome, thankyou, onSave,
}: {
  open: boolean; onClose: () => void;
  welcome: WelcomeScreen; thankyou: ThankyouScreen;
  onSave: (welcome: WelcomeScreen, thankyou: ThankyouScreen) => void;
}) {
  const [w, setW] = useState(welcome);
  const [t, setT] = useState(thankyou);
  const [tab, setTab] = useState<"screens" | "more">("screens");

  const save = () => { onSave(w, t); onClose(); };

  return (
    <Modal open={open} onClose={onClose} title="Form settings">
      <div className="mb-4 flex gap-4 border-b border-neutral-200 text-sm dark:border-neutral-800">
        <button onClick={() => setTab("screens")} className={`pb-2 ${tab === "screens" ? "border-b-2 border-current font-semibold" : "text-neutral-400"}`}>Welcome / Thank you</button>
        <button onClick={() => setTab("more")} className={`pb-2 ${tab === "more" ? "border-b-2 border-current font-semibold" : "text-neutral-400"}`}>More</button>
      </div>

      {tab === "screens" ? (
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={w.enabled} onChange={(e) => setW({ ...w, enabled: e.target.checked })} />
            Show welcome screen
          </label>
          <input value={w.title} onChange={(e) => setW({ ...w, title: e.target.value })} placeholder="Welcome title" className="underline-input bg-transparent py-2 text-sm outline-none" />
          <input value={w.buttonText} onChange={(e) => setW({ ...w, buttonText: e.target.value })} placeholder="Start button text" className="underline-input bg-transparent py-2 text-sm outline-none" />
          <hr className="border-neutral-200 dark:border-neutral-800" />
          <input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} placeholder="Thank-you title" className="underline-input bg-transparent py-2 text-sm outline-none" />
          <input value={t.message} onChange={(e) => setT({ ...t, message: e.target.value })} placeholder="Thank-you message" className="underline-input bg-transparent py-2 text-sm outline-none" />
          <button onClick={save} className="btn-accent mt-2 rounded-full py-2.5 text-sm font-semibold">Save</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-sm text-neutral-500">
          {["Logic jumps / branching", "Integrations & webhooks", "Team collaboration & sharing"].map((f) => (
            <div key={f} className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 px-3 py-2 dark:border-neutral-700">
              <span>{f}</span>
              <span className="text-xs text-neutral-400">Coming Soon</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
