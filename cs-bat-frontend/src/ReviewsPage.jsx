import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

// ── Animated star rating display ──────────────────────────────────────────────
const StarDisplay = ({ rating, size = 18 }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{
        fontSize: size,
        color: i <= rating ? '#f3c65f' : 'rgba(243,198,95,0.2)',
        textShadow: i <= rating ? '0 0 8px rgba(243,198,95,0.5)' : 'none',
        transition: 'all 0.2s'
      }}>★</span>
    ))}
  </div>
);

// ── Average rating bar ─────────────────────────────────────────────────────────
const RatingBar = ({ label, count, total, isDark }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', width: '45px', flexShrink: 0 }}>{label} ★</span>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'linear-gradient(90deg, #f3c65f, #eab308)',
          borderRadius: '3px',
          boxShadow: pct > 0 ? '0 0 8px rgba(243,198,95,0.4)' : 'none',
          transition: 'width 1s ease'
        }} />
      </div>
      <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', width: '28px', textAlign: 'right' }}>{count}</span>
    </div>
  );
};

// ── Review Card ────────────────────────────────────────────────────────────────
const ReviewCard = ({ rv, index, colors, isDark }) => {
  const [isHovered, setIsHovered] = useState(false);
  const initials = rv.name ? rv.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const avatarColors = ['#f3c65f,#d97706', '#10b981,#059669', '#6366f1,#4f46e5', '#ec4899,#db2777', '#14b8a6,#0d9488'];
  const colorPair = avatarColors[rv.name.charCodeAt(0) % avatarColors.length];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? (isDark ? 'rgba(20, 28, 45, 0.85)' : 'rgba(255,255,255,1)')
          : colors.cardBg,
        border: `1px solid ${isHovered ? 'rgba(243,198,95,0.35)' : colors.cardBorder}`,
        backdropFilter: 'blur(16px)',
        borderRadius: '18px',
        padding: '26px',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered
          ? (isDark ? '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(243,198,95,0.1)' : '0 20px 50px rgba(15,23,42,0.12)')
          : 'none',
        animationDelay: `${index * 0.08}s`,
        animation: 'cardFadeIn 0.5s ease forwards',
        opacity: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Gold accent top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(243,198,95,0.6), transparent)',
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s'
      }} />

      {/* Rating & date row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <StarDisplay rating={rv.rating || 5} />
        <span style={{
          fontSize: '10px', color: colors.textMuted, fontFamily: 'monospace',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          padding: '3px 8px', borderRadius: '4px'
        }}>
          {new Date(rv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Quote icon */}
      <div style={{ fontSize: '28px', color: 'rgba(243,198,95,0.2)', lineHeight: 1, marginBottom: '6px', fontFamily: 'Georgia, serif' }}>"</div>

      {/* Comment */}
      <p style={{
        fontSize: '14px', lineHeight: '1.7', color: colors.textMain,
        margin: '0 0 20px 0', fontStyle: 'italic', opacity: 0.9
      }}>
        {rv.comment}
      </p>

      {/* Author */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        borderTop: `1px solid ${colors.cardBorder}`, paddingTop: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${colorPair})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '900', fontSize: '13px',
          boxShadow: `0 4px 12px rgba(243,198,95,0.2)`, flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: colors.textMain }}>{rv.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            <span style={{ fontSize: '9px', color: '#10b981', fontWeight: '700', letterSpacing: '0.5px' }}>✓ VERIFIED BUYER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
function ReviewsPage({
  onNavToHome, onNavToShop, onNavToCustomizer, onNavToLogin,
  onNavToDashboard, onNavToCart, onNavigateToCheckout, onNavToReviews,
  theme, toggleTheme, currentPage
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0); // 0 = All

  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isDark = theme === 'dark';
  const isLoggedIn = !!localStorage.getItem('userEmail');

  const colors = {
    bg: isDark ? '#060913' : '#f0f4fb',
    textMain: isDark ? '#ffffff' : '#0f172a',
    cardBg: isDark ? 'rgba(12, 18, 34, 0.65)' : 'rgba(255,255,255,0.85)',
    cardBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.35)',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    accent: '#f3c65f',
    inputBg: isDark ? 'rgba(5,8,18,0.6)' : '#eef2f6',
    inputBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.35)',
    formBg: isDark ? 'rgba(10, 15, 28, 0.8)' : 'rgba(255,255,255,0.95)',
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment, date: new Date().toISOString() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setName(''); setComment(''); setRating(5);
        setSubmitted(true);
        fetchReviews();
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculations
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rv => (rv.rating || 5) === r).length
  }));

  const filteredReviews = filter === 0 ? reviews : reviews.filter(r => (r.rating || 5) === filter);

  return (
    <div style={{ ...styles.pageContainer, background: colors.bg, color: colors.textMain }}>

      {/* ── CSS Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(243,198,95,0.2); }
          50%       { box-shadow: 0 0 35px rgba(243,198,95,0.45); }
        }
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.03); }
        }
        
        .rev-input {
          width: 100%;
          background: ${colors.inputBg};
          border: 1px solid ${colors.inputBorder};
          color: ${colors.textMain};
          padding: 13px 16px;
          border-radius: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .rev-input::placeholder { color: ${isDark ? '#334155' : '#94a3b8'}; }
        .rev-input:focus {
          border-color: rgba(243,198,95,0.6);
          box-shadow: 0 0 0 3px rgba(243,198,95,0.08);
        }
        .rev-submit {
          width: 100%;
          background: linear-gradient(135deg, #f3c65f 0%, #d97706 100%);
          color: #06080c;
          border: none;
          padding: 15px 28px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .rev-submit:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(243,198,95,0.45);
        }
        .rev-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        
        .filter-btn {
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.25s ease;
          font-family: 'Inter', system-ui, sans-serif;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          color: ${colors.textMuted};
          background: transparent;
        }
        .filter-btn:hover, .filter-btn.active {
          background: rgba(243,198,95,0.15);
          border-color: rgba(243,198,95,0.4);
          color: #f3c65f;
        }
      `}</style>

      {/* ── Background Decorations ── */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%', width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(243,198,95,0.06) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        animation: 'floatOrb 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', left: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        animation: 'floatOrb 10s ease-in-out infinite reverse'
      }} />
      <div style={styles.cyberGrid} />

      {/* ── Navbar ── */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <Navbar
          onNavToHome={onNavToHome} onNavToShop={onNavToShop}
          onNavToCustomizer={onNavToCustomizer} onNavToLogin={onNavToLogin}
          onNavToDashboard={onNavToDashboard} onNavToCart={onNavToCart}
          onNavToReviews={onNavToReviews}
          theme={theme} toggleTheme={toggleTheme} currentPage={currentPage}
        />
      </div>

      {/* ── Main ── */}
      <main style={{ position: 'relative', zIndex: 5, flex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '30px 18px 60px' : '55px 50px 80px', width: '100%', boxSizing: 'border-box' }}>

          {/* ── PAGE HEADER ── */}
          <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'heroSlideUp 0.6s ease forwards' }}>

            <h1 style={{
              fontSize: isMobile ? '34px' : '58px', fontWeight: '900',
              margin: '0 0 16px 0', letterSpacing: '-2px', lineHeight: 1.1,
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              What Players <span style={{ color: '#f3c65f', textShadow: '0 0 40px rgba(243,198,95,0.3)' }}>Say</span>
            </h1>
            <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Real feedback from elite cricketers who trusted CS Bat Labs to engineer their perfect weapon.
            </p>
          </div>

          {/* ── STATS BANNER ── */}
          {!loading && reviews.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '20px',
              background: colors.formBg, border: `1px solid ${colors.cardBorder}`,
              backdropFilter: 'blur(20px)', borderRadius: '20px',
              padding: isMobile ? '24px' : '30px 40px',
              marginBottom: '50px', justifyContent: 'center', alignItems: 'center',
              animation: 'heroSlideUp 0.7s 0.1s ease both'
            }}>
              {/* Big average */}
              <div style={{ textAlign: 'center', minWidth: '120px' }}>
                <div style={{ fontSize: isMobile ? '52px' : '64px', fontWeight: '900', color: '#f3c65f', lineHeight: 1, textShadow: '0 0 30px rgba(243,198,95,0.3)' }}>
                  {avgRating}
                </div>
                <StarDisplay rating={Math.round(Number(avgRating))} size={20} />
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '6px', fontWeight: '600' }}>
                  {reviews.length} Reviews
                </div>
              </div>

              {/* Divider */}
              {!isMobile && <div style={{ width: '1px', height: '100px', background: colors.cardBorder }} />}

              {/* Rating bars */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                {ratingCounts.map(rc => (
                  <RatingBar key={rc.star} label={String(rc.star)} count={rc.count} total={reviews.length} isDark={isDark} />
                ))}
              </div>
            </div>
          )}

          {/* ── TWO COLUMN LAYOUT ── */}
          <div style={{ display: 'flex', gap: '36px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>

            {/* ── LEFT: Submit Form ── */}
            <div style={{
              width: isMobile ? '100%' : '360px', flexShrink: 0,
              background: colors.formBg, border: `1px solid ${colors.cardBorder}`,
              backdropFilter: 'blur(24px)', borderRadius: '22px',
              padding: isMobile ? '24px' : '34px',
              position: isMobile ? 'static' : 'sticky', top: '92px',
              animation: 'heroSlideUp 0.6s 0.15s ease both',
              boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.4)' : '0 25px 60px rgba(15,23,42,0.08)'
            }}>
              {/* Form header */}
              <div style={{ marginBottom: '26px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'rgba(243,198,95,0.12)', border: '1px solid rgba(243,198,95,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', marginBottom: '14px'
                }}>✍️</div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Share Your Experience
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted, lineHeight: 1.6 }}>
                  Help other players by leaving an honest review of your CS Bat.
                </p>
              </div>

              {!isLoggedIn ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(243,198,95,0.08)', border: '1px solid rgba(243,198,95,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', margin: '0 auto 16px'
                  }}>🔒</div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800' }}>Login Required</h4>
                  <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px', lineHeight: 1.6 }}>
                    You must be logged in to leave a review.
                  </p>
                  <button onClick={onNavToLogin} className="rev-submit" style={{ width: 'auto', padding: '12px 28px' }}>
                    GO TO LOGIN
                  </button>
                </div>
              ) : submitted ? (
                <div style={{
                  textAlign: 'center', padding: '30px 10px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '14px'
                }}>
                  <div style={{ fontSize: '44px', marginBottom: '12px' }}>🎉</div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '18px', fontWeight: '800' }}>
                    Thank You!
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                    Your review has been submitted and will help other players make the right choice.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Star Rating Picker */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '800', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Your Rating
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          style={{
                            fontSize: '34px', cursor: 'pointer',
                            color: star <= (hoverRating || rating) ? '#f3c65f' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'),
                            textShadow: star <= (hoverRating || rating) ? '0 0 12px rgba(243,198,95,0.5)' : 'none',
                            transition: 'all 0.15s ease',
                            transform: star <= (hoverRating || rating) ? 'scale(1.18)' : 'scale(1)',
                            display: 'inline-block'
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >★</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '6px' }}>
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hoverRating || rating)]}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '800', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Your Name
                    </label>
                    <input
                      type="text" className="rev-input"
                      placeholder="e.g. Kumar Sangakkara"
                      value={name} onChange={e => setName(e.target.value)} required
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '800', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Your Review
                    </label>
                    <textarea
                      className="rev-input"
                      placeholder="Tell us about your experience with the bat..."
                      rows="5" value={comment}
                      onChange={e => setComment(e.target.value)}
                      required style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                  </div>

                  <button type="submit" className="rev-submit" disabled={isSubmitting}>
                    {isSubmitting ? '⏳  Submitting...' : '🚀  Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* ── RIGHT: Reviews List ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Filter row */}
              {!loading && reviews.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '700', marginRight: '4px' }}>FILTER:</span>
                  {[0, 5, 4, 3, 2, 1].map(f => (
                    <button
                      key={f} className={`filter-btn${filter === f ? ' active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f === 0 ? `All (${reviews.length})` : `${f} ★ (${reviews.filter(r => (r.rating || 5) === f).length})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Cards */}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    border: `3px solid ${colors.cardBorder}`, borderTop: `3px solid #f3c65f`,
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px'
                  }} />
                  <p style={{ color: colors.textMuted, fontSize: '14px' }}>Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '70px 40px',
                  background: colors.cardBg, border: `1px dashed ${colors.cardBorder}`,
                  borderRadius: '20px'
                }}>
                  <div style={{ fontSize: '50px', marginBottom: '16px', opacity: 0.5 }}>
                    {filter === 0 ? '💬' : '🔍'}
                  </div>
                  <h3 style={{ color: colors.textMain, margin: '0 0 8px 0' }}>
                    {filter === 0 ? 'No reviews yet' : `No ${filter}-star reviews`}
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>
                    {filter === 0 ? 'Be the first to share your experience!' : 'Try a different filter.'}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredReviews.map((rv, i) => (
                    <ReviewCard key={rv._id || i} rv={rv} index={i} colors={colors} isDark={isDark} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  },
  cyberGrid: {
    position: 'fixed', inset: 0,
    backgroundImage: 'linear-gradient(rgba(243,198,95,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(243,198,95,0.018) 1px, transparent 1px)',
    backgroundSize: '38px 38px', pointerEvents: 'none', zIndex: 1
  }
};

export default ReviewsPage;
