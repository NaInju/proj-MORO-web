

import { useEffect, useRef, useState } from "react";
import "../styles/service.css";
import SendIcon from "../components/icons/SendIcon";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function Service() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: "user", text: "여행이 가고 싶은데 관광 말고 퍼스널한 여행이 가고 싶어" },
    { id: crypto.randomUUID(), role: "assistant", text: "안녕하세요! 반가워요. 지금부터 저와 대화를 통해 딱 맞는 여행을 추천드릴게요.\n당신의 이름은 무엇인가요?" },
    { id: crypto.randomUUID(), role: "user", text: "내 이름은 {username}이야." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: v }]);

    // 임시: 간단한 에코 응답
    const reply: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: `좋아요. "${v}" 라는 맥락으로 추천 준비해볼게요. (임시 응답)`,
    };
    setTimeout(() => setMessages((prev) => [...prev, reply]), 300);
    setInput("");
  };

  return (
    <div className="svc">
      <section className="svc-hero container">
        <h1 className="svc-title">지금 바로 당신만의 여행을 그려보세요</h1>
        <p className="svc-prompt">
          당신은 어떤 마음을 가지고 어디로 떠나고 싶나요?
          {/* 우측 종이비행기 아이콘 느낌은 아래 입력창에서 실제 사용 */}
        </p>
      </section>

      {/* 채팅 영역 */}
      <section className="svc-chat container">
        <div className="chatbox" ref={listRef}>
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} />
          ))}
        </div>

        {/* 하단 입력창 */}
        <form className="composer" onSubmit={onSubmit}>
          <input
            className="composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요…"
            maxLength={500}
          />
          <button className="composer-send" aria-label="보내기">
            <SendIcon />
          </button>
        </form>
      </section>
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