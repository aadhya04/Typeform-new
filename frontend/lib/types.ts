export type QuestionType =
  | "short_text" | "long_text" | "multiple_choice" | "dropdown"
  | "email" | "number" | "yes_no" | "rating" | "file_upload";

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  order_index: number;
  options: string[];
  settings: Record<string, any>;
  logic: any[];
}

export interface Theme {
  primaryColor: string;
  background: string;
  font: string;
}

export interface WelcomeScreen {
  enabled: boolean;
  title: string;
  buttonText: string;
}

export interface ThankyouScreen {
  title: string;
  message: string;
}

export interface FormListItem {
  id: string;
  title: string;
  status: "draft" | "published";
  share_slug: string;
  response_count: number;
  updated_at: string;
}

export interface FormWithQuestions {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  share_slug: string;
  theme: Theme;
  welcome_screen: WelcomeScreen;
  thankyou_screen: ThankyouScreen;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface PublicForm {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  welcome_screen: WelcomeScreen;
  thankyou_screen: ThankyouScreen;
  questions: Question[];
}

export interface ResponseAnswer {
  question_id: string;
  value: any;
}

export interface FormResponse {
  id: string;
  form_id: string;
  started_at: string;
  submitted_at: string | null;
  completed: boolean;
  answers: ResponseAnswer[];
}

export interface QuestionSummary {
  question_id: string;
  title: string;
  type: QuestionType;
  total_answers: number;
  breakdown?: Record<string, number>;
  average?: number;
}

export interface FormStats {
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  question_summaries: QuestionSummary[];
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  multiple_choice: "Multiple Choice",
  dropdown: "Dropdown",
  email: "Email",
  number: "Number",
  yes_no: "Yes / No",
  rating: "Rating",
  file_upload: "File Upload (Coming Soon)",
};
