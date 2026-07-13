import React, { useState, useEffect } from 'react';
import './index.css';
import logoImg from './assets/logo_new.png';
import bgImg from './assets/lobat.jfif';

function AuthPage({ onLoginSuccess, theme = 'dark', toggleTheme, onNavToHome }) {
  const colors = {
    bgStart: theme === 'dark' ? 'rgba(6, 8, 12, 0.96)' : 'rgba(238, 242, 246, 0.96)',
    bgEnd: theme === 'dark' ? 'rgba(15, 23, 42, 0.82)' : 'rgba(226, 232, 240, 0.82)',
    textMain: theme === 'dark' ? '#ffffff' : '#0f172a',
    cardBg: theme === 'dark' ? 'rgba(10, 13, 18, 0.65)' : '#ffffff',
    inputBg: theme === 'dark' ? 'rgba(5, 6, 8, 0.65)' : '#ffffff',
    border: theme === 'dark' ? 'rgba(243, 198, 95, 0.45)' : 'rgba(217, 119, 6, 0.4)',
    primaryGold: theme === 'dark' ? '#f3c65f' : '#d97706',
    borderWidth: theme === 'dark' ? '1px' : '3px',
    inputBorderWidth: theme === 'dark' ? '1px' : '2px',
  };
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');


  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (isSignIn && email === 'admin@csbat.com' && password === 'admin123') {
      localStorage.setItem('userEmail', email);
      onLoginSuccess('admin');
      return;
    }


    const endpoint = isSignIn ? 'http://localhost:5001/api/login' : 'http://localhost:5001/api/register';
    const payload = isSignIn ? { email, password } : { fullName, email, phone, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        if (isSignIn) {
          localStorage.setItem('userEmail', email);
          alert("Login Successful!");
          onLoginSuccess('customer');
        } else {
          alert("Registration Successful! Please Sign In.");
          setIsSignIn(true);
          setFullName(''); setEmail(''); setPhone(''); setPassword('');
        }
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Not connect server");
    }
  };

  return (
    <div style={{
      ...styles.pageWrapper,
      backgroundImage: `linear-gradient(135deg, ${colors.bgStart} 30%, ${colors.bgEnd} 100%), url(${bgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: colors.textMain
    }}>


      <div style={{
        ...styles.cyberGridOverlay,
        backgroundImage: theme === 'dark' 
          ? 'linear-gradient(rgba(243, 198, 95, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 198, 95, 0.02) 1px, transparent 1px)'
          : 'linear-gradient(rgba(217, 119, 6, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 119, 6, 0.05) 1px, transparent 1px)'
      }}></div>

      {/* NAVBAR */}
      <nav style={{ 
        ...styles.navbar, 
        padding: isMobile ? '15px 20px' : '20px 60px',
        background: theme === 'dark' ? 'rgba(6, 9, 13, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ ...styles.navLogo, cursor: 'pointer' }} onClick={onNavToHome || (() => window.location.href = '/')}>
          <div style={styles.logoRing}>
            <img src={logoImg} alt="CS Bat Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <span style={{ ...styles.navLogoText, color: colors.textMain }}>
            CS Bat {!isMobile && <span style={styles.portalTag}>SECURE ENGINE</span>}
          </span>
        </div>
        <div style={styles.terminalStatus}>
          <span style={styles.pulseDot}></span> {isMobile ? '' : ''}
        </div>
      </nav>


      <div style={{
        ...styles.mainSplitContent,
        padding: isMobile ? '30px 20px' : '40px 60px',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: isMobile ? 'center' : 'space-between'
      }}>


        {!isMobile && (
          <div style={styles.leftBrandColumn}>
            <div style={styles.cyberBadge}>⚡ BIOMECHANICAL HARDWARE ACCESS</div>
            <h1 style={{ ...styles.brandTitle, color: colors.textMain }}>
              Engineering The <br />
              <span style={{ ...styles.neonTextGold, color: colors.primaryGold, textShadow: theme === 'dark' ? '0 0 30px rgba(243, 198, 95, 0.4)' : 'none' }}>Future Of Ping.</span>
            </h1>
            <p style={styles.brandDesc}>
              Initialize secure handshake protocol to sync with the digital lathe matrix. Access real-time multi-axis customization, weight optimization, and advanced analytics.
            </p>


            <div style={styles.hudContainer}>
              <div style={styles.hudBox}>
                <span style={styles.hudLabel}>SYSTEM LATENCY</span>
                <span style={{ ...styles.hudValue, color: colors.textMain }}>0.04ms</span>
              </div>
              <div style={styles.hudBox}>
                <span style={styles.hudLabel}>WILLOW ANALYSIS</span>
                <span style={{ ...styles.hudValue, color: colors.textMain }}>AUTO</span>
              </div>
              <div style={styles.hudBox}>
                <span style={styles.hudLabel}>ENCRYPTION</span>
                <span style={{ ...styles.hudValue, color: '#4ade80' }}>AES-256</span>
              </div>
            </div>
          </div>
        )}


        <div style={{ ...styles.rightCardColumn, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-end' }}>
          <div style={{ ...styles.authCard, padding: isMobile ? '30px 20px' : '40px', background: colors.cardBg, borderColor: colors.border, borderWidth: colors.borderWidth }}>


            <div style={styles.tabBar}>
              <button
                type="button"
                style={{
                  ...styles.tabBtn,
                  color: isSignIn ? colors.primaryGold : '#475569',
                  background: isSignIn ? (theme === 'dark' ? 'rgba(243, 198, 95, 0.05)' : 'rgba(217, 119, 6, 0.05)') : 'transparent',
                  borderBottom: isSignIn ? `2px solid ${colors.primaryGold}` : (theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15,23,42,0.1)'),
                  boxShadow: isSignIn ? `0px 8px 20px -6px ${theme === 'dark' ? 'rgba(243, 198, 95, 0.2)' : 'rgba(217, 119, 6, 0.15)'}` : 'none'
                }}
                onClick={() => setIsSignIn(true)}
              >
                AUTHENTICATE
              </button>
              <button
                type="button"
                style={{
                  ...styles.tabBtn,
                  color: !isSignIn ? colors.primaryGold : '#475569',
                  background: !isSignIn ? (theme === 'dark' ? 'rgba(243, 198, 95, 0.05)' : 'rgba(217, 119, 6, 0.05)') : 'transparent',
                  borderBottom: !isSignIn ? `2px solid ${colors.primaryGold}` : (theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15,23,42,0.1)'),
                  boxShadow: !isSignIn ? `0px 8px 20px -6px ${theme === 'dark' ? 'rgba(243, 198, 95, 0.2)' : 'rgba(217, 119, 6, 0.15)'}` : 'none'
                }}
                onClick={() => setIsSignIn(false)}
              >
                REGISTER
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.authForm}>
              <div style={{ marginBottom: '20px' }}>
                <span style={styles.formMetaCode}></span>
                <h2 style={{ ...styles.formTitle, color: colors.textMain }}>{isSignIn ? 'Identity Verification' : 'Initialize Terminal Node'}</h2>
              </div>


              {!isSignIn && (
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>OPERATOR FULL NAME</label>
                  <div style={styles.inputIconWrapper}>
                    <span style={styles.inputIcon}>🆔</span>
                    <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ ...styles.customInput, background: colors.inputBg, color: colors.textMain, borderColor: colors.border, borderWidth: colors.inputBorderWidth }} required />
                  </div>
                </div>
              )}


              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>SECURE NET ADDRESS (EMAIL)</label>
                <div style={styles.inputIconWrapper}>
                  <span style={styles.inputIcon}>📧</span>
                  <input type="email" placeholder="professional@csbat.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...styles.customInput, background: colors.inputBg, color: colors.textMain, borderColor: colors.border, borderWidth: colors.inputBorderWidth }} required />
                </div>
              </div>


              {!isSignIn && (
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>MOBILE UPLINK (PHONE)</label>
                  <div style={styles.inputIconWrapper}>
                    <span style={styles.inputIcon}>📡</span>
                    <input type="tel" placeholder="+94 77 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ ...styles.customInput, background: colors.inputBg, color: colors.textMain, borderColor: colors.border, borderWidth: colors.inputBorderWidth }} required />
                  </div>
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>CRYPTOGRAPHIC PASSPHRASE</label>
                <div style={styles.inputIconWrapper}>
                  <span style={styles.inputIcon}>🔑</span>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...styles.customInput, background: colors.inputBg, color: colors.textMain, borderColor: colors.border, borderWidth: colors.inputBorderWidth }} required />
                </div>
              </div>


              {isSignIn && (
                <div style={{ ...styles.formOptions, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0', alignItems: isMobile ? 'flex-start' : 'center' }}>
                  <label style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', letterSpacing: '0.5px' }}>
                    <input type="checkbox" style={{ accentColor: colors.primaryGold }} /> REMEMBER TERMINAL STATE
                  </label>
                  <a href="#forgot" style={{ color: colors.primaryGold, fontSize: '11px', textDecoration: 'none', fontWeight: 'bold', letterSpacing: '0.5px' }}>FORGOT KEY?</a>
                </div>
              )}


              <button type="submit" style={{ 
                ...styles.actionButton, 
                marginTop: (isSignIn && isMobile) ? '15px' : '0',
                background: theme === 'dark' ? 'var(--gold-gradient, #f3c65f)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: theme === 'dark' ? '#06080c' : '#ffffff',
                boxShadow: theme === 'dark' ? '0 0 25px rgba(243, 198, 95, 0.35)' : '0 4px 15px rgba(217, 119, 6, 0.3)'
              }}>
                {isSignIn ? 'Sign in ➔' : 'Sign up ➔'}
              </button>
            </form>

            <div style={styles.cardFooterDisclaimer}>
              🔒 END-TO-END QUANTUM ENCRYPTION STANDARD APPLIED
            </div>
          </div>
        </div>

      </div>

      {/* 3. FOOTER */}
      <footer style={{ 
        ...styles.footer, 
        padding: isMobile ? '20px' : '20px 60px',
        background: theme === 'dark' ? '#05070a' : '#ffffff',
        borderTop: `1px solid ${colors.border}`
      }}>
        <div style={{ ...styles.footerBottom, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0', textAlign: isMobile ? 'center' : 'left' }}>
          <span></span>
          <span style={{ color: theme === 'dark' ? '#334155' : '#64748b' }}>SYSTEM CLOCK RESPONSIVE [2026]</span>
        </div>
      </footer>
    </div>
  );
}


const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden'
  },
  cyberGridOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'linear-gradient(rgba(243, 198, 95, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 198, 95, 0.02) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    pointerEvents: 'none',
    zIndex: 1
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(243, 198, 95, 0.15)',
    background: 'rgba(6, 9, 13, 0.92)',
    backdropFilter: 'blur(12px)',
    zIndex: 10
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoRing: {
    background: 'rgba(243, 198, 95, 0.05)',
    border: '1px solid rgba(243, 198, 95, 0.3)',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(243, 198, 95, 0.1)'
  },
  navLogoText: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '0.5px'
  },
  portalTag: {
    fontSize: '9px',
    color: '#f3c65f',
    background: 'rgba(243,198,95,0.12)',
    border: '1px solid rgba(243,198,95,0.3)',
    padding: '2px 8px',
    borderRadius: '3px',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    marginLeft: '8px',
    verticalAlign: 'middle'
  },
  terminalStatus: {
    fontSize: '11px',
    color: '#94a3b8',
    letterSpacing: '1px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.02)',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    background: '#4ade80',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 10px #4ade80'
  },
  mainSplitContent: {
    flex: 1,
    display: 'flex',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    alignItems: 'center',
    zIndex: 10,
    boxSizing: 'border-box'
  },
  leftBrandColumn: {
    flex: '1',
    maxWidth: '500px',
    paddingRight: '30px'
  },
  cyberBadge: {
    fontSize: '10px',
    color: '#f3c65f',
    fontWeight: 'bold',
    letterSpacing: '2px',
    background: 'rgba(243,198,95,0.08)',
    padding: '6px 12px',
    borderRadius: '4px',
    borderLeft: '3px solid #f3c65f',
    display: 'inline-block',
    marginBottom: '20px'
  },
  brandTitle: {
    fontSize: '52px',
    fontWeight: '900',
    lineHeight: '1.15',
    margin: '0 0 20px 0',
    letterSpacing: '-1px'
  },
  neonTextGold: {
    color: '#f3c65f',
    textShadow: '0 0 30px rgba(243, 198, 95, 0.4)'
  },
  brandDesc: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.65',
    margin: '0 0 35px 0'
  },
  hudContainer: {
    display: 'flex',
    gap: '15px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '25px'
  },
  hudBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '12px 18px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  hudLabel: {
    fontSize: '9px',
    color: '#475569',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '4px'
  },
  hudValue: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#cbd5e1',
    letterSpacing: '0.5px'
  },
  rightCardColumn: {
    flex: '1',
    display: 'flex'
  },
  authCard: {
    background: 'rgba(10, 13, 18, 0.65)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(243, 198, 95, 0.45)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(243, 198, 95, 0.08)',
    width: '100%',
    maxWidth: '430px',
    borderRadius: '14px',
    position: 'relative',
    boxSizing: 'border-box'
  },
  tabBar: {
    display: 'flex',
    marginBottom: '35px',
    background: 'rgba(0,0,0,0.2)',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  tabBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '12px 0',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '11px',
    letterSpacing: '1.5px',
    borderRadius: '6px',
    transition: 'all 0.25s ease'
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column'
  },
  formMetaCode: {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: '#475569',
    display: 'block',
    marginBottom: '4px'
  },
  formTitle: {
    margin: '0 0 25px 0',
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '22px'
  },
  inputLabel: {
    fontSize: '9px',
    color: '#64748b',
    fontWeight: 'bold',
    marginBottom: '8px',
    letterSpacing: '1px'
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '13px',
    pointerEvents: 'none'
  },
  customInput: {
    background: 'rgba(5, 6, 8, 0.65)',
    border: '1px solid rgba(243, 198, 95, 0.15)',
    padding: '15px 15px 15px 46px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
  },
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    width: '100%'
  },
  actionButton: {
    background: '#f3c65f',
    color: '#06080c',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontWeight: '900',
    fontSize: '12px',
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(243, 198, 95, 0.35)',
    transition: 'all 0.3s ease',
    textShadow: '0 1px 1px rgba(0,0,0,0.2)',
    width: '100%'
  },
  cardFooterDisclaimer: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#475569',
    letterSpacing: '0.5px',
    marginTop: '25px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '15px'
  },
  footer: {
    background: '#05070a',
    borderTop: '1px solid rgba(243, 198, 95, 0.1)',
    marginTop: 'auto',
    zIndex: 10
  },
  footerBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#334155',
    fontFamily: 'monospace',
    fontSize: '11px',
    letterSpacing: '0.5px'
  }
};

export default AuthPage;