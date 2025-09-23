
import TabsNav from "../components/TabNav";

import "../styles/serviceinfo.css";

export default function ServiceInfo() {
  return (
    <div className="si">
      {/* 상단 탭 네비 */}
      <section className="container">
        <TabsNav/>
      </section>

      {/* 헤더 타이틀 */}
      <section className="si-hero container">
        <h1 className="si-title">MORO를 어떻게 이용하면 될까요?</h1>
        <p className="si-desc">
          MORO와 대화를 시작합니다. 대화가 구체적일수록 훨씬 정밀한 추천을 받을 수 있어요!
        </p>
      </section>

      {/* Step 1 */}
      <section className="si-step container">
        <h2 className="si-step-title">1. MORO와 대화를 시작합니다</h2>
        <div className="chat-card">
          <ChatBubble role="assistant">만족도 높은 자신만의 여행이 가고 싶다면 먼저 본인에 대해 생각해봐야합니다.</ChatBubble>
          <ChatBubble role="assistant">안녕하세요 username님, 지금까지 자연 속 힐링에 높은 반응을 보이셨어요. 맞다면 알려주세요!</ChatBubble>
          <ChatBubble role="user">네! 자연 속 힐링이 좋아요.</ChatBubble>
          <ChatBubble role="assistant">그렇다면 username님, 좋아하는 계절과 활동이 있으실까요?</ChatBubble>
          <ChatBubble role="user">나는 여름을 좋아하고, 혼자서 걷기를 좋아해요.</ChatBubble>
        </div>
        <p className="si-note">MORO와 대화를 통해 요즘 어떤 여행이 어울리는지 또는 거리가 끌렸던 경험/계절/취향을 자유롭게 말씀해주세요.</p>
      </section>

      {/* Step 2 */}
      <section className="si-step container">
        <h2 className="si-step-title">2. 취향/조건을 조금 더 구체화해요</h2>
        <div className="chat-card">
          <ChatBubble role="assistant">휴양지도 괜찮으신가요?</ChatBubble>
          <ChatBubble role="user">휴양지도 좋아요.</ChatBubble>
          <ChatBubble role="assistant">제공드린 키워드 중 마음에 드는 키워드는 없었나요? 없었다면 추가로 고민해보겠습니다.</ChatBubble>
          <ChatBubble role="user">조용한 산책 위주로, 짧은 3박 4일로 가고 싶어</ChatBubble>
          <ChatBubble role="assistant" wide>
            그럼 관광지나 볼거리가 많은 곳보다는 아기자기한 풍경이 매력인 곳이 더 좋겠네요.<br/>
            그동안의 맥락으로 만들어진 경로/장소/메모를 카테고리로 정리해드리고 (username)님 노션 보드에 저장됩니다.
          </ChatBubble>
        </div>
      </section>

      {/* Step 3 */}
      <section className="si-step container">
        <h2 className="si-step-title">3. 지금 입력한 정보는 템플릿으로 저장돼요</h2>
        <div className="chat-card">
          <ChatBubble role="assistant" tone="link">
            (username)님! 추천지를 이렇게 받았거나 플랜이 완료되었으면 아래 링크로 내보내주세요!{" "}
            <a href="#" onClick={(e)=>e.preventDefault()} className="si-link">[템플릿 복제 링크]</a>
          </ChatBubble>
        </div>
      </section>

      {/* Step 4 */}
      <section className="si-step container">
        <h2 className="si-step-title">4. 저장된 템플릿은 언제든 열람/수정 가능</h2>
        <p className="si-note">
          저장한 템플릿은 마이페이지(준비 중)에서 언제든지 사용할 수 있어요.
          단, 익명/임시 모드에서는 저장이 제한될 수 있습니다.
        </p>
      </section>
    </div>
  );
}

/* --- 내부 미니 컴포넌트: 채팅 말풍선 --- */
function ChatBubble({
  role, children, wide = false, tone
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  wide?: boolean;
  tone?: "link";
}) {
  const isUser = role === "user";
  return (
    <div
      className={`bubble-row ${isUser ? "right" : "left"}`}
      style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        className={`ch-bubble ${isUser ? "bubble--user" : "bubble--assistant"} ${wide ? "bubble--wide" : ""} ${tone==="link" ? "bubble--link" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}