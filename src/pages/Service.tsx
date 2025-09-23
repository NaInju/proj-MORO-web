

import { useEffect, useRef, useState } from "react";
import "../styles/service.css";
import "../styles/tokens.css"
import SendIcon from "../components/icons/SendIcon";
import { postChat } from "../api";

// 후보 파싱 유틸
function parseCandidates(text: string): string[] {
  // "1) 도쿄 — ..." / "2) 부산 — ..." 형식 파싱
  const lines = text.split("\n");
  const out: string[] = [];
  const re = /^\s*\d+\)\s*([---]|-)?\s*/; // 숫자) 후 머리 부분 제거
  for (const line of lines) {
    const m = line.match(/^\s*\d+\)\s*(.+?)\s*[----]\s*/); // "1) 후보 —" 전까지
    if (m && m[1]) out.push(m[1].trim());
  }
  // 여차하면 "1) ..." 형태가 아니더라도 후보 키워드만 수집
  if (out.length === 0) {
    for (const line of lines) {
      const m2 = line.match(/^\s*\d+\)\s*(.+)$/);
      if (m2 && m2[1]) out.push(m2[1].trim());
    }
  }
  return out.slice(0, 3);
}

type Msg = { id: string; role: "user" | "assistant"; text: string };
type Stage = "ask" | "recommend" | "pick" | "askPlan" | "plan" | "save";

export default function Service() {
  const [stage, setStage] = useState<Stage>("ask");
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: "assistant", text: "안녕하세요! 반가워요. 딱 맞는 여행을 함께 그려볼게요.\n어떤 분위기의 여행을 원하시나요?(예: 미니멀, 자연, 카페투어)" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [candidates, setCandidates] = useState<string[]>([]);


  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendUser(text: string) {
    setLoading(true);
    setError(null);

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    // 최신 히스토리 로컬 변수로 구성
    const history = [...messages, userMsg];

    // 화면에 먼저 사용자 메시지 반영
    setMessages(history);

    try {
      const answer = await postChat({
        messages: [
          ...history.map(m => ({ role: m.role, content: m.text })),
          // 위에서 userMsg 이미 history에 포함되어 있으므로 추가 X
        ],
      });

      const bot: Msg = { id: crypto.randomUUID(), role: "assistant", text: answer };
      const next = [...history, bot];
      setMessages(next);

      // 후보 파싱 및 단계 전환
      const parsed = parseCandidates(answer);
      if (parsed.length >= 2 || /어느 쪽이 더 끌리세요\?/i.test(answer)) {
        setCandidates(parsed);
        setStage("pick");
      } else if (/계획도 바로 짤까요\?/i.test(answer)) {
        setStage("askPlan");
      } else if (/Day\s*\d/i.test(answer) || /드래프트/i.test(answer)) {
        setStage("plan");
      }
    } catch (err: any) {
      setError(err.message || "네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || loading) return;
    setInput("");
    sendUser(v);
  };

  return (
    <div className="svc">
      <section className="svc-hero container">
        <p className="svc-title">당신은 어떤 마음을 가지고 어디로 떠나고 싶나요?</p>
      </section>

      {/* 상태/에러 표시 */}
      <section className="container">
        {error && <div className="alert-error">⚠️ {error}</div>}
      </section>

      {/* 채팅 영역 */}
      <section className="svc-chat container">
        <div className="chatbox" ref={listRef}>
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} />
          ))}

          {loading && (
            <div className="row left">
              <div className="bubble assistant">
                <span className="dotting">생각 중…</span>
              </div>
            </div>
          )}
        </div>

        {/* 하단 입력창 */}
        <form className="composer" onSubmit={onSubmit}>
          <input
            className="composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요…"
            maxLength={500}
            disabled={loading}
          />
          <button className="composer-send" aria-label="보내기" disabled={loading}>
            <SendIcon />
          </button>
        </form>
      </section>
      {/* 선택 단계 */}
      {stage === "pick" && (
        <div className="choices">
          {(candidates.length ? candidates : ["첫 번째 후보", "두 번째 후보"]).map((label, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => {
                const pick = label;
                setSelectedTrip(pick);
                sendUser(pick);
                setStage("askPlan");
              }}
            >
              {label} 선택
            </button>
          ))}
        </div>
      )}

      {/* 계획 여부 단계 */}
      {stage === "askPlan" && (
        <div className="choices">
          <button disabled={loading} onClick={() => { setStage("plan"); sendUser("예"); }}>예</button>
          <button disabled={loading} onClick={() => { setStage("save"); sendUser("아니오"); }}>아니오</button>
        </div>
      )}
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`row ${isUser ? "right" : "left"}`}>
      <div className={`bubble ${isUser ? "user" : "assistant"}`}>
        {text.split("\n").map((t, i) => (
          <p key={i} style={{ margin: 0 }}>{t}</p>
        ))}
      </div>
    </div>
  );
}