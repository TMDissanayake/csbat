import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Navbar from './Navbar';
import logoImg from './assets/logo_new.png'; 
import heroBgImg from './assets/lobat.jfif'; 
import myAImage from './assets/A.jfif';
import myBImage from './assets/B.jfif';
import myCImage from './assets/C.jpg';

const StatCounter = ({ target, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span style={styles.statNumber}>{count.toLocaleString()}{suffix}</span>;
};

const TiltCard = ({ children, style, className }) => {
  const [transform, setTransform] = useState('');
  
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
  };

  return (
    <div 
      className={className} 
      style={{
        ...style, 
        transform,
        transition: transform === 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)' ? 'transform 0.5s ease-out, box-shadow 0.4s ease' : 'transform 0.1s, box-shadow 0.4s ease',
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{transform: 'translateZ(30px)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        {children}
      </div>
    </div>
  );
};


function LandingPage({ onNavToHome, onNavToLogin, onNavToShop, onNavToCustomizer, onNavToDashboard, onNavToReviews, onNavToCart, theme, toggleTheme, currentPage }) {
  
  const [isMobile, setIsMobile] = useState(false);
  const [topReviews, setTopReviews] = useState([]);
  const reviewsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900); 
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);  
  }, []);

  useEffect(() => {
    fetch('http://localhost:5001/api/reviews')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Sort by rating desc, then by comment length desc for tie-breaking
          const sorted = [...data].sort((a, b) => {
            if ((b.rating || 5) !== (a.rating || 5)) return (b.rating || 5) - (a.rating || 5);
            return (b.comment || '').length - (a.comment || '').length;
          });
          setTopReviews(sorted.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#06080c' : '#eef2f6',
    textMain: isDark ? '#ffffff' : '#0f172a',
    cardBg: isDark ? 'rgba(15, 18, 24, 0.45)' : '#ffffff',
    border: isDark ? 'rgba(243, 198, 95, 0.25)' : 'rgba(217, 119, 6, 0.4)',
    textMuted: isDark ? '#94a3b8' : '#475569',
    footerBg: isDark ? '#040507' : '#eef2f6',
    boxBg: isDark ? 'rgba(10, 13, 18, 0.75)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(217, 119, 6, 0.4)',
    divider: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(217, 119, 6, 0.3)'
  };

  return (
    <div style={{ ...styles.pageContainer, background: colors.bg, color: colors.textMain }}>
      
      {/* BACKGROUND TECH GRID DECORATION */}
      <div style={styles.cyberGridOverlay}></div>

      <Navbar 
        onNavToHome={onNavToHome}
        onNavToShop={onNavToShop}
        onNavToCustomizer={onNavToCustomizer}
        onNavToLogin={onNavToLogin}
        onNavToDashboard={onNavToDashboard}
        onNavToReviews={onNavToReviews}
        onNavToCart={onNavToCart}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
      />

      {/*  HERO AREA  */}
      <header style={{
        ...styles.heroSection,
        padding: isMobile ? '60px 20px' : '100px 60px',
        backgroundImage: isDark
          ? `linear-gradient(135deg, rgba(6, 8, 12, 0.95) 40%, rgba(15, 23, 42, 0.75) 100%), url(${heroBgImg})`
          : `linear-gradient(135deg, rgba(248, 250, 252, 0.97) 40%, rgba(226, 232, 240, 0.85) 100%), url(${heroBgImg})`
      }}>
        <div style={styles.heroContent}>
          <div style={styles.cyberBadge}>⚡ ADVANCED CRICKET LABS SPECIFICATION</div>
          <h1 style={{ ...styles.heroTitle, color: colors.textMain, fontSize: isMobile ? '34px' : '56px' }}>
            Precision Engineered.<br />
            <span style={styles.neonTextGold}>Custom Crafted.</span>
          </h1>
          <p style={{ ...styles.heroSubtitle, color: colors.textMuted }}>
         
          </p>
          <div style={{ ...styles.heroButtons, flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
            
            {/* Goto customize page */}
            <button 
              type="button" 
              onClick={onNavToCustomizer} 
              style={styles.btnGold}
            >
               CUSTOMIZER BAT➔
            </button>

            <button type="button" onClick={onNavToShop} style={{ ...styles.btnOutline, color: colors.textMain, borderColor: colors.border }}>CATEGORY</button>
          </div>
        </div>
      </header>

      {/* sum number*/}
      <section style={{ 
        ...styles.statsContainer, 
        background: colors.boxBg,
        borderColor: colors.border,
        flexDirection: isMobile ? 'column' : 'row', 
        gap: isMobile ? '25px' : '0',
        margin: isMobile ? '20px' : '-40px auto 40px auto',
        width: isMobile ? 'calc(100% - 40px)' : '100%',
        boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(217, 119, 6, 0.15)'
      }}>
        <div style={styles.statBox}>
          <StatCounter target={10000} duration={2500} suffix="+" />
          <div style={{ ...styles.statLabel, color: colors.textMuted }}>CRAFTED METRIC TABLE</div>
        </div>
        <div style={styles.statBox}>
          <StatCounter target={15} duration={1500} suffix="+" />
          <div style={{ ...styles.statLabel, color: colors.textMuted }}>PRO LEAGUE STATIONS ACTIVE</div>
        </div>
        <div style={styles.statBox}>
          <StatCounter target={100} duration={2000} suffix="%" />
          <div style={{ ...styles.statLabel, color: colors.textMuted }}>BIOMECHANICAL MATCH FIT</div>
        </div>
      </section>
      
      {/*  ARMORY  */}
      <section style={{ ...styles.sectionArea, padding: isMobile ? '40px 20px' : '60px 60px' }}>
        <div style={{marginBottom: '40px'}}>
          <span style={styles.sectionMetaCode}></span>
          <h2 style={{ ...styles.sectionTitle, color: colors.textMain }}>The Armory Matrix</h2>
        </div>
        <div style={{ ...styles.armoryGrid, flexDirection: isMobile ? 'column' : 'row' }}>
          
          <TiltCard style={{ ...styles.armoryCard, background: colors.cardBg, borderColor: colors.cardBorder }}>
            <img src={myAImage} alt="Custom Clefts" style={styles.cardImage} />
            <div style={{
              ...styles.cardOverlay,
              background: isDark 
                ? 'linear-gradient(transparent 30%, rgba(6,8,12,0.95) 100%)' 
                : 'linear-gradient(transparent 30%, rgba(255,255,255,0.98) 100%)'
            }}>
              <span style={styles.cardTag}>TYPE-01</span>
              <h3 style={{ ...styles.cardTitle, color: colors.textMain }}>Custom Clefts</h3>
              <p style={{ ...styles.cardDesc, color: colors.textMuted }}>Premium English Willow select clefts tailored to exact grain orientation and node weight.</p>
              <a 
                href="#shop" 
                style={styles.cardLink}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavToShop) onNavToShop();
                }}
              >
               CATEGORY ➔
              </a>
            </div>
          </TiltCard>
          
          <TiltCard style={{ ...styles.armoryCard, background: colors.cardBg, borderColor: colors.cardBorder }}>
            <img src={myBImage} alt="Custom Clefts" style={styles.cardImage} />
            <div style={{
              ...styles.cardOverlay,
              background: isDark 
                ? 'linear-gradient(transparent 30%, rgba(6,8,12,0.95) 100%)' 
                : 'linear-gradient(transparent 30%, rgba(255,255,255,0.98) 100%)'
            }}>
              <span style={styles.cardTag}>TYPE-02</span>
              <h3 style={{ ...styles.cardTitle, color: colors.textMain }}>Hardwood Bats</h3>
              <p style={{ ...styles.cardDesc, color: colors.textMuted }}>Maximum density performance profiles engineered for rigorous automated net training sessions.</p>
              <a 
                href="#shop" 
                style={styles.cardLink}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavToShop) onNavToShop();
                }}
              >
                CATEGORY ➔
              </a>
            </div>
          </TiltCard>
          
          <TiltCard style={{ ...styles.armoryCard, background: colors.cardBg, borderColor: colors.cardBorder }}>
            <img src={myCImage} alt="Custom Clefts" style={styles.cardImage} />
            <div style={{
              ...styles.cardOverlay,
              background: isDark 
                ? 'linear-gradient(transparent 30%, rgba(6,8,12,0.95) 100%)' 
                : 'linear-gradient(transparent 30%, rgba(255,255,255,0.98) 100%)'
            }}>
              <span style={styles.cardTag}>TYPE-03</span>
              <h3 style={{ ...styles.cardTitle, color: colors.textMain }}>Softball Bats</h3>
              <p style={{ ...styles.cardDesc, color: colors.textMuted }}>Light-ball speed optimization. Engineered power profiles for light-ball tournament leagues.</p>
              <a 
                href="#shop" 
                style={styles.cardLink}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavToShop) onNavToShop();
                }}
              >
                CATEGORY ➔
              </a>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* BIO */}
      <section style={{ 
        ...styles.bmiSection, 
        background: isDark ? 'rgba(10, 13, 18, 0.4)' : 'rgba(243, 198, 95, 0.05)',
        borderTopColor: colors.cardBorder,
        borderBottomColor: colors.cardBorder,
        padding: isMobile ? '40px 20px' : '80px 60px' 
      }}>
        <div style={{ ...styles.bmiContainer, flexDirection: isMobile ? 'column-reverse' : 'row', gap: isMobile ? '40px' : '60px' }}>
          <div style={{ ...styles.bmiMetricsBox, background: colors.boxBg, borderColor: colors.border, width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' }}>
            <div style={{ ...styles.bmiRow, color: colors.textMain, borderBottomColor: colors.divider }}><span>Target Weight Variable</span><span style={{color: '#f3c65f', fontWeight: 'bold'}}>2.9 lbs</span></div>
            <div style={{ ...styles.bmiRow, color: colors.textMain, borderBottomColor: colors.divider }}><span>Flex Node Index</span><span style={{fontWeight: 'bold'}}>Semi-Stiff</span></div>
            <div style={{ ...styles.bmiRow, color: colors.textMain, borderBottomColor: colors.divider }}><span>Sweet Spot Coordinates</span><span style={{fontWeight: 'bold'}}>Mid-Low Matrix</span></div>
            <div style={styles.bmiProgressBg}>
              <div style={styles.bmiProgressFill}></div>
            </div>
            <div style={{textAlign: 'right', fontSize: '10px', fontFamily: 'monospace', color: '#475569', marginTop: '8px'}}></div>
          </div>

          <div style={styles.bmiInfoBox}>
            <div style={styles.cyberBadge}>CALCULATOR ALGORITHM</div>
            <h2 style={{ ...styles.bmiTitle, color: colors.textMain, fontSize: isMobile ? '28px' : '38px' }}>Smart BMI Specifications Recommendation</h2>
            <p style={{ ...styles.bmiDesc, color: colors.textMuted }}>
              Eradicate guesswork. Our proprietary algorithmic mainframe analyzes height metrics, mass indexes, and structural swing velocities to recommend the mathematically absolute bat design for your upper-body mechanics.
            </p>
            <div style={{ ...styles.bmiList, color: colors.textMain }}>
              <span>⚡ OPTIMIZE INITIAL SWING VELOCITY</span>
              <span>🎯 SYSTEMATIC INJURY PREVENTION RADAR</span>
            </div>

            {/* Goto customize page */}
            <button 
              type="button" 
              onClick={onNavToCustomizer} 
              style={{ ...styles.btnGoldSmall, width: isMobile ? '100%' : 'auto' }}
            >
              CUSTOMIZE ➔
            </button>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM CORE FEATURES GRID */}
      <section style={{ ...styles.sectionArea, padding: isMobile ? '20px' : '60px 60px' }}>
        <div style={{ ...styles.featuresGrid, flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ ...styles.featureItem, background: colors.cardBg, borderColor: colors.cardBorder }}>
            <div style={styles.featureIcon}><center>💳</center></div>
            <h4 style={{ ...styles.featureTitle, color: colors.textMain }}>24/7 Digital Configuration</h4>
            <p style={styles.featureText}></p>
          </div>
          <div style={{ ...styles.featureItem, background: colors.cardBg, borderColor: colors.cardBorder }}>
            <div style={styles.featureIcon}><center>📱</center></div>
            <h4 style={{ ...styles.featureTitle, color: colors.textMain }}>Real-time Automated SMS Tracker</h4>
            <p style={styles.featureText}></p>
          </div>
          <div style={{ ...styles.featureItem, background: colors.cardBg, borderColor: colors.cardBorder }}>
            <div style={styles.featureIcon}><center>🛠️</center></div>
            <h4 style={{ ...styles.featureTitle, color: colors.textMain }}>Elite Laboratory Crafting</h4>
            <p style={styles.featureText}></p>
          </div>
        </div>
      </section>

      {/* ── TOP REVIEWS SECTION ── */}
      {topReviews.length > 0 && (
        <section ref={reviewsRef} style={{
          padding: isMobile ? '50px 20px' : '80px 60px',
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(243,198,95,0.03) 50%, transparent 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(243,198,95,0.04) 50%, transparent 100%)',
          position: 'relative', zIndex: 5
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '20px', marginBottom: '44px' }}>
              <div>
                <span style={styles.sectionMetaCode}>★ PLAYER TESTIMONIALS</span>
                <h2 style={{ ...styles.sectionTitle, color: colors.textMain }}>What Players Say</h2>
              </div>
              <button
                type="button"
                onClick={onNavToReviews}
                style={{
                  background: 'rgba(243,198,95,0.08)', border: '1px solid rgba(243,198,95,0.3)',
                  color: '#f3c65f', padding: '10px 22px', borderRadius: '8px',
                  fontWeight: '800', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
                  transition: 'all 0.3s', flexShrink: 0
                }}
              >
                ALL REVIEWS ➔
              </button>
            </div>

            {/* Review Cards */}
            <div style={{ display: 'flex', gap: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
              {topReviews.map((rv, i) => {
                const avatarColors = ['#f3c65f,#d97706', '#10b981,#059669', '#6366f1,#4f46e5'];
                const colorPair = avatarColors[i % avatarColors.length];
                const initials = rv.name ? rv.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
                return (
                  <div key={rv._id || i} className="card-hover" style={{
                    flex: 1,
                    background: isDark ? 'rgba(12,18,34,0.65)' : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${i === 0 ? 'rgba(243,198,95,0.5)' : colors.cardBorder}`,
                    backdropFilter: 'blur(16px)',
                    borderRadius: '18px', padding: '28px',
                    position: 'relative', overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: i === 0
                      ? (isDark ? '0 0 40px rgba(243,198,95,0.15)' : '0 15px 40px rgba(217, 119, 6, 0.25)')
                      : (isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(217, 119, 6, 0.15)')
                  }}>
                    {/* Top badge for #1 */}
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'rgba(243,198,95,0.12)', border: '1px solid rgba(243,198,95,0.3)',
                        color: '#f3c65f', fontSize: '9px', fontWeight: '800',
                        padding: '3px 8px', borderRadius: '4px', letterSpacing: '1px'
                      }}>⭐ TOP REVIEW</div>
                    )}
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{
                          fontSize: '16px',
                          color: s <= (rv.rating || 5) ? '#f3c65f' : 'rgba(243,198,95,0.2)',
                          textShadow: s <= (rv.rating || 5) ? '0 0 8px rgba(243,198,95,0.4)' : 'none'
                        }}>★</span>
                      ))}
                    </div>
                    {/* Quote mark */}
                    <div style={{ fontSize: '26px', color: 'rgba(243,198,95,0.18)', lineHeight: 1, marginBottom: '4px', fontFamily: 'Georgia, serif' }}>&quot;</div>
                    {/* Comment - truncate at 120 chars */}
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: colors.textMain, margin: '0 0 22px 0', fontStyle: 'italic', opacity: 0.88 }}>
                      {rv.comment.length > 120 ? rv.comment.slice(0, 120) + '…' : rv.comment}
                    </p>
                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: `1px solid ${colors.cardBorder}`, paddingTop: '16px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colorPair})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: '900', fontSize: '13px', flexShrink: 0
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: colors.textMain }}>{rv.name}</div>
                        <div style={{ fontSize: '9px', color: '#10b981', fontWeight: '700', marginTop: '2px', letterSpacing: '0.5px' }}>✓ VERIFIED BUYER</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                type="button"
                onClick={onNavToReviews}
                style={{
                  background: 'transparent', border: '1px solid rgba(243,198,95,0.3)',
                  color: '#f3c65f', padding: '12px 30px', borderRadius: '8px',
                  fontWeight: '800', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                READ ALL REVIEWS & LEAVE YOURS ➔
              </button>
            </div>
          </div>
        </section>
      )}


      {/*  FOOTER */}
      <footer style={{ 
        ...styles.footerArea, 
        background: colors.footerBg,
        borderTopColor: colors.border,
        padding: isMobile ? '40px 20px 20px 20px' : '60px 60px 30px 60px' 
      }}>
        <div style={{ ...styles.footerMain, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '35px' : '50px' }}>
          <div style={{flex: '2'}}>
            <h3 style={{color: '#f3c65f', margin: '0 0 10px 0', fontWeight: '900', fontSize: '20px'}}>CS Bat Labs</h3>
            <p style={{color: colors.textMuted, fontSize: '13px', maxWidth: '340px', lineHeight: '1.6'}}>
              Precision Engineered Biomechanical Telemetry Systems for international professional athletic profiles. Breaking processing baselines.
            </p>
          </div>
          <div style={{ ...styles.footerLinksGrid, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '30px' : '60px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            <div style={styles.footerCol}>
              <span style={styles.footerColTitle}>CORE PROTOCOLS</span>
              <a 
                href="#shop" 
                style={{ ...styles.footerLink, color: colors.textMuted }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavToShop) onNavToShop();
                }}
              >
                Cleft Inventory
              </a>

             
              <a 
                href="#custom" 
                style={{ ...styles.footerLink, color: colors.textMuted }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavToCustomizer) onNavToCustomizer();
                }}
              >
                Engine Customizer
              </a>

              <a href="#bmi" style={{ ...styles.footerLink, color: colors.textMuted }}>Hardware BMI</a>
            </div>
            <div style={styles.footerCol}>
              <span style={styles.footerColTitle}>UPLINK NETWORK</span>
              <a href="#insta" style={{ ...styles.footerLink, color: colors.textMuted }}>Instagram Channel</a>
              <a href="#contact" style={{ ...styles.footerLink, color: colors.textMuted }}>Technical Support</a>
            </div>
            <div style={styles.footerCol}>
              <span style={styles.footerColTitle}>RADAR DROP ALERT</span>
              <input type="email" placeholder="Secure Email Uplink" style={{ ...styles.footerInput, color: colors.textMain }} />
            </div>
          </div>
        </div>
        <div style={{ ...styles.footerBottomLine, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0', textAlign: isMobile ? 'center' : 'left' }}>
          <span>© 2026 CS BAT LABS LTD CRYPTO-ENCRYPTED CENTRAL HUB</span>
          <span style={{color: '#334155'}}>SECURE STATION TERMINAL RESPONSIVE</span>
        </div>
      </footer>

    </div>
  );
}


const styles = {
  pageContainer: { 
    background: '#06080c', 
    color: '#ffffff', 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  cyberGridOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'linear-gradient(rgba(243, 198, 95, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 198, 95, 0.015) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 1
  },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    background: 'rgba(6, 9, 13, 0.95)',
    borderBottom: '1px solid rgba(243, 198, 95, 0.15)',
    backdropFilter: 'blur(12px)',
    position: 'sticky', 
    top: 0, 
    zIndex: 100 
  },
  navLogo: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px' 
  },
  logoRing: {
    background: 'rgba(243, 198, 95, 0.05)',
    border: '1px solid rgba(243, 198, 95, 0.3)',
    padding: '5px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoImg: { 
    width: '30px', 
    height: '30px', 
    objectFit: 'contain' 
  },
  navLogoText: {
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '0.5px'
  },
  portalTag: {
    fontSize: '9px', 
    color: '#f3c65f', 
    background: 'rgba(243,198,95,0.12)', 
    border: '1px solid rgba(243,198,95,0.25)',
    padding: '1px 6px', 
    borderRadius: '3px', 
    fontWeight: 'bold',
    marginLeft: '6px'
  },
  navLinks: { 
    display: 'flex', 
    gap: '30px' 
  },
  navLink: { 
    color: '#64748b', 
    textDecoration: 'none', 
    fontSize: '11px', 
    fontWeight: '700',
    letterSpacing: '1px'
  },
  navActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '25px' 
  },
  navIcon: { 
    color: '#f3c65f', 
    cursor: 'pointer',
    fontSize: '16px'
  },
  btnLoginNav: { 
    background: 'rgba(243, 198, 95, 0.08)', 
    border: '1px solid rgba(243, 198, 95, 0.3)', 
    color: '#f3c65f', 
    fontSize: '11px', 
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '800', 
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  heroSection: { 
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    display: 'flex', 
    alignItems: 'center', 
    minHeight: '70vh',
    zIndex: 5
  },
  heroContent: { 
    maxWidth: '680px' 
  },
  cyberBadge: {
    fontSize: '9px',
    color: '#f3c65f',
    fontWeight: 'bold',
    letterSpacing: '2px',
    background: 'rgba(243,198,95,0.08)',
    padding: '5px 12px',
    borderRadius: '4px',
    borderLeft: '3px solid #f3c65f',
    display: 'inline-block',
    marginBottom: '20px'
  },
  heroTitle: { 
    fontWeight: '900', 
    margin: '0 0 20px 0', 
    lineHeight: '1.1',
    letterSpacing: '-1.5px'
  },
  neonTextGold: {
    color: '#f3c65f',
    textShadow: '0 0 30px rgba(243, 198, 95, 0.35)'
  },
  heroSubtitle: { 
    color: '#94a3b8', 
    fontSize: '15px', 
    lineHeight: '1.65', 
    marginBottom: '35px' 
  },
  heroButtons: { 
    display: 'flex' 
  },
  btnGold: { 
    background: '#f3c65f', 
    color: '#06080c', 
    border: 'none', 
    padding: '15px 32px', 
    borderRadius: '6px', 
    fontWeight: '900', 
    fontSize: '12px', 
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(243, 198, 95, 0.3)',
    transition: 'all 0.3s'
  },
  btnOutline: { 
    background: 'transparent', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#fff', 
    padding: '15px 32px', 
    borderRadius: '6px', 
    fontWeight: '700', 
    fontSize: '12px', 
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  statsContainer: { 
    display: 'flex',
    maxWidth: '1200px',
    background: 'rgba(10, 13, 18, 0.75)',
    border: '1px solid rgba(243, 198, 95, 0.25)',
    backdropFilter: 'blur(16px)',
    borderRadius: '12px',
    padding: '30px 20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    justifyContent: 'space-around',
    zIndex: 10,
    position: 'relative',
    boxSizing: 'border-box'
  },
  statBox: { 
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#f3c65f',
    display: 'block',
    marginBottom: '5px',
    textShadow: '0 0 10px rgba(243, 198, 95, 0.2)'
  },
  statLabel: { 
    fontSize: '10px', 
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: '1px'
  },
  sectionArea: { 
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    zIndex: 5
  },
  sectionMetaCode: {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: '#475569',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '5px'
  },
  sectionTitle: { 
    fontSize: '32px', 
    fontWeight: '900',
    color: '#fff', 
    margin: 0,
    letterSpacing: '-0.5px'
  },
  armoryGrid: { 
    display: 'flex', 
    gap: '25px',
    marginTop: '30px'
  },
  armoryCard: { 
    flex: 1, 
    height: '320px', 
    borderRadius: '14px', 
    background: 'rgba(15, 18, 24, 0.45)', 
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    position: 'relative', 
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
  },
  cardOverlay: { 
    padding: '30px', 
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    background: 'linear-gradient(transparent 30%, rgba(6,8,12,0.95) 100%)' 
  },
  cardTag: {
    color: '#f3c65f',
    fontFamily: 'monospace',
    fontSize: '10px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'block'
  },
  cardTitle: { 
    fontSize: '20px', 
    fontWeight: '800',
    margin: '0 0 10px 0',
    color: '#fff'
  },
  cardDesc: { 
    color: '#64748b', 
    fontSize: '13px', 
    lineHeight: '1.5',
    margin: '0 0 20px 0' 
  },
  cardLink: { 
    color: '#f3c65f', 
    textDecoration: 'none', 
    fontSize: '11px', 
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  cardImage: {
    width: '100%',
    height: '200px', 
    objectFit: 'cover', 
    borderRadius: '10px 10px 0 0', 
  },
  armoryCard: {
    
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  bmiSection: { 
    background: 'rgba(10, 13, 18, 0.4)', 
    borderTop: '1px solid rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    margin: '40px 0',
    zIndex: 5
  },
  bmiContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    maxWidth: '1200px', 
    margin: '0 auto' 
  },
  bmiMetricsBox: { 
    flex: 1, 
    background: 'rgba(5, 6, 8, 0.75)', 
    border: '1px solid rgba(243, 198, 95, 0.15)',
    padding: '35px', 
    borderRadius: '12px',
    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
  },
  bmiRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    fontSize: '14px', 
    color: '#cbd5e1',
    paddingBottom: '16px', 
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    marginBottom: '16px' 
  },
  bmiProgressBg: { 
    background: 'rgba(255,255,255,0.04)', 
    height: '6px', 
    borderRadius: '3px', 
    marginTop: '30px', 
    overflow: 'hidden' 
  },
  bmiProgressFill: { 
    background: '#f3c65f', 
    width: '75%', 
    height: '100%',
    boxShadow: '0 0 10px #f3c65f'
  },
  bmiInfoBox: { 
    flex: 1.2 
  },
  bmiTitle: { 
    fontWeight: '900',
    margin: '10px 0 20px 0', 
    lineHeight: '1.2',
    letterSpacing: '-1px'
  },
  bmiDesc: { 
    color: '#64748b', 
    fontSize: '14px', 
    lineHeight: '1.65', 
    marginBottom: '25px' 
  },
  bmiList: { 
    margin: '0 0 30px 0', 
    color: '#cbd5e1', 
    fontFamily: 'monospace',
    fontSize: '12px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  btnGoldSmall: { 
    background: '#f3c65f', 
    color: '#06080c', 
    border: 'none', 
    padding: '14px 24px', 
    borderRadius: '6px', 
    fontWeight: '900', 
    fontSize: '11px', 
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(243, 198, 95, 0.25)',
    transition: 'all 0.3s'
  },
  featuresGrid: { 
    display: 'flex', 
    gap: '30px', 
    marginTop: '20px' 
  },
  featureItem: { 
    flex: 1, 
    background: 'rgba(15, 18, 24, 0.35)', 
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '35px', 
    borderRadius: '12px'
  },
  featureIcon: { 
    fontSize: '26px', 
    marginBottom: '20px' 
  },
  featureTitle: { 
    fontSize: '18px', 
    fontWeight: '800',
    margin: '0 0 12px 0',
    color: '#fff'
  },
  featureText: { 
    color: '#64748b', 
    fontSize: '13px', 
    lineHeight: '1.6', 
    margin: 0 
  },
  testimonialsGrid: {
    display: 'flex',
    gap: '25px',
    marginTop: '20px'
  },
  testiCard: {
    flex: 1,
    background: 'rgba(10, 13, 18, 0.55)',
    border: '1px solid rgba(243, 198, 95, 0.25)',
    backdropFilter: 'blur(12px)',
    padding: '35px',
    borderRadius: '14px',
    boxShadow: '0 15px 30px rgba(0,0,0,0.4)'
  },
  testiQuote: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    fontStyle: 'italic',
    margin: '0 0 25px 0'
  },
  testiAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  testiAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '1px solid #f3c65f'
  },
  authorName: {
    margin: '0 0 2px 0',
    fontSize: '14px',
    fontWeight: '800',
    color: '#fff'
  },
  authorTitle: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: '600'
  },
  footerArea: { 
    background: '#040507', 
    borderTop: '1px solid rgba(243, 198, 95, 0.15)', 
    marginTop: 'auto',
    zIndex: 5
  },
  footerMain: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  footerLinksGrid: { 
    flex: '3', 
    display: 'flex', 
    justifyContent: 'flex-end' 
  },
  footerCol: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    minWidth: '160px' 
  },
  footerColTitle: { 
    fontSize: '10px', 
    color: '#475569', 
    fontWeight: '800', 
    marginBottom: '8px',
    letterSpacing: '1px'
  },
  footerLink: { 
    color: '#64748b', 
    textDecoration: 'none', 
    fontSize: '12px',
    fontWeight: '600',
    transition: 'color 0.2s'
  },
  footerInput: { 
    background: '#06080c', 
    border: '1px solid rgba(243, 198, 95, 0.2)', 
    padding: '12px 15px', 
    borderRadius: '6px', 
    color: '#fff', 
    fontSize: '12px', 
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  footerBottomLine: {
    maxWidth: '1200px',
    margin: '40px auto 0 auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#334155',
    fontFamily: 'monospace',
    fontSize: '11px'
  }
};

export default LandingPage;