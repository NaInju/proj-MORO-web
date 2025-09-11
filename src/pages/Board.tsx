

import { useEffect, useState } from "react";
import TabsNav from "../components/TabNav";

import SendIcon from "../components/icons/SendIcon";

import "../styles/board.css";


type Post = {
  id: string;
  text: string;
  createdAt: number;
};

export default function Board() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  // (선택) 로컬 스토리지에 임시 저장
  useEffect(() => {
    const saved = localStorage.getItem("moro-board");
    if (saved) setPosts(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("moro-board", JSON.stringify(posts));
  }, [posts]);

  const addPost = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setPosts((p) => [{ id: crypto.randomUUID(), text: v, createdAt: Date.now() }, ...p]);
    setText("");
  };

  const fmt = (t: number) =>
    new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="board">
      {/* 상단 탭 */}
      <section className="container">
        <TabsNav/>
      </section>

      {/* 입력 카드 */}
      <section className="container">
        <form className="bd-card" onSubmit={addPost}>
          <div className="bd-card-head">
            <p className="bd-card-title">
              <strong>MORO</strong>를 사용하면서 좋았던 점·불편한 점을 솔직하게 적어주세요! <br />
              여러분의 응원이 큰 힘이 됩니다 :)
            </p>
            <button className="bd-send" aria-label="등록">
              <SendIcon />
            </button>
          </div>

          <textarea
            className="bd-textarea"
            placeholder="예: 응답이 친절했고 도보 루트 추천이 좋았어요 / 지도가 조금 느렸어요 등"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="bd-actions">
            <button type="submit" className="btn">올리기</button>
            <span className="bd-hint">{text.trim().length}/500</span>
          </div>
        </form>
      </section>

      {/* 리스트 */}
      <section className="container">
        <div className="bd-boardwrap">
          <div className="bd-boardtitle">Board</div>
          <ul className="bd-list">
            {posts.length === 0 && (
              <li className="bd-empty">첫 응원/피드백을 남겨주세요!</li>
            )}
            {posts.map((p) => (
              <li key={p.id} className="bd-item">
                <div className="bd-meta">{fmt(p.createdAt)}</div>
                <p className="bd-text">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
