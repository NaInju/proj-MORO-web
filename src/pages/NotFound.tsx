import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <section
      className="container"
      style={{
        minHeight: "70dvh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>404</div>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          요청하신 페이지를 찾을 수 없어요.
        </p>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          경로: <code style={{ background:"#fff", padding:"2px 6px", borderRadius:6, border:"1px solid var(--divider)" }}>{pathname}</code>
        </p>

        <div style={{ marginTop: 16, display:"flex", gap: 8, justifyContent:"center", flexWrap:"wrap" }}>
          <Link to="/" className="btn">홈으로 가기</Link>
          <Link to="/intro" className="btn ghost">서비스 소개</Link>
        </div>
      </div>
    </section>
  );
}