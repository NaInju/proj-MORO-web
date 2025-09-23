// src/api.ts
const API_BASE = import.meta.env.VITE_API_BASE;

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

function assertApiBase() {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE가 비어 있습니다. .env.local을 설정하세요.");
  }
}

/** /chat POST */
export async function postChat(
  body: { messages: ChatMsg[] },
  signal?: AbortSignal
): Promise<string> {
  assertApiBase();
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // JSON 파싱 실패 시
    throw new Error(`서버 응답 파싱 실패 (HTTP ${res.status})`);
  }

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `요청 실패 (HTTP ${res.status})`);
  }
  return data.response as string;
}

/** (선택) /notion/create POST — 저장 버튼 붙일 때 사용 */
export async function createNotionPage(payload: any): Promise<{ page_url: string; guide?: string }> {
  assertApiBase();
  const res = await fetch(`${API_BASE}/notion/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `노션 저장 실패 (HTTP ${res.status})`);
  }
  return { page_url: data.page_url, guide: data.guide };
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