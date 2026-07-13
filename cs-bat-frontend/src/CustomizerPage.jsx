import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

// ═══════════════════════════════════════════════════════════════
// CustomizerPage — 2D Layered Visualizer + Configuration Panel
// ═══════════════════════════════════════════════════════════════
function CustomizerPage({ onNavToHome, onNavToShop, onNavToLogin, onNavToDashboard, onNavigateToCheckout, onNavToCart, onNavToReviews, theme, toggleTheme, currentPage }) {
  const [isMobile, setIsMobile] = useState(false);

  // Customizer States
  const [height, setHeight] = useState('184');
  const [weight, setWeight] = useState('82');
  const [playStyle, setPlayStyle] = useState('Aggressive');
  const [batWeight, setBatWeight] = useState('600');
  const [edgeThickness, setEdgeThickness] = useState('40mm');
  const [handleGeometry, setHandleGeometry] = useState('Round');
  const [stickerVariant, setStickerVariant] = useState('Classic');
  const [gripColor, setGripColor] = useState('#ffd700');

  const [isSwinging, setIsSwinging] = useState(false);
  const [view, setView] = useState('front'); // 'front' or 'back'

  const colors = {
    bg: theme === 'dark' ? '#0a0d14' : '#eef2f6',
    textMain: theme === 'dark' ? '#ffffff' : '#0f172a',
    sidebarBg: theme === 'dark' ? '#111622' : '#ffffff',
    cardBg: theme === 'dark' ? '#111622' : '#ffffff',
    border: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(217, 119, 6, 0.4)',
    borderLight: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(217, 119, 6, 0.3)',
    textMuted: '#64748b',
    accent: '#f3c65f'
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 950);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-reset swing after animation
  useEffect(() => {
    if (isSwinging) {
      const timer = setTimeout(() => setIsSwinging(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isSwinging]);

  const [aiSpec, setAiSpec] = useState(null);

  const calculateBatSpecs = () => {
    const heightNum = parseFloat(height) || 0;
    const weightNum = parseFloat(weight) || 0;
    if (heightNum <= 0 || weightNum <= 0) return;

    let recSize = 'Short Handle (33.5")';
    if (heightNum < 120) recSize = 'Size 1 (25.25")';
    else if (heightNum < 169) recSize = 'Harrow (32.75")';
    else if (heightNum < 184) recSize = 'Short Handle (33.5")';
    else recSize = 'Long Handle (34.5")';

    let recWeight = '600';
    if (weightNum < 50) recWeight = '550';
    else if (weightNum < 75) recWeight = '600';
    else if (weightNum < 90) recWeight = '650';
    else recWeight = '700';

    const normalizedStyle = playStyle === 'Aggressive' ? 'Power-Hitter' : playStyle === 'Defensive' ? 'Defensive' : 'Balanced';
    if (normalizedStyle === 'Power-Hitter') recWeight = String(Math.min(parseInt(recWeight) + 50, 700));
    else if (normalizedStyle === 'Defensive') recWeight = String(Math.max(parseInt(recWeight) - 50, 550));

    let recEdge = normalizedStyle === 'Defensive' ? '38mm' : normalizedStyle === 'Power-Hitter' ? '42mm' : '40mm';
    let sweetSpot = normalizedStyle === 'Defensive' ? 'High Sweet Spot' : normalizedStyle === 'Power-Hitter' ? 'Low Sweet Spot' : 'Mid Sweet Spot';
    let cleftGrade = normalizedStyle === 'Power-Hitter' ? 'PRO-ENG G1+' : 'PRO-ENG G1';

    setAiSpec({ recSize, recWeight, recEdge, sweetSpot, cleftGrade });
    setBatWeight(recWeight);
    setEdgeThickness(recEdge);
  };

  // Sticker color mappings
  const stickerColors = {
    Classic: { main: '#f3c65f', text: '#1a1005' },
    Royal: { main: '#3b82f6', text: '#060d2a' },
    Flame: { main: '#ef4444', text: '#1a0400' },
    Shadow: { main: '#e2e8f0', text: '#0a0a0a' },
  };
  const currentSticker = stickerColors[stickerVariant] || stickerColors.Classic;

  return (
    <div style={{
      ...styles.pageContainer,
      background: colors.bg,
      color: colors.textMain,
      height: isMobile ? 'auto' : '100vh',
      overflow: isMobile ? 'visible' : 'hidden'
    }}>
      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes batSwing {
          0% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-8deg) scale(1.02); }
          40% { transform: rotate(25deg) scale(1.04); }
          60% { transform: rotate(-4deg) scale(1.01); }
          80% { transform: rotate(2deg) scale(1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes floatIdle {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 15px rgba(243,198,95,0.15); }
          50% { box-shadow: 0 0 30px rgba(243,198,95,0.3); }
          100% { box-shadow: 0 0 15px rgba(243,198,95,0.15); }
        }
      `}</style>

      <div style={{ ...styles.cyberGridOverlay, backgroundImage: `linear-gradient(${theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.04)'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.04)'} 1px, transparent 1px)` }}></div>

      <Navbar
        onNavToHome={onNavToHome}
        onNavToShop={onNavToShop}
        onNavToCustomizer={() => { }}
        onNavToLogin={onNavToLogin}
        onNavToDashboard={onNavToDashboard}
        onNavToCart={onNavToCart}
        onNavToReviews={onNavToReviews}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
      />

      <div style={{
        ...styles.mainSplitWrapper,
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'auto' : 'calc(100vh - 72px)',
        overflow: isMobile ? 'visible' : 'hidden'
      }}>

        {/* ════════════════════════════════════════════════════════ */}
        {/* LEFT PANEL: 2D LAYERED VISUALIZER                      */}
        {/* ════════════════════════════════════════════════════════ */}
        <div style={{
          ...styles.visualizerCanvas,
          background: theme === 'dark'
            ? 'radial-gradient(circle at center, #1a202c 0%, #0d1017 100%)'
            : 'radial-gradient(circle at center, #ffffff 0%, #eef2f6 100%)',
          borderRight: isMobile ? 'none' : '1px solid ' + colors.border,
          borderBottom: isMobile ? '1px solid ' + colors.border : 'none',
          width: isMobile ? '100%' : '50%',
          height: isMobile ? '520px' : '100%',
          padding: 0,
        }}>

          {/* ── Header Info Badges ── */}
          <div style={{
            ...styles.canvasHeader,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '15px 20px',
            zIndex: 5,
          }}>
            <span style={{
              ...styles.techDataNode,
              background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              color: colors.textMuted,
              backdropFilter: 'blur(8px)',
            }}>🏏 VANGUARD PRO</span>
            <span style={{
              ...styles.techDataNode,
              background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              color: colors.textMuted,
              backdropFilter: 'blur(8px)',
            }}>{batWeight}g / {edgeThickness} / {handleGeometry}</span>
          </div>

          {/* ── View Toggle (FRONT / BACK) ── */}
          <div style={{
            position: 'absolute',
            top: '55px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            background: theme === 'dark' ? 'rgba(10,13,20,0.7)' : 'rgba(238,242,246,0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid ' + colors.borderLight,
            zIndex: 15,
          }}>
            {['front', 'back'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  background: view === v
                    ? 'linear-gradient(135deg, #f3c65f, #d4a843)'
                    : 'transparent',
                  color: view === v ? '#06080c' : colors.textMuted,
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  textTransform: 'uppercase',
                }}
              >
                {v === 'front' ? '🏏 FRONT' : '🔄 BACK'}
              </button>
            ))}
          </div>

          {/* ── 2D Bat Layered Stack ── */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '220px' : '260px',
            height: isMobile ? '420px' : '480px',
            animation: isSwinging
              ? 'batSwing 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
              : 'floatIdle 3s ease-in-out infinite',
            transformOrigin: '50% 85%',
            zIndex: 3,
          }}>

            {/* Layer 1: Base Bat Image */}
            <img
              src={view === 'front' ? '/image/front.png' : '/image/back.png'}
              alt={`Cricket bat ${view} view`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                filter: theme === 'dark'
                  ? 'drop-shadow(0 8px 25px rgba(0,0,0,0.6))'
                  : 'drop-shadow(0 8px 25px rgba(0,0,0,0.15))',
                transition: 'filter 0.3s ease',
              }}
            />

            {/* Layer 2: Grip Color Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '2%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '18%',
              height: '28%',
              background: gripColor,
              opacity: 0.55,
              borderRadius: '4px 4px 6px 6px',
              mixBlendMode: 'multiply',
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 3px,
                rgba(0,0,0,0.12) 3px,
                rgba(0,0,0,0.12) 5px
              )`,
              pointerEvents: 'none',
              transition: 'background 0.3s ease',
            }} />

            {/* Layer 3: Sticker Decal (Front View Only) */}
            {view === 'front' && (
              <div style={{
                position: 'absolute',
                top: '22%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '45%',
                height: '22%',
                background: `linear-gradient(160deg, ${currentSticker.text}, ${currentSticker.text}cc)`,
                border: `1.5px solid ${currentSticker.main}66`,
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                padding: '6px 4px',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                boxShadow: `0 2px 12px ${currentSticker.main}33`,
                overflow: 'hidden',
              }}>
                {/* Sticker top bar */}
                <div style={{ width: '70%', height: '2px', background: currentSticker.main, borderRadius: '2px' }} />
                {/* CS brand text */}
                <span style={{
                  color: currentSticker.main,
                  fontWeight: '900',
                  fontSize: isMobile ? '16px' : '20px',
                  lineHeight: 1,
                  textShadow: `0 0 8px ${currentSticker.main}44`,
                  letterSpacing: '2px',
                }}>CS</span>
                {/* Divider */}
                <div style={{ width: '50%', height: '1px', background: `${currentSticker.main}55` }} />
                {/* Sub text */}
                <span style={{
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '5.5px',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}>CRICKET BAT</span>
                {/* Edition text */}
                <span style={{
                  color: currentSticker.main,
                  fontWeight: '600',
                  fontSize: '4.5px',
                  letterSpacing: '0.5px',
                  opacity: 0.7,
                }}>{stickerVariant.toUpperCase()} EDITION</span>
                {/* Bottom bar */}
                <div style={{ width: '70%', height: '2px', background: currentSticker.main, borderRadius: '2px', marginTop: '1px' }} />
              </div>
            )}

            {/* Layer 4: Spec Annotation Badges */}
            <div style={{
              position: 'absolute',
              top: '8%',
              right: '-55px',
              ...styles.annotBox,
              background: theme === 'dark' ? 'rgba(13,16,23,0.85)' : 'rgba(238,242,246,0.85)',
            }}>
              EDGE: {edgeThickness}
            </div>
            <div style={{
              position: 'absolute',
              top: '55%',
              right: '-45px',
              ...styles.annotBox,
              background: theme === 'dark' ? 'rgba(13,16,23,0.85)' : 'rgba(238,242,246,0.85)',
            }}>
              WT: {batWeight}g
            </div>
            <div style={{
              position: 'absolute',
              bottom: '5%',
              left: '-55px',
              ...styles.annotBox,
              background: theme === 'dark' ? 'rgba(13,16,23,0.85)' : 'rgba(238,242,246,0.85)',
            }}>
              HDL: {handleGeometry.toUpperCase()}
            </div>
          </div>

          {/* ── Ambient glow effect ── */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${currentSticker.main}15 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1,
            animation: 'pulseGlow 3s ease-in-out infinite',
          }} />

          {/* ── TEST SWING button ── */}
          <button
            onClick={() => setIsSwinging(true)}
            disabled={isSwinging}
            style={{
              position: 'absolute',
              bottom: isMobile ? 15 : 30,
              left: '50%',
              transform: 'translateX(-50%)',
              background: isSwinging
                ? 'linear-gradient(135deg, #b8860b, #8b6914)'
                : 'linear-gradient(135deg, #f3c65f, #d4a843)',
              color: '#06080c',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontWeight: '900',
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: isSwinging ? 'not-allowed' : 'pointer',
              boxShadow: isSwinging
                ? 'none'
                : '0 4px 20px rgba(243,198,95,0.4)',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
          >
            {isSwinging ? '🏏 SWINGING...' : '⚡ TEST SWING'}
          </button>
        </div>


        {/* ════════════════════════════════════════════════════════ */}
        {/* RIGHT PANEL: CONFIGURATION                              */}
        {/* ════════════════════════════════════════════════════════ */}
        <div style={{
          ...styles.configMatrixPanel,
          background: colors.bg,
          width: isMobile ? '100%' : '50%',
          height: isMobile ? 'auto' : '100%',
          overflowY: isMobile ? 'visible' : 'auto'
        }}>
          <div style={{ padding: isMobile ? '20px' : '40px 40px 0 40px' }}>

            <section style={{ ...styles.cyberControlBox, background: colors.cardBg, borderColor: colors.border }}>
              <h3 style={styles.sectionPanelTitle}>🤖 AI PERFORMANCE OPTIMIZER</h3>
              <div style={styles.gridThreeCol}>
                <div style={styles.inputBlock}>
                  <label style={styles.fieldLabel}>Height (cm)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={{ ...styles.darkInput, background: colors.bg, color: colors.textMain, borderColor: colors.borderLight }} />
                </div>
                <div style={styles.inputBlock}>
                  <label style={styles.fieldLabel}>Weight (kg)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ ...styles.darkInput, background: colors.bg, color: colors.textMain, borderColor: colors.borderLight }} />
                </div>
                <div style={styles.inputBlock}>
                  <label style={styles.fieldLabel}>Play Style</label>
                  <select value={playStyle} onChange={(e) => setPlayStyle(e.target.value)} style={{ ...styles.darkSelect, background: colors.bg, color: colors.textMain, borderColor: colors.borderLight }}>
                    <option>Aggressive</option>
                    <option>Balanced</option>
                    <option>Defensive</option>
                  </select>
                </div>
              </div>
              <button onClick={calculateBatSpecs} style={styles.btnGoldAction}>⚡ CALCULATE & SUGGEST SPEC</button>

              <div style={{ ...styles.suggestionAlertBox, background: theme === 'dark' ? 'rgba(243,198,95,0.02)' : 'rgba(243,198,95,0.05)', borderColor: 'rgba(243,198,95,0.25)' }}>
                {aiSpec ? (
                  <>
                    <span style={{ fontSize: '11px', color: colors.textMuted }}>RECOMMENDED CORE: <b style={{ color: '#f3c65f' }}>{aiSpec.cleftGrade}</b></span>
                    <div style={{ ...styles.miniSpecsRow, color: colors.textMain }}>
                      <span>📏 {aiSpec.recSize}</span>
                    </div>
                    <div style={{ ...styles.miniSpecsRow, color: colors.textMain, marginTop: '4px' }}>
                      <span>⚖️ Weight: {aiSpec.recWeight}g</span>
                      <span>📐 Edge: {aiSpec.recEdge}</span>
                    </div>
                    <div style={{ ...styles.miniSpecsRow, color: colors.accent, marginTop: '4px' }}>
                      <span>🎯 {aiSpec.sweetSpot}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '11px', color: colors.textMuted }}>Enter your dimensions and click CALCULATE to get AI recommendations</span>
                    <div style={{ ...styles.miniSpecsRow, color: colors.textMuted }}>
                      <span>Cleft: —</span>
                      <span>Weight: —</span>
                      <span>Height: —</span>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section style={{ ...styles.cyberControlBox, background: colors.cardBg, borderColor: colors.border }}>
              <h3 style={styles.sectionPanelTitle}>📐 PHYSICAL CONFIGURATION</h3>
              <div style={styles.configGroup}>
                <label style={styles.fieldLabel}>Bat Weight (g)</label>
                <div style={styles.chipOptionRow}>
                  {['550', '600', '650', '700'].map((w) => (
                    <button
                      key={w}
                      onClick={() => setBatWeight(w)}
                      style={{ ...styles.configChip, background: batWeight === w ? '#f3c65f' : colors.bg, borderColor: batWeight === w ? '#f3c65f' : colors.borderLight, color: batWeight === w ? '#06080c' : colors.textMain }}
                    >
                      {w}g
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.configGroup}>
                <label style={styles.fieldLabel}>Edge Thickness (mm)</label>
                <div style={styles.chipOptionRow}>
                  {['38mm', '40mm', '42mm', '44mm'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setEdgeThickness(t)}
                      style={{ ...styles.configChip, background: edgeThickness === t ? '#f3c65f' : colors.bg, borderColor: edgeThickness === t ? '#f3c65f' : colors.borderLight, color: edgeThickness === t ? '#06080c' : colors.textMain }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.configGroup}>
                <label style={styles.fieldLabel}>Handle Geometry</label>
                <div style={styles.chipOptionRow}>
                  {['Round', 'Oval'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setHandleGeometry(g)}
                      style={{ ...styles.configChip, flex: 1, background: handleGeometry === g ? '#f3c65f' : colors.bg, borderColor: handleGeometry === g ? '#f3c65f' : colors.borderLight, color: handleGeometry === g ? '#06080c' : colors.textMain }}
                    >
                      {g} {g === 'Round' ? '⭕' : '⬭'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ ...styles.cyberControlBox, background: colors.cardBg, borderColor: colors.border }}>
              <h3 style={styles.sectionPanelTitle}>🎨 AESTHETICS & BRANDING</h3>
              <div style={styles.configGroup}>
                <label style={styles.fieldLabel}>Laser Decal / Sticker Blueprint</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { id: 'Classic', label: 'Classic Gold', mc: '#f3c65f', bg: 'linear-gradient(160deg, #1a1005, #0a0802)', emoji: '⭐' },
                    { id: 'Royal',   label: 'Royal Blue',  mc: '#3b82f6', bg: 'linear-gradient(160deg, #060d2a, #030610)', emoji: '👑' },
                    { id: 'Flame',   label: 'Flame Red',   mc: '#ef4444', bg: 'linear-gradient(160deg, #1a0400, #0a0200)', emoji: '🔥' },
                    { id: 'Shadow',  label: 'Shadow Black',mc: '#e2e8f0', bg: 'linear-gradient(160deg, #0a0a0a, #060606)', emoji: '🌑' },
                  ].map(({ id, label, mc, bg, emoji }) => (
                    <div
                      key={id}
                      onClick={() => setStickerVariant(id)}
                      style={{
                        ...styles.stickerCard,
                        background: colors.bg,
                        border: stickerVariant === id ? `2px solid ${mc}` : '1px solid ' + colors.borderLight,
                        boxShadow: stickerVariant === id ? `0 0 12px ${mc}44` : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        ...styles.stickerCardMockImage,
                        background: bg,
                        border: `2px solid ${mc}44`,
                        flexDirection: 'column',
                        gap: '3px',
                        padding: '6px 4px',
                        height: '70px',
                      }}>
                        <div style={{ width: '78%', height: '3px', background: mc, borderRadius: '2px' }} />
                        <span style={{ fontSize: '9px', lineHeight: 1 }}>{emoji}</span>
                        <span style={{ color: mc, fontWeight: '900', fontSize: '20px', lineHeight: 1 }}>CS</span>
                        <div style={{ width: '55%', height: '1px', background: mc + '66' }} />
                        <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '6.5px', letterSpacing: '0.3px' }}>CRICKET BAT</span>
                        <div style={{ width: '78%', height: '3px', background: mc, borderRadius: '2px', marginTop: '1px' }} />
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: '700',
                        color: stickerVariant === id ? mc : '#94a3b8',
                        letterSpacing: '0.4px', textAlign: 'center'
                      }}>
                        {stickerVariant === id ? '✓ ' : ''}{label.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.configGroup}>
                <label style={styles.fieldLabel}>High-Traction Grip Color</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
                  {['#ffd700', '#111622', '#ffffff', '#2563eb', '#dc2626'].map((color) => (
                    <div
                      key={color}
                      onClick={() => setGripColor(color)}
                      style={{
                        ...styles.colorCircle,
                        background: color,
                        border: gripColor === color ? '2px solid #f3c65f' : '2px solid transparent',
                        transform: gripColor === color ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: gripColor === color ? '0 0 12px rgba(243,198,95,0.3)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>

            <div style={{ ...styles.checkoutSummaryCard, background: theme === 'dark' ? '#161d2d' : '#ffffff', borderColor: colors.border, boxShadow: theme === 'light' ? '0 4px 15px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={styles.priceRow}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>TOTAL REQUISITION VAL</span>
                  <span style={{ ...styles.finalPriceText, color: colors.textMain }}>Rs.14,800.00</span>
                </div>

                <button
                  onClick={onNavigateToCheckout}
                  style={styles.btnSubmitOrder}
                >
                  SUBMIT CORE ORDER ➔
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


const styles = {
  pageContainer: {
    background: '#0a0d14', color: '#ffffff', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box'
  },
  cyberGridOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.003) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.003) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 1
  },
  mainSplitWrapper: { display: 'flex', width: '100%', height: 'calc(100vh - 72px)', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' },
  visualizerCanvas: {
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', position: 'relative', overflow: 'hidden'
  },
  canvasHeader: { display: 'flex', justifyContent: 'space-between', width: '100%' },
  techDataNode: { fontFamily: 'monospace', fontSize: '11px', color: '#64748b', padding: '4px 8px', borderRadius: '4px' },
  configMatrixPanel: { height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  cyberControlBox: { background: '#111622', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '8px', padding: '25px', marginBottom: '25px' },
  sectionPanelTitle: { margin: '0 0 20px 0', fontSize: '13px', fontWeight: '800', color: '#f3c65f', letterSpacing: '0.5px' },
  gridThreeCol: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' },
  gridTwoCol: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  inputBlock: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' },
  darkInput: { background: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none' },
  darkSelect: { background: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' },
  btnGoldAction: { background: '#f3c65f', color: '#06080c', border: 'none', width: '100%', padding: '12px', borderRadius: '4px', fontWeight: '800', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.5px' },
  suggestionAlertBox: { background: 'rgba(243,198,95,0.02)', border: '1px dashed rgba(243,198,95,0.15)', padding: '15px', borderRadius: '6px', marginTop: '15px' },
  miniSpecsRow: { display: 'flex', gap: '15px', marginTop: '8px', fontSize: '12px', color: '#cbd5e1', fontWeight: '600' },
  configGroup: { marginBottom: '20px' },
  chipOptionRow: { display: 'flex', gap: '10px', marginTop: '8px' },
  configChip: { background: '#0a0d14', border: '1px solid', borderRadius: '4px', padding: '10px 20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  stickerCard: { background: '#0a0d14', padding: '15px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' },
  stickerCardMockImage: { background: 'rgba(255,255,255,0.02)', height: '60px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' },
  colorCircle: { width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', transition: 'transform 0.15s' },
  checkoutSummaryCard: { background: '#161d2d', border: '1px solid rgba(243,198,95,0.2)', padding: '25px', borderRadius: '8px', marginBottom: '40px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  finalPriceText: { fontSize: '26px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' },
  btnSubmitOrder: { background: '#f3c65f', color: '#06080c', border: 'none', padding: '14px 28px', borderRadius: '4px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' },
  annotBox: { padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(243,198,95,0.3)', color: '#f3c65f', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', whiteSpace: 'nowrap', pointerEvents: 'none' }
};

export default CustomizerPage;