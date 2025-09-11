import { useNavigate } from "react-router-dom";

import SectionMessage from "../components/SectionMessage";

import ArrowIcon from "../components/icons/ArrowIcon";
import Chevrons from "../components/icons/Chevrons";

import '../styles/home.css'

// ...

export default function Home(){
  const nav = useNavigate();
  const messages = [
    "여행은 가고 싶은데 어디에 가야할지 모르겠어요",
    "관광보다는 나한테 딱 맞는 퍼스널한 여행을 원해요",
    "복잡하게 고민하는 건 싫고 간단했으면 좋겠어요",
    "모로와 함께라면 쉽고 간단하게 당신만의 여행을 그릴 수 있어요\n지금 바로 시작해보세요",
  ];

  return (
    <>
      {/* Section 1 */}
      <section className="main-1">
        <div className="container">
          <div className="main-text">
            <h1 className="extra-bold title">지금 바로 당신만의 여행을 그려보세요</h1>
            {/* 티저: 실제 채팅이 아님 (가벼운 카드) */}
            <button
              className="moro-prompt"
              onClick={() => nav("/service")}
              aria-label="채팅 페이지로 이동"
            >
              <span>당신은 어떤 마음을 가지고 어디로 떠나고 싶나요?</span>
              <ArrowIcon />
            </button>
          </div>

          <div className="scroll-indicator">
            <Chevrons count={3}/>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="main-2">
        <div className="container">
          {messages.map((t, i) => (
            <SectionMessage 
            key={t} text={t} isLast={i === messages.length - 1} // 마지막 여부 전달
            />
          ))}
        </div>
      </section>

      {/* Section 3 */}
      <section className="main-3">
        <div className="container">
          <span className="moro-title">MORO는</span>
          <p>
            MORO는 기존 관광 기반 여행이 아닌 사용자들이<br />
            <span>자신만의 여행</span>을 그리고 온전히 그대로 즐길 수 있도록<br />
            돕는 퍼스널 여행 추천 서비스입니다.
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="main-4">
        <div className="container">
          <span>
            당신의 취미는 무엇인지, 좋아하는 계절은 언제인지<br />
            모로와 대화를 나누면 모로가 당신에게 알맞는 여행지를 추천해줄거에요.
          </span>
          <p>
            자세한 서비스 이용방법이나 예시는 우측 상단 메뉴를 눌러 이동하면 확인할 수 있습니다.
          </p>
        </div>
      </section>

    </>
  );
}

