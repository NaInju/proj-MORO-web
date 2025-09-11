// src/App.tsx

import { Routes, Route, Navigate, useLocation, BrowserRouter } from "react-router-dom";
import { useEffect} from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Intro from "./pages/Intro";           // 서비스 소개
import ServiceInfo from "./pages/ServiceInfo"; // 서비스 이용법
import Service from "./pages/Service";         // 서비스
import Board from "./pages/Board";             // 후기 게시판
import NotFound from "./pages/NotFound";       // 404

function App() {
  // 라우트 변경 시 스크롤 상단으로(선택 사항)
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <>

        <div className="app-root">
          {/* 항상 상단에 표시 */}
          <Header />
        
          {/* 페이지 전환 영역 */}
          <main role="main">

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/intro" element={<Intro />} />
                <Route path="/serviceinfo" element={<ServiceInfo />} />
                <Route path="/service" element={<Service />} />
                <Route path="/board" element={<Board />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>

          </main>
        
          {/* 항상 하단에 표시 */}
          <Footer />
        </div>

    </>
  )
}

export default App
