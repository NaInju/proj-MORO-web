import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import '../styles/header.css'

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // 라우트 바뀌면 자동으로 닫기
  useEffect(() => { setOpen(false); }, [pathname]);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "saturate(180%) blur(8px)",
        borderBottom: "1px solid var(--divider)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 100,
        }}
      >
        {/* 로고 */}
        <Link to="/" className="cta-logo" style={{ fontFamily: 'Pretendard', fontSize: '32px', fontWeight: 800, letterSpacing: 0.5 }}>
          MORO
        </Link>

        {/* 데스크톱 */}
        {/* <nav className="hide-sm" aria-label="주요 메뉴" style={{display:"flex", gap:30,fontWeight:500,fontSize:'17px'}}>
          <Link to="/intro">MORO 소개</Link>
          <Link to="/serviceinfo">서비스 이용법</Link>
          <Link to="/service">MORO와 함께 여행준비하기</Link>
          <Link to="/board">MORO 응원하기</Link>
        </nav> */}

        {/* 햄버거 버튼 */}
        <button
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen(v => !v)}
          style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer" }}
          
        >
          {open ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* 오버레이 + 드로어 */}
      {open && (
        <Portal>
          <div className="drawer-backdrop" onClick={() => setOpen(false)} />
          <aside
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            className="drawer"
          >
            <nav className="drawer-nav" aria-label="모바일 메뉴">
              <button className="drawer-close" onClick={() => setOpen(false)}><CloseIcon /></button>
              <Link to="/">홈</Link>
              <Link to="/intro">MORO 소개</Link>
              <Link to="/serviceinfo">서비스 이용법</Link>
              <Link to="/service">MORO와 함께 여행준비하기</Link>
              <Link to="/board">MORO 응원하기</Link>
            </nav>
          </aside>
        </Portal>
      )}
    </header>
  );
}

function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 2H21" stroke="#6B6F74" strokeWidth="3" strokeLinecap="round" />
      <path d="M1 10H21" stroke="#6B6F74" strokeWidth="3" strokeLinecap="round" />
      <path d="M1 18H21" stroke="#6B6F74" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="#6B6F74" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

