// Service.tsx

import { useEffect, useRef, useState } from "react";
import "../styles/service.css";
import "../styles/tokens.css"
import SendIcon from "../components/icons/SendIcon";
import { postChat, createNotionPage } from "../api";


type Msg = { 
  id: string; 
  role: "user" | "assistant"; 
  text: string 
  options?: string[];
};
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

// AI가 준 Markdown / JSON / CSV 블록 파싱 로직

function extractStructuredBlocks(text: string) {
  const markdown = text.match(/```markdown([\s\S]*?)```/i)?.[1]?.trim();
  const jsonRaw = text.match(/```json([\s\S]*?)```/i)?.[1]?.trim();
  const csv = text.match(/```csv([\s\S]*?)```/i)?.[1]?.trim();
  let travel_info = null;
  try {
    if (jsonRaw) travel_info = JSON.parse(jsonRaw);
  } catch (e) {
    console.warn("JSON parse failed:", e);
  }
  return { plan_text: markdown, travel_info, csv_text: csv };
}

// 메타 텍스트 처리 로직

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

// 화면 표시용: 메타 힌트 제거(강화판, 한/영 키워드 포함)
function stripMeta(raw: string): string {
  let t = raw
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[：]/g, ":")
    .replace(/[–—]/g, "-");

  // 1) ```meta ... ``` 블록 제거
  t = t.replace(/```meta[\s\S]*?```/gi, "");

  // 2) 대괄호 한 덩어리 메타 제거: [NEXT: ...] / [다음: ...]
  t = t.replace(/\s*\[[^\]\n]*\b(NEXT|다음)\b[^\]\n]*\](?:[^\n]*)?/gim, "");

  // 3) 키워드가 있는 "그 줄" 제거(영/한)
  const keyLine = new RegExp(
    String.raw`^.*\b(NEXT|OPTION|OPTIONS?|FILLED|MISSING|CONF(?:IDENCE)?)\b\s*[:：].*$|^.*\b(다음|옵션|선택지|채움|부족|확신)\b\s*[:：].*$`,
    "gmi"
  );
  t = t.replace(keyLine, "");

  // 4) 남아있을 메타 꼬리 잘라내기
  const cutIdx = t.search(/\n\s*(?:\[?\s*(NEXT|다음)\s*:|```meta)/i);
  if (cutIdx !== -1) t = t.slice(0, cutIdx);

  // 5) 공백/빈 줄 정리
  return t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}


export default function Service() {
  const [stage, setStage] = useState<Stage>("ask");
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: "assistant", text: "안녕하세요! 반가워요. 딱 맞는 여행을 함께 그려볼게요.\n어떤 분위기의 여행을 원하시나요?(예: 미니멀, 자연, 카페투어)" },
  ]);
  const [profile, setProfile] = useState<Profile>({});    // 취향 슬롯(필요시 확장)

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // const [candidates, setCandidates] = useState<string[]>([]);

  const [planText, setPlanText] = useState<string>("");
  const [csvText, setCsvText] = useState<string>("");
  const [travelInfo, setTravelInfo] = useState<any>(null);


  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendUser(text: string) {
    setLoading(true);
    setError(null);

    setMessages(prev => prev.map(m => (m.options?.length ? { ...m, options: [] } : m)));

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    // 최신 히스토리 로컬 변수로 구성
    const history = [...messages, userMsg];

    // 화면에 먼저 사용자 메시지 반영
    setMessages(history);

    try {
      const { response, meta: rawMeta } = await postChat({
        messages: [
          ...history.map(m => ({ role: m.role, content: m.text })),
          // 위에서 userMsg 이미 history에 포함되어 있으므로 추가 X
        ],
      });

      // 단계 전환용 원문(meta)로 파싱
      const metaInfo = parseMeta(rawMeta ?? "");   // ← 원문 메타

      // 화면 표시용은 서버가 이미 제거한 response 사용 (추가 안전망으로 stripMeta 한 번 더)
      const visible = stripMeta(response);

      const structured = extractStructuredBlocks(rawMeta ?? "");
      if (structured.plan_text) setPlanText(structured.plan_text);
      if (structured.csv_text) setCsvText(structured.csv_text);
      if (structured.travel_info) setTravelInfo(structured.travel_info);

      // 기본 옵션: 모델 meta.options 그대로(최대 3개)
      let opts = (metaInfo.options || []).slice(0, 3);

      // 단계별 보조 옵션(모델이 options를 안줬을 때만)
      const nextStage = metaInfo.next;
      if ((!opts || opts.length === 0) && nextStage === "askPlan") {
        opts = ["예", "아니오"];
      }
      if ((!opts || opts.length === 0) && nextStage === "save") {
        opts = ["노션에 저장하기"];
      }

      const bot: Msg = { 
        id: crypto.randomUUID(), 
        role: "assistant", 
        text: visible, 
        options: opts
      };
      const nextMsgs = [...history, bot];
      setMessages(nextMsgs);

      // 추천 전환 가드
      const hasDates = !!profile.dates || !!profile.days;
      const hasBudget = !!profile.budget;
      const requiredOk = REQUIRED.every(k => Boolean(profile[k])) && hasDates && hasBudget;
      const confOk = (metaInfo.confidence ?? 0) >= 0.7;

      let s = nextStage;
      if (s === "recommend" && !(requiredOk || confOk)) s = "ask";
      if (s) setStage(s);


      // 단계 전환

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

      // Day별 라인 나누기 (markdown 내 "Day 1" 기준)
      const itineraryLines = planText
        ? planText.split("\n").filter(l => /^(Day\s*\d|\d+일차)/.test(l))
        : [];
  
      const payload = {
        selected_trip: selectedTrip || "여행 계획",
        style: profile.style || "",
        region: profile.region_like || "",
        companions: profile.companions || "",
        summary: planText.slice(0, 200), // 첫 부분을 요약으로
        itinerary: itineraryLines,
        travel_info: travelInfo,
      };

      const { page_url, guide } = await createNotionPage(payload);

      // 다운로드용 CSV
      if (csvText) {
        const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedTrip || "여행일정"}.csv`;
        link.click();
      }

      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `노션 페이지가 준비됐어요!\n${page_url}\n${guide ?? ""}`,
        },
      ]);
      setStage("done");
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: `노션 저장 중 오류: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="svc">
      {/* 상단 타이틀 */}
      <section className="svc-hero container">
        <p className="svc-title">당신은 어떤 마음을 가지고 어디로 떠나고 싶나요?</p>
      </section>


      <section className="svc-chat container">
        <div className="chatbox" ref={listRef}>
          {messages.map((m, idx) => (
            <Bubble
              key={m.id}
              role={m.role}
              text={m.text}
              // 마지막 assistant 말풍선에게만 옵션을 남김
              options={m.role === "assistant" && idx === messages.length - 1 ? (m.options || []) : []}
              onPick={(label) => {
                // 클릭 즉시 해당 말풍선 옵션 비우기
                setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, options: [] } : x)));

                // 단계별 행동
                if (stage === "pick") {
                  setSelectedTrip(label);
                  setStage("askPlan");
                  sendUser(`선택: ${label}`);
                  return;
                }
                if (stage === "askPlan") {
                  if (label === "예") { setStage("plan"); sendUser("네, 계획도 작성할게요"); }
                  else { setStage("recommend"); sendUser("아니오, 후보를 다시 볼게요"); }
                  return;
                }
                if (stage === "save" && label === "노션에 저장하기") {
                  onSaveNotion();
                  return;
                }

                // 그 외에는 일반 입력처럼 모델에 전달
                sendUser(label);
              }}
            />
          ))}

          {loading && (
            <div className="row left">
              <div className="bubble assistant"><span className="dotting">생각 중…</span></div>
            </div>
          )}
        </div>

        {/* 하단 입력창은 그대로: 사용자가 치는 텍스트만 보여주는 영역 */}
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

      {/* 상태/에러 표시 */}
      <section className="container">
        {error && <div className="alert-error">⚠️ {error}</div>}
      </section>
      
    </div>
  );
}


function Bubble({
  role, text, options = [], onPick,
}: {
  role: "user" | "assistant";
  text: string;
  options?: string[];
  onPick?: (label: string) => void;
}) {
  const isUser = role === "user";
  return (
    <div className={`row ${isUser ? "right" : "left"}`}>
      <div className={`bubble ${isUser ? "user" : "assistant"}`}>
        {text.split("\n").map((t, i) => (
          <p key={i} style={{ margin: 0 }}>{t}</p>
        ))}

        {/* 어시스턴트 말풍선 하단 퀵 리플라이 */}
        {!isUser && options.length > 0 && (
          <div className="quick-replies">
            {options.map((label) => (
              <button
                key={label}
                type="button"
                className="qr-chip"
                onClick={() => onPick?.(label)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}