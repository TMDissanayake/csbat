import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo_new.png';

function Navbar({ onNavToHome, onNavToShop, onNavToCustomizer, onNavToLogin, onNavToDashboard, onNavToCart, onNavToReviews, theme, toggleTheme, currentPage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('userEmail');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 950;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileLinkClick = (navCallback) => {
    setMenuOpen(false);
    if (navCallback) navCallback();
  };

  const getMobileLinkStyle = (linkName, isActive) => {
    return {
      ...styles.navLink,
      color: isActive ? '#f3c65f' : colors.navLinkColor,
      padding: '14px 20px',
      borderRadius: '12px',
      backgroundColor: isActive 
        ? (isDark ? 'rgba(243, 198, 95, 0.08)' : 'rgba(243, 198, 95, 0.1)') 
        : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'),
      textAlign: 'center',
      border: isActive ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
      fontSize: '12px',
      fontWeight: '800',
      letterSpacing: '1.5px',
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
      display: 'block'
    };
  };

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('csbat_cart') || '[]');
        setCartCount(cart.length);
      } catch (e) {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener('cartUpdate', updateCartCount);
    return () => window.removeEventListener('cartUpdate', updateCartCount);
  }, []);

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? 'rgba(8, 10, 16, 0.82)' : 'rgba(255, 255, 255, 0.90)',
    textMain: isDark ? '#ffffff' : '#0f172a',
    border: isDark ? 'rgba(243, 198, 95, 0.18)' : 'rgba(15, 23, 42, 0.08)',
    navLinkColor: isDark ? '#94a3b8' : '#64748b',
    accent: '#f3c65f',
    btnBg: isDark ? 'rgba(243, 198, 95, 0.06)' : 'rgba(243, 198, 95, 0.1)'
  };

  const getLinkStyle = (linkName, isActive) => {
    const isHovered = hoveredItem === linkName;
    return {
      ...styles.navLink,
      color: isActive ? '#f3c65f' : isHovered ? (isDark ? '#ffffff' : '#0f172a') : colors.navLinkColor,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      backgroundColor: isHovered ? (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)') : 'transparent',
      borderRadius: '20px',
      padding: '8px 16px',
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)'
    };
  };

  return (
    <>
      <nav style={{
        ...styles.navbar,
        background: colors.bg,
        borderBottom: '1px solid ' + colors.border,
        padding: isMobile ? '0 20px' : '0 60px',
        boxShadow: isDark ? '0 10px 40px rgba(0, 0, 0, 0.6)' : '0 10px 40px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Brand logo section */}
        <div
          onClick={onNavToHome}
          style={{ ...styles.navLogo, cursor: 'pointer' }}
          onMouseEnter={() => setHoveredItem('logo')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div style={{
            ...styles.logoRing,
            borderColor: hoveredItem === 'logo' ? colors.accent : colors.border,
            boxShadow: hoveredItem === 'logo' ? `0 0 20px ${colors.accent}` : 'none',
            transform: hoveredItem === 'logo' ? 'rotate(360deg) scale(1.06)' : 'rotate(0deg) scale(1)',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <img src={logoImg} alt="CS Bat Logo" style={styles.logoImg} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{
              ...styles.navLogoText,
              color: colors.textMain,
              textShadow: hoveredItem === 'logo' ? `0 0 15px ${colors.accent}` : 'none'
            }}>
              CS Bat
            </span>
            {!isMobile && (
              <span style={styles.portalTag}>
                <span style={styles.pulseDot}></span> LABS ONLINE
              </span>
            )}
          </div>
        </div>

        {/* Links section with sliding capsule look */}
        {!isMobile && (
          <div style={styles.navLinks}>
            <span
              style={getLinkStyle('landing', currentPage === 'landing')}
              onClick={onNavToHome}
              onMouseEnter={() => setHoveredItem('landing')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              HOME
            </span>
            <span
              style={getLinkStyle('shop', currentPage === 'shop')}
              onClick={onNavToShop}
              onMouseEnter={() => setHoveredItem('shop')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              SHOP
            </span>
            <span
              style={getLinkStyle('customizer', currentPage === 'customizer')}
              onClick={onNavToCustomizer}
              onMouseEnter={() => setHoveredItem('customizer')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              CUSTOMIZER
            </span>
            <span
              style={getLinkStyle('reviews', currentPage === 'reviews')}
              onClick={onNavToReviews}
              onMouseEnter={() => setHoveredItem('reviews')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              REVIEWS
            </span>
            {isLoggedIn && (
              <span
                style={getLinkStyle('dashboard', currentPage === 'customer' || currentPage === 'admin')}
                onClick={onNavToDashboard}
                onMouseEnter={() => setHoveredItem('dashboard')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                💻 DASHBOARD
              </span>
            )}
          </div>
        )}

        {/* Action buttons with high-end glass looks */}
        <div style={styles.navActions}>
          <button
            type="button"
            onClick={toggleTheme}
            onMouseEnter={() => setHoveredItem('theme')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              ...styles.btnThemeNav,
              transform: hoveredItem === 'theme' ? 'scale(1.1) rotate(15deg)' : 'scale(1) rotate(0deg)',
              backgroundColor: hoveredItem === 'theme' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
              borderColor: colors.border
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div
            onClick={onNavToCart || onNavToShop}
            onMouseEnter={() => setHoveredItem('cartBtn')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              ...styles.btnThemeNav,
              position: 'relative',
              transform: hoveredItem === 'cartBtn' ? 'scale(1.1)' : 'scale(1)',
              backgroundColor: hoveredItem === 'cartBtn' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
              borderColor: colors.border,
              cursor: 'pointer'
            }}
            title="Shopping Cart"
          >
            🛒
            {cartCount > 0 && (
              <span style={styles.cartBadgeCount}>
                {cartCount}
              </span>
            )}
          </div>

          {isLoggedIn && !isMobile && (
            <button
              type="button"
              onClick={onNavToDashboard}
              onMouseEnter={() => setHoveredItem('dashBtn')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...styles.btnLoginNav,
                background: hoveredItem === 'dashBtn'
                  ? `linear-gradient(135deg, ${colors.accent} 0%, #d8a83d 100%)`
                  : colors.btnBg,
                color: hoveredItem === 'dashBtn' ? '#06080c' : colors.accent,
                boxShadow: hoveredItem === 'dashBtn' ? `0 0 20px ${colors.accent}` : 'none',
                transform: hoveredItem === 'dashBtn' ? 'translateY(-2px)' : 'translateY(0)',
                border: `1px solid ${colors.accent}`
              }}
            >
              💻 DASHBOARD
            </button>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={onNavToLogin}
              onMouseEnter={() => setHoveredItem('loginBtn')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...styles.btnLoginNav,
                background: hoveredItem === 'loginBtn'
                  ? `linear-gradient(135deg, ${colors.accent} 0%, #d8a83d 100%)`
                  : colors.btnBg,
                color: hoveredItem === 'loginBtn' ? '#06080c' : colors.accent,
                boxShadow: hoveredItem === 'loginBtn' ? `0 0 20px ${colors.accent}` : 'none',
                transform: hoveredItem === 'loginBtn' ? 'translateY(-2px)' : 'translateY(0)',
                border: `1px solid ${colors.accent}`
              }}
            >
              👤 OPERATOR ACCESS
            </button>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              onMouseEnter={() => setHoveredItem('hamburger')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...styles.btnThemeNav,
                transform: hoveredItem === 'hamburger' ? 'scale(1.1)' : 'scale(1)',
                backgroundColor: hoveredItem === 'hamburger' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                borderColor: colors.border,
                color: colors.textMain
              }}
            >
              <i className={menuOpen ? "bx bx-x" : "bx bx-menu"} style={{ fontSize: '20px' }}></i>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown Drawer */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'absolute',
          top: '76px',
          left: 0,
          right: 0,
          background: colors.bg,
          borderBottom: '1px solid ' + colors.border,
          boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.7)' : '0 20px 40px rgba(15, 23, 42, 0.06)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <span
            style={getMobileLinkStyle('landing', currentPage === 'landing')}
            onClick={() => handleMobileLinkClick(onNavToHome)}
          >
            HOME
          </span>
          <span
            style={getMobileLinkStyle('shop', currentPage === 'shop')}
            onClick={() => handleMobileLinkClick(onNavToShop)}
          >
            SHOP
          </span>
          <span
            style={getMobileLinkStyle('customizer', currentPage === 'customizer')}
            onClick={() => handleMobileLinkClick(onNavToCustomizer)}
          >
            CUSTOMIZER
          </span>
          <span
            style={getMobileLinkStyle('reviews', currentPage === 'reviews')}
            onClick={() => handleMobileLinkClick(onNavToReviews)}
          >
            REVIEWS
          </span>
          {isLoggedIn ? (
            <span
              style={getMobileLinkStyle('dashboard', currentPage === 'customer' || currentPage === 'admin')}
              onClick={() => handleMobileLinkClick(onNavToDashboard)}
            >
              💻 DASHBOARD
            </span>
          ) : (
            <span
              style={getMobileLinkStyle('login', currentPage === 'login')}
              onClick={() => handleMobileLinkClick(onNavToLogin)}
            >
              👤 OPERATOR ACCESS
            </span>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '76px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxSizing: 'border-box',
    width: '100%',
    backdropFilter: 'blur(30px)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '14px' },
  logoRing: {
    background: 'rgba(243, 198, 95, 0.02)',
    border: '1.5px solid rgba(243, 198, 95, 0.3)',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 0 8px rgba(243, 198, 95, 0.05)'
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain' },
  navLogoText: { fontSize: '22px', fontWeight: '950', letterSpacing: '0.8px', transition: 'all 0.3s ease' },
  portalTag: {
    fontSize: '8px',
    color: '#f3c65f',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  pulseDot: {
    width: '5px',
    height: '5px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 8px #10b981'
  },
  navLinks: { display: 'flex', gap: '15px', height: '100%', alignItems: 'center' },
  navLink: { fontSize: '11px', fontWeight: '800', letterSpacing: '1.8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  navActions: { display: 'flex', alignItems: 'center', gap: '15px' },
  btnThemeNav: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '10px',
    padding: '9px 13px',
    cursor: 'pointer',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  btnLoginNav: {
    fontSize: '11px',
    padding: '10px 22px',
    borderRadius: '8px',
    fontWeight: '900',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  cartBadgeCount: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    background: '#f3c65f',
    color: '#06080c',
    fontSize: '9px',
    fontWeight: '900',
    padding: '2px 6px',
    borderRadius: '50%',
    boxShadow: '0 0 8px rgba(243, 198, 95, 0.6)'
  }
};

export default Navbar;
