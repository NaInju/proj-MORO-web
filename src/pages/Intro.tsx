
import TabsNav from "../components/TabNav";

import '../styles/globals.css'
import "../styles/intro.css";

export default function Intro() {

  return (
    <div className="intro">
      <div className="container">
        {/* 상단 소개 */}
        <section className="intro-hero">
          <TabsNav />
    
          <div className="intro-card">
            <h1 className="intro-title">MORO는</h1>
            <p className="subtitle">→ Make Own ROUte 는</p>
              <p>
                모로가도 서울만 가면된다. → 모로가도 내가 가고 싶은 곳을 가면된다 <br />
                일본어 「もろ」는 “온전히, 그대로, 다”라는 맥락적 의미를 가지고 있습니다.
              </p>
              <p>
                MORO는 기존 관광 기반 여행이 아닌 사용자들이 <br />
                <strong>자신만의 여행</strong>을 그리고 온전히 그대로 즐길 수 있도록 돕는
                퍼스널 여행 추천 서비스입니다.
              </p>
          </div>
        </section>
    
        {/* 하단 설명 */}
        <section className="intro-detail">
          <h2 className="section-title">MORO의 챗봇과 사용자가 대화를 나누면</h2>
          <p>
            챗봇은 대화를 바탕으로 사용자를 추측해 사용자에게 알맞은 여행지를 추천해줍니다.
          </p>
          <p>
            사용자가 챗봇과 다양한 구체적인 대화를 많이 나눌수록 더 취향에 알맞는 결과를
            도출할 확률이 올라갑니다.
          </p>
          <p>
            여행지를 추천해줄 뿐만 아니라 여행지에 대한 정보나 여행 계획을 세우는 것도
            도와줄 수 있습니다.
          </p>
          <p>
            챗봇과 이야기하며 세운 여행 계획은 노션 템플릿 형태로 제공해 사용자의 노션에
            복제해 사용할 수 있습니다.
          </p>
          <p>
            계획을 짜지 않더라도 여행지 추천 후 결과를 저장하겠다고 하면 여행지와 입력된
            같은 형식의 노션 템플릿을 제공합니다.
          </p>
        </section>
      </div>
    </div>
  );
}