import { useLocation, useNavigate } from "react-router-dom";

import '../styles/tabnav.css'

export default function TabsNav() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  const items = [
    { label: "MORO 소개", to: "/intro" },
    { label: "서비스 이용법", to: "/serviceinfo" },
    { label: "MORO의 서비스 응원하기", to: "/board" },
  ];

  const isActive = (to: string) => {
    // 정확 매칭이 기본이지만 /board 하위경로도 활성 처리하고 싶으면 startsWith 사용
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <nav className="tabs" aria-label="상단 탭">
      {items.map((it) => (
        <button
          key={it.to}
          onClick={() => nav(it.to)}
          className={`tab ${isActive(it.to) ? "active" : ""}`}
          type="button"
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}