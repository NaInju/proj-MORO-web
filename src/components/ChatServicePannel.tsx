import { useState, useRef, useEffect } from "react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function ChatPanel() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: "assistant", text: "안녕하세요! 어떤 마음으로 어디로 떠나고 싶나요?" }
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    setMsgs(m => [...m, userMsg]);

    // 데모용: 어시스턴트는 에코 + 제안
    const reply: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: `좋아요. "${text}" 기준으로 3일 도쿄 초안을 제안해볼게요.\n- Day1: 나카메구로 산책 → 다이칸야마 T-Site\n- Day2: 오모테산도 건축 투어 → 아오야마\n- Day3: 요요기공원 → 시모키타자와 골목\n(플래너로 내보내기 버튼은 추후 연결)`
    };
    setTimeout(() => setMsgs(m => [...m, reply]), 300);
    setInput("");
  };

  return (
    <div style={{
      border:"1px solid #e5e7eb", borderRadius:16, background:"#fff", overflow:"hidden",
      display:"grid", gridTemplateRows:"minmax(320px, 50vh) auto"
    }}>
      <div ref={listRef} style={{padding:16, overflowY:"auto"}}>
        {msgs.map(m => (
          <Bubble key={m.id} role={m.role} text={m.text} />
        ))}
      </div>

      <form onSubmit={onSubmit} style={{display:"flex", gap:8, padding:12, borderTop:"1px solid #e5e7eb", background:"#fafafa"}}>
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="예: 사람 적은 예쁜 길 위주로 걷고 싶어요"
          style={{
            flex:1, padding:"12px 14px", borderRadius:12, border:"1px solid #e5e7eb", outline:"none"
          }}
        />
        <button className="btn" type="submit">보내기</button>
      </form>
    </div>
  );
}

function Bubble({ role, text }: { role: "user"|"assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div style={{display:"flex", justifyContent: isUser ? "flex-end" : "flex-start", margin:"8px 0"}}>
      <div style={{
        whiteSpace:"pre-wrap",
        maxWidth: "76ch",
        padding:"10px 12px",
        borderRadius: 12,
        background: isUser ? "#111" : "#f3f4f6",
        color: isUser ? "#fff" : "#111"
      }}>
        {text}
      </div>
    </div>
  );
}