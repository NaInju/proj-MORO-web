import '../styles/footer.css'
import '../styles/globals.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className='container'>
        <div className="footer-inner">
          {/* 상단: 좌측 로고 / 우측 정책 링크 */}
          <div className="footer-row">
            <div className="footer-brand">MORO</div>
            <nav className="footer-links" aria-label="푸터 정책 링크">
              <a href="#" onClick={(e)=>e.preventDefault()}>개인정보처리방침</a>
              <span aria-hidden>│</span>
              <a href="#" onClick={(e)=>e.preventDefault()}>이용약관</a>
            </nav>
          </div>
        
          {/* 하단: 좌측 저작권 / 우측 연락처·응원 링크 */}
          <div className="footer-meta">
            <div>© {new Date().getFullYear()} MORO. All rights reserved.</div>
            <div className='footer-context' style={{display:"flex", gap:14, flexWrap:"wrap"}}>
              <a href="mailto:blabla@gmail.com">문의 blabla@gmail.com</a>
              <a href="#" onClick={(e)=>e.preventDefault()}>MORO 응원하기</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}