// Service.tsx

import { useEffect, useRef, useState } from "react";
import "../styles/service.css";
import "../styles/tokens.css"
import SendIcon from "../components/icons/SendIcon";
import { postChat, createNotionPage } from "../api";


type Msg = { id: string; role: "user" | "assistant"; text: string };
type Stage = "ask" | "confirm" | "recommend" | "pick" | "askPlan" | "plan" | "save" | "done";

// 추가: 취향 슬롯(간단 버전)
type Profile = Partial<{
  style: string; region_like: string; region_avoid: string; companions: string;
  dates: string; days: string; budget: string; stay_style: string; pace: string;
  must: string; avoid: string; liked: string; disliked: string; food_cafe: string;
  constraints: string;
}>;
const REQUIRED: (keyof Profile)[] = ["style", "companions", "pace"];
const STAGES: Stage[] = ["ask", "confirm", "recommend", "pick", "askPlan", "plan", "save", "done"];


function parseMeta(text: string): {
  next?: Stage; options: string[]; filled: string[]; missing: string[]; confidence?: number;
} {
  const out = { next: undefined as Stage|undefined, options: [] as string[], filled: [] as string[], missing: [] as string[], confidence: undefined as number|undefined };

  // ```meta ...``` 블록 우선
  const block = text.match(/```meta([\s\S]*?)```/i)?.[1];
  const meta = block || text;

  const n = meta.match(/next:\s*(\w+)/i)?.[1];
  if (n && STAGES.includes(n as Stage)) out.next = n as Stage;

  const opts = block
    ? [...meta.matchAll(/-\s*(.+)/g)].map(m => m[1].trim())
    : (meta.match(/OPTIONS:\s*([^\n]+)/i)?.[1] || "")
        .split("|").map(s => s.trim()).filter(Boolean);
  out.options = opts;

  out.filled = (meta.match(/FILLED:\s*([^\n]+)/i)?.[1] || "")
                .split(",").map(s=>s.trim()).filter(Boolean);
  out.missing = (meta.match(/MISSING:\s*([^\n]+)/i)?.[1] || "")
                .split(",").map(s=>s.trim()).filter(Boolean);

  const conf = parseFloat(meta.match(/CONF(IDENCE)?:\s*([0-9.]+)/i)?.[2] || "");
  if (!Number.isNaN(conf)) out.confidence = conf;

  // 메타 없을 때 최소 휴리스틱 (유연성)
  if (!out.next) {
    if (/선택|고르|후보/i.test(text)) out.next = "pick";
    else if (/계획.*짜|일정.*만들/i.test(text)) out.next = "askPlan";
    else if (/Day\s*\d|1일차|드래프트/i.test(text)) out.next = "plan";
    else if (/저장|노션/i.test(text)) out.next = "save";
  }
  return out;
}

// 화면 표시용: 메타 힌트(코드블록/대괄호/키워드 라인) 제거 - 하드닝 버전
function stripMeta(text: string): string {
  let t = text;

  // ```meta ... ``` 코드블록 제거
  t = t.replace(/```meta[\s\S]*?```/gi, "");

  // 대괄호 한 줄 메타 제거: "[NEXT: ...] ..." 형태
  t = t.replace(/^\s*\[[^\]]*NEXT[^\]]*\][^\n]*\n?/gmi, "");

  // 키워드 라인 제거 (줄 어딘가에 있어도 그 줄 통째로 삭제)
  const keyLine = /^.*\b(NEXT|OPTIONS?|FILLED|MISSING|CONF(?:IDENCE)?)\s*[:：].*$/gmi;
  t = t.replace(keyLine, "");

  // 혹시 남아있을 마지막 메타 시작부터 싹 자르기(세이프가드)
  const cut = t.search(/\n\s*(?:\[?\s*NEXT\s*:|```meta)/i);
  if (cut !== -1) t = t.slice(0, cut);

  // 빈 줄 정리
  return t.replace(/\n{3,}/g, "\n\n").trim();
}


export default function Service() {
  const [stage, setStage] = useState<Stage>("ask");
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: "assistant", text: "안녕하세요! 반가워요. 딱 맞는 여행을 함께 그려볼게요.\n어떤 분위기의 여행을 원하시나요?(예: 미니멀, 자연, 카페투어)" },
  ]);
  const [options, setOptions] = useState<string[]>([]);   // 후보/선택지
  const [profile, setProfile] = useState<Profile>({});    // 취향 슬롯(필요시 확장)

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // const [candidates, setCandidates] = useState<string[]>([]);


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

      // postChat 호출 후

      // ✅ 메타 먼저 파싱해서 단계 전환에 활용
      const meta = parseMeta(answer);

      // ✅ 사용자에게 보일 텍스트는 메타 제거본으로
      const visible = stripMeta(answer);

      const bot: Msg = { id: crypto.randomUUID(), role: "assistant", text: visible };
      const nextMsgs = [...history, bot];
      setMessages(nextMsgs);

      // 후보/선택지 세팅
      if (meta.options?.length) setOptions(meta.options);

      // ✅ 추천 전환 가드 (취향 파악 충분성)
      const hasDates = !!profile.dates || !!profile.days;
      const hasBudget = !!profile.budget;
      const requiredOk = REQUIRED.every(k => Boolean(profile[k])) && hasDates && hasBudget;
      const confOk = (meta.confidence ?? 0) >= 0.7;

      let nextStage = meta.next;
      if (nextStage === "recommend" && !(requiredOk || confOk)) {
        nextStage = "ask"; // 아직 캐묻자
      }

      // 단계 전환
      if (nextStage) setStage(nextStage);
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

  async function onSaveNotion() {
    try {
      setLoading(true);
      const payload = {
        selected_trip: selectedTrip || "여행 계획",
        style: profile.style || "",
        region: profile.region_like || "",
        companions: profile.companions || "",
        summary: "", // 원하면 최근 assistant 요약을 messages에서 찾아 넣기
        // itinerary: ["Day1 ...", "Day2 ..."] // plan 단계에서 추출했다면
      };
      const { page_url, guide } = await createNotionPage(payload);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        text: `노션 페이지가 준비됐어요!\n${page_url}\n${guide ?? ""}`
      }]);
      setStage("done");
    } catch (e:any) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", text: `노션 저장 중 오류: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

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
          {(options.length ? options : ["첫 후보", "두 번째 후보"]).map((label) => (
            <button
              key={label}
              disabled={loading}
              onClick={() => {
                setSelectedTrip(label);
                sendUser(`선택: ${label}`); // 모델에게도 명시
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
          <button disabled={loading} onClick={() => { setStage("plan"); sendUser("네, 계획도 작성할게요"); }}>
            예
          </button>
          <button disabled={loading} onClick={() => { setStage("save"); sendUser("아니오, 저장만 할게요"); }}>
            아니오
          </button>
        </div>
      )}

      {stage === "save" && (
        <div className="choices">
          <button disabled={loading} onClick={onSaveNotion}>노션에 저장하기</button>
        </div>
      )}

      {stage === "confirm" && (
        <div className="choices">
          <button
            disabled={loading}
            onClick={() => {
              // "맞아" 확정 → 추천으로 진행
              sendUser("맞아. 이대로 추천해줘");
            }}
          >
            맞아
          </button>
          <button
            disabled={loading}
            onClick={() => {
              // "수정" → 다시 캐묻기
              sendUser("아니, 몇 가지 수정할게");
              setStage("ask");
            }}
          >
            수정할래
          </button>
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