// src/api.ts
const RAW_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;

// BASE 정규화: 끝 슬래시 제거
const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/+$/, "") : "";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

function assertApiBase() {
  if (!API_BASE) {
    // 개발/배포 둘 다 안내
    throw new Error(
      "VITE_API_BASE가 비어 있습니다. 개발용은 .env.local, 배포용은 .env.production에 설정하세요."
    );
  }
}

// 공통 fetch 래퍼: 타임아웃 + 표준 에러 변환
async function fetchJson(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  assertApiBase();
  const { timeoutMs = 20000, ...rest } = init;

  // 타임아웃/중단 지원
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...rest, signal: init.signal ?? controller.signal });

    // JSON 안전 파싱
    let data: any = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { /* 무시 */ }

    // 성공 케이스
    if (res.ok && data?.ok !== false) return { res, data };

    // 에러 메시지 구성
    let msg = data?.error || `요청 실패 (HTTP ${res.status})`;
    if (res.status === 503) msg = "서버가 준비 중입니다(콜드스타트). 잠시 후 다시 시도해 주세요.";
    if (res.status === 502 || res.status === 504) msg = "네트워크 지연 또는 게이트웨이 오류입니다. 잠시 후 다시 시도해 주세요.";
    throw new Error(msg);
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("요청이 시간 초과되었습니다. 다시 시도해 주세요.");
    // CORS/네트워크 차단 케이스
    if (e?.message?.includes("Failed to fetch")) {
      throw new Error("네트워크 또는 CORS 문제로 서버에 연결하지 못했습니다.");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/** /chat POST */
export async function postChat(
  body: { messages: ChatMsg[] },
  signal?: AbortSignal
): Promise<string> {
  const { data } = await fetchJson(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
    timeoutMs: 25000, // gpt 응답 여유
  });
  if (!data?.ok) throw new Error(data?.error || "서버 오류");
  return data.response as string;
}

/** (선택) /notion/create POST — 저장 버튼 붙일 때 사용 */
export async function createNotionPage(
  payload: any
): Promise<{ page_url: string; guide?: string }> {
  const { data } = await fetchJson(`${API_BASE}/notion/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    timeoutMs: 20000,
  });
  if (!data?.ok) throw new Error(data?.error || "노션 저장 실패");
  return { page_url: data.page_url, guide: data.guide };
}

/** (옵션) /health GET — 배포 진단용 */
export async function checkHealth(): Promise<{ ok: boolean; missing?: string[] }> {
  const { data } = await fetchJson(`${API_BASE}/health`, { method: "GET", timeoutMs: 8000 });
  return data || { ok: false };
}


// export type ChatPayload =
//   | { messages: { role: "system" | "user" | "assistant"; content: string }[] }
//   | { style?: string; region?: string; companions?: string; selected_trip?: string };

// const BASE = "http://127.0.0.1:5000"; // Flask 서버 주소(개발시)

// export async function postChat(payload: ChatPayload, signal?: AbortSignal): Promise<string> {
//   const res = await fetch(`${BASE}/chat`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//     signal,
//   });
//   const data = await res.json();
//   if (!data.ok) throw new Error(data.error || "Chat API error");
//   return data.response as string;
// }


// export async function postChat(payload: any) {
//   const res = await fetch("http://127.0.0.1:5000/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   const data = await res.json();
//   if (!data.ok) throw new Error(data.error || "Chat API error");
//   return data.response as string;
// }