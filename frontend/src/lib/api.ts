const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface NeedItem {
  id: number;
  slug: string;
  icon: string;
  label: string;
}

export interface SessionData {
  id: string;
  language: string;
  selected_need_ids: number[];
  answers: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

export interface NextQuestionData {
  done: boolean;
  profile_field?: string;
  input_type?: "single_choice" | "number" | "yes_no" | "state_picker" | string;
  options?: string[];
  label?: string;
  help_text?: string;
  version?: number;
}

export interface SchemeSummary {
  id: number;
  name: string;
  benefit_summary: string;
  source_url?: string | null;
  last_verified?: string | null;
}

export interface MatchesData {
  eligible: SchemeSummary[];
  needs_info: SchemeSummary[];
  not_eligible: SchemeSummary[];
}

export interface DocumentItem {
  id: number;
  document_name: string;
  where_to_obtain: string;
  is_mandatory: boolean;
}

export interface SchemeDetailData {
  id: number;
  name: string;
  ministry?: string | null;
  level: string;
  state?: string | null;
  benefit_summary: string;
  source_url?: string | null;
  last_verified?: string | null;
  is_active: boolean;
  documents: DocumentItem[];
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchNeeds(lang: string): Promise<NeedItem[]> {
  return request<NeedItem[]>(`/needs?lang=${encodeURIComponent(lang)}`);
}

export async function createSession(language: string): Promise<SessionData> {
  return request<SessionData>("/sessions", {
    method: "POST",
    body: JSON.stringify({ language }),
  });
}

export async function updateSessionNeeds(sessionId: string, needIds: number[]): Promise<SessionData> {
  return request<SessionData>(`/sessions/${sessionId}/needs`, {
    method: "PUT",
    body: JSON.stringify({ need_ids: needIds }),
  });
}

export async function fetchNextQuestion(sessionId: string, lang: string): Promise<NextQuestionData> {
  return request<NextQuestionData>(`/sessions/${sessionId}/next-question?lang=${encodeURIComponent(lang)}`);
}

export async function submitAnswer(
  sessionId: string,
  profileField: string,
  value: unknown,
  unknown = false
): Promise<SessionData> {
  return request<SessionData>(`/sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({
      profile_field: profileField,
      value: unknown ? null : value,
      unknown,
    }),
  });
}

export async function undoLastAnswer(sessionId: string): Promise<{ removed_field: string | null }> {
  return request<{ removed_field: string | null }>(`/sessions/${sessionId}/answers/undo`, {
    method: "POST",
  });
}

export async function fetchMatches(sessionId: string, lang: string): Promise<MatchesData> {
  return request<MatchesData>(`/sessions/${sessionId}/matches?lang=${encodeURIComponent(lang)}`);
}

export async function fetchSchemeDetail(schemeId: number, lang: string): Promise<SchemeDetailData> {
  return request<SchemeDetailData>(`/schemes/${schemeId}?lang=${encodeURIComponent(lang)}`);
}
