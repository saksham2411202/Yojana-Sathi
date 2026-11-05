const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");

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
  apply_url?: string | null;
  eligibility_summary?: string | null;
  documents_note?: string | null;
  last_verified?: string | null;
  is_active: boolean;
  is_sample?: boolean;
  criteria?: string[];
  documents: DocumentItem[];
}

export interface SchemeCatalogItem {
  id: number;
  name: string;
  benefit_summary: string;
  level: string;
  state?: string | null;
  needs: string[];
  is_sample: boolean;
  source_url?: string | null;
  apply_url?: string | null;
  last_verified?: string | null;
}

export interface SchemeCatalogListResponse {
  items: SchemeCatalogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SchemeStatsResponse {
  total: number;
  by_level: Record<string, number>;
  by_need: Record<string, number>;
}

export interface CriterionCheckResult {
  field: string;
  rendered_text: string;
  status: "met" | "not_met" | "unknown";
}

export interface SchemeCheckResponse {
  scheme_id: number;
  status: "ELIGIBLE" | "NOT_ELIGIBLE" | "NEEDS_INFO";
  criteria: CriterionCheckResult[];
  missing_fields: string[];
  questions: NextQuestionData[];
}

export interface ChecklistItem {
  document_name: string;
  where_to_obtain: string;
  is_mandatory: boolean;
  scheme_names: string[];
}

export interface ChecklistResponse {
  documents: ChecklistItem[];
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  try {
    const res = await fetch(url, {
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
  } catch (err: unknown) {
    console.error(`Request to ${url} failed:`, err);
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("Failed to fetch") ||
      msg.includes("fetch failed") ||
      msg.includes("NetworkError") ||
      err instanceof TypeError
    ) {
      throw new Error("Cannot reach the server. Is the backend running?");
    }
    throw err;
  }
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

export async function fetchChecklist(sessionId: string, lang: string): Promise<ChecklistResponse> {
  return request<ChecklistResponse>(`/sessions/${sessionId}/checklist?lang=${encodeURIComponent(lang)}`);
}

export function getExportPdfUrl(sessionId: string, lang: string): string {
  return `${API_BASE}/sessions/${sessionId}/export.pdf?lang=${encodeURIComponent(lang)}`;
}

export async function fetchCatalogSchemes(params: {
  lang?: string;
  need?: string;
  state?: string;
  level?: string;
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<SchemeCatalogListResponse> {
  const query = new URLSearchParams();
  if (params.lang) query.set("lang", params.lang);
  if (params.need) query.set("need", params.need);
  if (params.state) query.set("state", params.state);
  if (params.level) query.set("level", params.level);
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  return request<SchemeCatalogListResponse>(`/schemes?${query.toString()}`);
}

export async function fetchCatalogStats(): Promise<SchemeStatsResponse> {
  return request<SchemeStatsResponse>("/schemes/stats");
}

export async function checkSchemeEligibility(
  schemeId: number,
  profile: Record<string, unknown>,
  sessionId?: string | null,
  lang = "en"
): Promise<SchemeCheckResponse> {
  return request<SchemeCheckResponse>(`/schemes/${schemeId}/check?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    body: JSON.stringify({
      profile,
      session_id: sessionId || null,
    }),
  });
}
