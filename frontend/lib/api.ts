const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Forms
  listForms: () => request<import("./types").FormListItem[]>("/api/forms"),
  createForm: (title: string) =>
    request<import("./types").FormWithQuestions>("/api/forms", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getForm: (id: string) => request<import("./types").FormWithQuestions>(`/api/forms/${id}`),
  updateForm: (id: string, payload: any) =>
    request<import("./types").FormWithQuestions>(`/api/forms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteForm: (id: string) => request<void>(`/api/forms/${id}`, { method: "DELETE" }),
  duplicateForm: (id: string) =>
    request<import("./types").FormWithQuestions>(`/api/forms/${id}/duplicate`, { method: "POST" }),
  publishForm: (id: string) =>
    request<import("./types").FormWithQuestions>(`/api/forms/${id}/publish`, { method: "POST" }),
  unpublishForm: (id: string) =>
    request<import("./types").FormWithQuestions>(`/api/forms/${id}/unpublish`, { method: "POST" }),

  // Questions
  createQuestion: (formId: string, payload: any) =>
    request<import("./types").Question>(`/api/forms/${formId}/questions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateQuestion: (formId: string, qId: string, payload: any) =>
    request<import("./types").Question>(`/api/forms/${formId}/questions/${qId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteQuestion: (formId: string, qId: string) =>
    request<void>(`/api/forms/${formId}/questions/${qId}`, { method: "DELETE" }),
  reorderQuestions: (formId: string, orderedIds: string[]) =>
    request<void>(`/api/forms/${formId}/questions/reorder`, {
      method: "POST",
      body: JSON.stringify({ ordered_ids: orderedIds }),
    }),

  // Public respondent flow
  getPublicForm: (slug: string) => request<import("./types").PublicForm>(`/api/public/forms/${slug}`),
  startResponse: (slug: string) =>
    request<{ response_id: string }>(`/api/public/forms/${slug}/start`, { method: "POST" }),
  submitAnswer: (payload: {
    response_id: string; question_id: string; value: any; last_question_index: number;
  }) => request<void>("/api/public/responses/answer", { method: "POST", body: JSON.stringify(payload) }),
  completeResponse: (responseId: string) =>
    request<void>("/api/public/responses/complete", {
      method: "POST",
      body: JSON.stringify({ response_id: responseId }),
    }),

  // Results
  listResponses: (formId: string) =>
    request<import("./types").FormResponse[]>(`/api/forms/${formId}/responses`),
  getResponse: (formId: string, responseId: string) =>
    request<import("./types").FormResponse>(`/api/forms/${formId}/responses/${responseId}`),
  getStats: (formId: string) =>
    request<import("./types").FormStats>(`/api/forms/${formId}/responses/stats/summary`),
  csvExportUrl: (formId: string) => `${BASE_URL}/api/forms/${formId}/responses/export/csv`,
};
