import { Link } from "react-router-dom";
import Chevrons from "./icons/Chevrons"

type Props = {
  text: string;
  isLast?: boolean;
};

export default function SectionMessage({ text, isLast }: Props) {
  return (
    <section className="section-msg full-bleed">
      <div className="section-msg-bar" />
      {/* 텍스트 */}
      <div className="container section-msg-body">
        {isLast ? (
          <p className="lastText">
            모로와 함께라면 쉽고 간단하게 당신만의 여행을 그릴 수 있어요
            <br />
            <span className="lastEm"><Link to="/service">지금 바로 시작해보세요</Link></span>
          </p>
        ) : (
          <p className="section-msg-text">“{text}”</p>
        )}
      </div>

      {/* 쉐브론 */}
      {!isLast && (
        <div className="section-msg-chevron">
          <Chevrons count={2}/>
        </div>
      )}

      <div className="section-divider" />
    </section>
  );
}