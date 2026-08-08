import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await register(username, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .login-wrapper {
          width: 100vw;
          height: 100vh;
          background: #050506;
          color: #fff;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .login-wrapper .app {
          zoom: 1.4;
          width: calc(100vw / 1.4 - 8px);
          height: calc(100vh / 1.4 - 18px);
          min-width: 700px;
          min-height: 500px;
          display: grid;
          grid-template-columns: 55% 45%;
          overflow: hidden;
          background: #080809;
          border: 1px solid #6ea5ff;
        }
        .login-wrapper .left {
          position: relative;
          overflow: hidden;
          background: radial-gradient(520px 420px at 47% 63%, rgba(122,22,43,.16), transparent 68%),
                      radial-gradient(380px 300px at 20% 74%, rgba(70,18,35,.11), transparent 70%),
                      linear-gradient(125deg, #0a0a0b, #0a090a 45%, #080809);
        }
        .login-wrapper .left:before {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          left: 5%;
          top: 18%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,42,82,.065), rgba(255,42,82,.025) 32%, transparent 70%);
          filter: blur(28px);
          animation: atmo 9s ease-in-out infinite alternate;
        }
        .login-wrapper .left:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 48%;
          background: linear-gradient(to top, rgba(0,0,0,.36), transparent);
          pointer-events: none;
          z-index: 10;
        }
        @keyframes atmo {
          from { transform: translate(-25px,15px) scale(.92); }
          to { transform: translate(45px,12px) scale(1.08); }
        }

        .login-wrapper .brand {
          position: absolute;
          left: 42px;
          top: 42px;
          display: flex;
          align-items: center;
          gap: 9px;
          z-index: 50;
        }
        .login-wrapper .logo {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #ff6985, #ff3c61, #e92b50);
          box-shadow: 0 4px 16px rgba(255,49,85,.26);
          animation: logo 4s ease-in-out infinite;
        }
        .login-wrapper .logo svg {
          width: 16px;
        }
        .login-wrapper .brand-name {
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -.35px;
        }
        @keyframes logo {
          50% { box-shadow: 0 5px 28px rgba(255,49,85,.42); }
        }

        .login-wrapper .scene {
          position: absolute;
          left: 0;
          top: 92px;
          width: 100%;
          height: 300px;
          z-index: 20;
          perspective: 1000px;
        }
        .login-wrapper .scene:before {
          content: "";
          position: absolute;
          width: 440px;
          height: 250px;
          left: 62px;
          top: 30px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(255,45,82,.075), rgba(255,45,82,.025) 35%, transparent 72%);
          filter: blur(25px);
          animation: aura 7s ease-in-out infinite alternate;
        }
        @keyframes aura {
          from { transform: translate(-15px,12px) scale(.92); }
          to { transform: translate(22px,-12px) scale(1.08); }
        }

        .login-wrapper .message {
          position: absolute;
          overflow: hidden;
          border-radius: 11px;
          background: linear-gradient(145deg, rgba(31,31,34,.82), rgba(22,22,24,.76));
          border: 1px solid rgba(255,255,255,.035);
          box-shadow: 0 24px 60px rgba(0,0,0,.34), 0 4px 12px rgba(0,0,0,.18), inset 0 1px rgba(255,255,255,.025);
          backdrop-filter: blur(14px);
          transform-style: preserve-3d;
        }
        .login-wrapper .message:before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.055), transparent);
        }
        .login-wrapper .message-a {
          width: 286px;
          height: 65px;
          left: 102px;
          top: 18px;
          animation: m1 5.8s cubic-bezier(.45,.05,.55,.95) infinite;
        }
        @keyframes m1 {
          30% { transform: translate3d(-3px,-5px,4px) rotateY(-.4deg); }
          65% { transform: translate3d(4px,2px,7px) rotateY(.4deg); }
        }
        .login-wrapper .person {
          position: absolute;
          left: 12px;
          top: 12px;
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #48484d, #303035);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-wrapper .person svg {
          width: 14px;
        }
        .login-wrapper .msg-content {
          position: absolute;
          left: 49px;
          right: 12px;
          top: 12px;
        }
        .login-wrapper .msg-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .login-wrapper .msg-name {
          font-size: 8px;
          font-weight: 650;
          color: #d6d6d8;
        }
        .login-wrapper .msg-time {
          font-size: 6px;
          color: #69696e;
        }
        .login-wrapper .line {
          position: relative;
          overflow: hidden;
          height: 5px;
          margin-top: 9px;
          border-radius: 20px;
          background: #35353a;
        }
        .login-wrapper .line:after {
          content: "";
          position: absolute;
          top: 0;
          left: -60px;
          width: 60px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
          animation: scan 3.8s linear infinite;
        }
        .login-wrapper .line.two {
          width: 70%;
          margin-top: 6px;
        }
        @keyframes scan {
          to { left: 100%; }
        }

        .login-wrapper .message-b {
          width: 255px;
          height: 65px;
          left: 188px;
          top: 120px;
          background: linear-gradient(145deg, rgba(72,19,31,.56), rgba(45,16,25,.49));
          border-color: rgba(255,61,97,.18);
          box-shadow: 0 25px 60px rgba(0,0,0,.35), 0 8px 35px rgba(99,20,39,.09), inset 0 1px rgba(255,120,140,.025);
          animation: m2 5s cubic-bezier(.45,.05,.55,.95) infinite;
        }
        @keyframes m2 {
          35% { transform: translate3d(4px,5px,6px); }
          70% { transform: translate3d(-3px,-2px,2px); }
        }
        .login-wrapper .message-b:after {
          content: "";
          position: absolute;
          width: 180px;
          height: 70px;
          right: -30px;
          top: -20px;
          background: radial-gradient(ellipse, rgba(255,43,83,.07), transparent 70%);
          filter: blur(15px);
        }
        .login-wrapper .reply-top {
          position: absolute;
          right: 13px;
          top: 11px;
          display: flex;
          gap: 4px;
          z-index: 2;
        }
        .login-wrapper .reply-top span:first-child {
          color: #777177;
          font-size: 6px;
        }
        .login-wrapper .reply-top span:last-child {
          color: #d7aeb7;
          font-size: 8px;
          font-weight: 650;
        }
        .login-wrapper .reply-line {
          position: absolute;
          right: 13px;
          height: 5px;
          border-radius: 20px;
          background: linear-gradient(90deg, #853047, #a63b53);
          overflow: hidden;
        }
        .login-wrapper .reply-line:after {
          content: "";
          position: absolute;
          width: 45px;
          height: 100%;
          left: -50px;
          background: linear-gradient(90deg, transparent, rgba(255,140,160,.18), transparent);
          animation: scan2 3.5s linear infinite;
        }
        .login-wrapper .reply-line.one {
          top: 34px;
          width: 80%;
        }
        .login-wrapper .reply-line.two {
          top: 45px;
          width: 57%;
        }
        @keyframes scan2 {
          to { left: 100%; }
        }

        .login-wrapper .assets {
          position: absolute;
          width: 218px;
          height: 43px;
          left: 106px;
          top: 195px;
          display: flex;
          align-items: center;
          padding: 8px 11px;
          border-radius: 10px;
          background: linear-gradient(145deg, rgba(28,29,31,.94), rgba(21,22,24,.91));
          border: 1px solid #292a2d;
          box-shadow: 0 22px 45px rgba(0,0,0,.34), inset 0 1px rgba(255,255,255,.02);
          animation: asset 4.7s ease-in-out infinite;
        }
        @keyframes asset {
          50% { transform: translate3d(0,-5px,4px); }
        }
        .login-wrapper .check {
          position: relative;
          width: 21px;
          height: 21px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1fc091;
          background: radial-gradient(circle, #0b4a3b, #07372d);
          flex-shrink: 0;
        }
        .login-wrapper .check:after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(32,189,145,.15);
          animation: pulse 2.8s ease-out infinite;
        }
        .login-wrapper .check svg {
          width: 12px;
        }
        @keyframes pulse {
          to { opacity: 0; transform: scale(1.45); }
        }
        .login-wrapper .assets-copy {
          margin-left: 8px;
        }
        .login-wrapper .assets-title {
          color: #d1d1d3;
          font-size: 8px;
          font-weight: 650;
        }
        .login-wrapper .assets-sub {
          margin-top: 2px;
          color: #737379;
          font-size: 6px;
        }

        .login-wrapper .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(255,83,112,.42);
          box-shadow: 0 0 8px rgba(255,50,85,.25);
          animation: particle 5s ease-in-out infinite;
        }
        .login-wrapper .p1 { left: 92px; top: 100px; }
        .login-wrapper .p2 { left: 420px; top: 55px; animation-delay: -3s; }
        .login-wrapper .p3 { left: 460px; top: 178px; animation-delay: -2s; }
        .login-wrapper .p4 { left: 145px; top: 242px; animation-delay: -4s; }
        @keyframes particle {
          0%, 100% { opacity: .08; transform: translateY(10px) scale(.7); }
          50% { opacity: .7; transform: translate(5px,-18px) scale(1.2); }
        }

        .login-wrapper .connection {
          position: absolute;
          height: 1px;
          transform-origin: left center;
          background: linear-gradient(90deg, transparent, rgba(255,61,97,.12), transparent);
          opacity: .45;
          animation: conn 4s ease-in-out infinite;
        }
        .login-wrapper .connection.one {
          width: 90px;
          left: 260px;
          top: 102px;
          transform: rotate(24deg);
        }
        .login-wrapper .connection.two {
          width: 75px;
          left: 180px;
          top: 185px;
          transform: rotate(-20deg);
        }
        @keyframes conn {
          50% { opacity: .42; }
        }

        .login-wrapper .hero {
          position: absolute;
          left: 42px;
          bottom: 42px;
          z-index: 30;
          width: 390px;
        }
        .login-wrapper .hero h1 {
          font-size: clamp(42px, 4vw, 54px);
          line-height: .98;
          letter-spacing: -3px;
          font-weight: 760;
        }
        .login-wrapper .hero h1 span {
          display: block;
          color: #77777e;
        }
        .login-wrapper .hero p {
          width: 330px;
          margin-top: 16px;
          color: #99999f;
          font-size: 12px;
          line-height: 1.65;
        }

        /* right */
        .login-wrapper .right {
          background: #09090a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-wrapper .login {
          width: 275px;
        }
        .login-wrapper .login-head {
          margin-bottom: 22px;
        }
        .login-wrapper .login-head h2 {
          font-size: 21px;
          letter-spacing: -.75px;
        }
        .login-wrapper .login-head p {
          margin-top: 6px;
          color: #85858a;
          font-size: 9px;
        }
        .login-wrapper .field {
          position: relative;
          margin-bottom: 13px;
        }
        .login-wrapper .field > svg {
          position: absolute;
          left: 11px;
          top: 50%;
          width: 11px;
          height: 11px;
          transform: translateY(-50%);
          color: #606066;
          pointer-events: none;
        }
        .login-wrapper .field input {
          width: 100%;
          height: 38px;
          border: 1px solid #222226;
          border-radius: 9px;
          background: #18181b;
          color: #eee;
          padding: 0 35px;
          font-size: 9px;
          outline: none;
        }
        .login-wrapper .field input::placeholder {
          color: #68686d;
        }
        .login-wrapper .eye {
          right: 10px !important;
          left: auto !important;
          width: 12px !important;
          height: 12px !important;
          cursor: pointer;
          color: #626268;
          pointer-events: auto !important;
        }
        .login-wrapper .options {
          height: 17px;
          margin: 1px 1px 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #6e6e74;
          font-size: 7px;
        }
        .login-wrapper .remember {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .login-wrapper .remember input {
          appearance: none;
          width: 12px;
          height: 12px;
          border: 1px solid #343439;
          border-radius: 2px;
          background: #141416;
        }
        .login-wrapper .recovery {
          color: #717177;
          text-decoration: none;
        }
        .login-wrapper .primary {
          width: 100%;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: #ff3d61;
          color: #fff;
          font-size: 8px;
          font-weight: 650;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(255,61,97,.13);
        }
        .login-wrapper .primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-wrapper .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 22px 0;
        }
        .login-wrapper .divider:before,
        .login-wrapper .divider:after {
          content: "";
          height: 1px;
          flex: 1;
          background: #1d1d20;
        }
        .login-wrapper .divider span {
          color: #4d4d52;
          font-size: 7px;
        }
        .login-wrapper .social {
          width: 100%;
          height: 32px;
          margin-bottom: 8px;
          border: 1px solid #202024;
          border-radius: 7px;
          background: #111113;
          color: #d0d0d3;
          font-size: 8px;
          cursor: pointer;
          position: relative;
          letter-spacing: -.05px;
        }
        .login-wrapper .social-icon {
          position: absolute;
          left: 76px;
          width: 12px;
          height: 12px;
          display: block;
        }
        .login-wrapper .google-logo {
          width: 12px;
          height: 12px;
        }
        .login-wrapper .github-logo {
          width: 12px;
          height: 12px;
          color: #d7d7d9;
        }
        .login-wrapper .provision {
          text-align: center;
          margin-top: 20px;
          color: #5b5b61;
          font-size: 7px;
        }
        .login-wrapper .provision button {
          background: none;
          border: none;
          color: #ff4667;
          text-decoration: none;
          cursor: pointer;
          font-family: inherit;
        }
        .login-wrapper .provision button:hover {
          text-decoration: underline;
        }

        @media(max-width:850px) {
          .login-wrapper .app {
            min-width: 0;
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
            border: 0;
          }
          .login-wrapper .left {
            height: 430px;
          }
          .login-wrapper .right {
            min-height: 500px;
          }
          .login-wrapper .brand {
            left: 30px;
            top: 30px;
          }
          .login-wrapper .hero {
            left: 30px;
            bottom: 32px;
          }
        }
        @media(max-width:500px) {
          .login-wrapper {
            overflow: auto;
          }
          .login-wrapper .left {
            height: 390px;
          }
          .login-wrapper .scene {
            transform: scale(.75);
            transform-origin: left top;
          }
          .login-wrapper .hero {
            left: 24px;
            bottom: 25px;
          }
          .login-wrapper .hero h1 {
            font-size: 36px;
            letter-spacing: -2px;
          }
          .login-wrapper .hero p {
            width: 290px;
            font-size: 11px;
          }
          .login-wrapper .login {
            width: calc(100% - 40px);
            max-width: 300px;
          }
        }
      `}</style>
      <div className="login-wrapper">
        <div className="app">
          <section className="left">
            <div className="brand">
              <div className="logo">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M6.5 7.5h11v7h-7l-4 3v-10Z" stroke="white" strokeWidth="1.8"/>
                  <path d="M9 10.5h6M9 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="brand-name">Nexus</span>
            </div>

            <div className="scene">
              <div className="message message-a">
                <div className="person">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.1" fill="#89898f"/><path d="M6.5 18c.7-3.1 2.7-4.8 5.5-4.8s4.8 1.7 5.5 4.8" fill="#89898f"/></svg>
                </div>
                <div className="msg-content">
                  <div className="msg-top"><span className="msg-name">Design Team</span><span className="msg-time">10:24 AM</span></div>
                  <div className="line"></div><div className="line two"></div>
                </div>
              </div>

              <div className="message message-b">
                <div className="reply-top"><span>10:26 AM</span><span>You</span></div>
                <div className="reply-line one"></div><div className="reply-line two"></div>
              </div>

              <div className="assets">
                <div className="check">
                  <svg viewBox="0 0 24 24" fill="none"><path d="m7 12 3.2 3.2L17.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div className="assets-copy"><div className="assets-title">Assets synchronized</div><div className="assets-sub">Available across all platforms</div></div>
              </div>

              <span className="particle p1"></span><span className="particle p2"></span><span className="particle p3"></span><span className="particle p4"></span>
              <span className="connection one"></span><span className="connection two"></span>
            </div>

            <div className="hero">
              <h1>Connect with<span>absolute clarity.</span></h1>
              <p>The modern workspace for high-velocity teams. Intelligent design meets powerful real-time collaboration.</p>
            </div>
          </section>

          <section className="right">
            <div className="login">
              <div className="login-head">
                <h2>{isLogin ? 'Access Node' : 'Initialize Node'}</h2>
                <p>{isLogin ? 'Authenticate to enter the secure workspace.' : 'Create your secure credentials.'}</p>
              </div>

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="field">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="field">
                  <svg viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <svg viewBox="0 0 24 24" fill="none"><rect x="6" y="10" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M9 10V7.8a3 3 0 0 1 6 0V10" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <svg 
                    id="eye" 
                    className="eye" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <path d="M12 17.5c-3.8 0-7.2-2.1-9.5-5.5 2.3-3.4 5.7-5.5 9.5-5.5s7.2 2.1 9.5 5.5c-2.3 3.4-5.7 5.5-9.5 5.5z M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.5"/>
                    ) : (
                      <>
                        <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                      </>
                    )}
                  </svg>
                </div>

                <div className="options">
                  {isLogin ? (
                    <>
                      <label className="remember"><input type="checkbox"/><span>Keep me connected</span></label>
                      <a className="recovery" href="#">Recovery sequence?</a>
                    </>
                  ) : (
                    <div style={{ height: '14px' }}></div>
                  )}
                </div>

                {error && <div style={{ color: '#ff3d61', fontSize: '9px', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                <button type="submit" className="primary" id="init" disabled={loading}>
                  {loading ? 'Authenticating...' : (isLogin ? 'Initialize Session' : 'Create Credentials')}
                </button>
              </form>

              <div className="divider"><span>FEDERATED PROTOCOL</span></div>

              <button className="social">
                <svg className="social-icon google-logo" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 12.23c0-.68-.06-1.34-.18-1.97H12v3.73h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.15z"/>
                  <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.75z"/>
                  <path fill="#FBBC05" d="M6.54 13.82A5.85 5.85 0 0 1 6.23 12c0-.63.11-1.25.31-1.82V7.65H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.35l3.24-2.53z"/>
                  <path fill="#EA4335" d="M12 6.15c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.4l3.24 2.53C7.31 7.87 9.46 6.15 12 6.15z"/>
                </svg>
                Authenticate via Google
              </button>

              <button className="social">
                <svg className="social-icon github-logo" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.57 22.02c.57.1.78-.25.78-.55v-1.94c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.54-.29-5.21-1.27-5.21-5.65 0-1.25.45-2.27 1.18-3.08-.12-.29-.51-1.45.11-3.03 0 0 .97-.31 3.14 1.18a10.8 10.8 0 0 1 5.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.74.11 3.03.73.81 1.18 1.83 1.18 3.08 0 4.39-2.68 5.36-5.23 5.64.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.79.55A11.3 11.3 0 0 0 12 .7z"/>
                </svg>
                Authenticate via GitHub
              </button>

              <div className="provision">
                {isLogin ? 'Unregistered node? ' : 'Node provisioned? '}
                <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                  {isLogin ? 'Request provisioning' : 'Access node'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
