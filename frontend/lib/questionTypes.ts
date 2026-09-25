import { QuestionType } from "./types";

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: string;
  comingSoon?: boolean;
  defaultOptions?: string[];
  defaultSettings?: Record<string, any>;
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  { type: "short_text", label: "Short Text", icon: "✏️" },
  { type: "long_text", label: "Long Text", icon: "📝" },
  { type: "multiple_choice", label: "Multiple Choice", icon: "🔘", defaultOptions: ["Option 1", "Option 2"] },
  { type: "dropdown", label: "Dropdown", icon: "▾", defaultOptions: ["Option 1", "Option 2"] },
  { type: "email", label: "Email", icon: "✉️" },
  { type: "number", label: "Number", icon: "#" },
  { type: "yes_no", label: "Yes / No", icon: "⚖️" },
  { type: "rating", label: "Rating", icon: "⭐", defaultSettings: { max: 5 } },
  { type: "file_upload", label: "File Upload", icon: "📎", comingSoon: true },
];

export const typeMeta = (t: QuestionType) => QUESTION_TYPES.find((q) => q.type === t)!;
