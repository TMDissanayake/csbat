import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

function CartPage({ onNavToHome, onNavToShop, onNavToCustomizer, onNavToLogin, onNavToDashboard, onNavToCart, onNavigateToCheckout, onNavToReviews, theme, toggleTheme, currentPage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#060913' : '#f4f7fb',
    textMain: isDark ? '#ffffff' : '#0f172a',
    cardBg: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(217, 119, 6, 0.4)',
    cardShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 20px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.06)',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    accent: '#f3c65f',
    accentHover: '#eab308',
    danger: '#ef4444',
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load cart items from localStorage and merge with DB product details
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartRaw = JSON.parse(localStorage.getItem('csbat_cart') || '[]');
        if (cartRaw.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        try {
          const res = await fetch('http://localhost:5001/api/products');
          const allProducts = await res.json();

          if (Array.isArray(allProducts)) {
            // Merge DB details BUT preserve cartQuantity from localStorage
            const merged = cartRaw.map(cartEntry => {
              const id = cartEntry._id || cartEntry.id;
              const dbProduct = allProducts.find(p => (p._id || p.id) === id);
              if (dbProduct) {
                // Use DB data for product details, but keep the user-selected quantity and color
                return { 
                  ...dbProduct, 
                  cartQuantity: cartEntry.cartQuantity || 1, 
                  cartColor: cartEntry.cartColor || 'red' 
                };
              }
              return cartEntry;
            });
            setCartItems(merged);
          } else {
            setCartItems(cartRaw);
          }
        } catch {
          // If DB fails, use local data as-is
          setCartItems(cartRaw);
        }
      } catch (e) {
        console.error('Error loading cart:', e);
        setCartItems([]);
      }
      setLoading(false);
    };
    loadCart();
  }, []);

  const handleRemoveItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem('csbat_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    // Check stock counts
    for (const item of cartItems) {
      if (item.stockCount !== undefined) {
        if (item.stockCount <= 0) {
          alert(`Sorry, "${item.name}" is currently out of stock. Please remove it from your cart before proceeding.`);
          return;
        }
        if (item.cartQuantity > item.stockCount) {
          alert(`Sorry, quantity for "${item.name}" exceeds available stock (${item.stockCount} in stock). Please adjust your quantity.`);
          return;
        }
      }
    }
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const parsePrice = (price) => {
    if (!price) return 0;
    // Remove currency symbol (e.g. 'Rs.', 'Rs. '), then remove commas, then parse
    const cleaned = String(price)
      .replace(/[Rr][Ss]\.?\s*/g, '')  // remove Rs. or Rs prefix
      .replace(/,/g, '')               // remove thousands commas
      .trim();
    return parseFloat(cleaned) || 0;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = parsePrice(item.price);
    const qty = item.cartQuantity || 1;
    return acc + price * qty;
  }, 0);
  const total = subtotal;

  return (
    <div style={{ ...styles.pageContainer, background: colors.bg, color: colors.textMain }}>
      <style>
        {`
          @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(30px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pulseDot {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .cart-card {
            animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            background: ${colors.cardBg};
            border: 1px solid ${colors.cardBorder};
            box-shadow: ${colors.cardShadow};
            backdrop-filter: blur(12px);
            border-radius: 18px;
            transition: all 0.3s ease;
            opacity: 0;
          }
          .cart-card:hover {
            transform: translateY(-3px);
            box-shadow: ${isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.1)'};
            border-color: rgba(243, 198, 95, 0.35);
          }
          .image-box { transition: transform 0.4s ease; }
          .cart-card:hover .image-box { transform: scale(1.04); }
          .qty-btn {
            background: transparent;
            border: none;
            color: ${colors.textMain};
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            font-weight: 900;
            font-size: 16px;
            border-radius: 6px;
            transition: background 0.2s;
          }
          .qty-btn:hover { background: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}; }
          .btn-checkout {
            background: linear-gradient(135deg, #f3c65f 0%, #e6a817 100%);
            color: #06080c;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: 900;
            font-size: 13px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(243, 198, 95, 0.3);
          }
          .btn-checkout:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(243, 198, 95, 0.5);
          }
          .btn-icon-remove {
            background: ${isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'};
            color: ${colors.danger};
            border: 1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'};
            width: 34px; height: 34px;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          .btn-icon-remove:hover {
            background: ${colors.danger};
            color: #fff;
            transform: scale(1.08);
          }
          .summary-card {
            background: ${colors.cardBg};
            border: 1px solid ${colors.cardBorder};
            box-shadow: ${colors.cardShadow};
            border-radius: 18px;
            padding: 28px;
            position: sticky;
            top: 90px;
            animation: slideUpFade 0.5s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
        `}
      </style>

      {/* Modern Background Accents */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(243,198,95,0.04) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
      }}></div>

      <div style={styles.cyberGridOverlay}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar
          onNavToHome={onNavToHome}
          onNavToShop={onNavToShop}
          onNavToCustomizer={onNavToCustomizer}
          onNavToLogin={onNavToLogin}
          onNavToDashboard={onNavToDashboard}
          onNavToCart={onNavToCart}
          onNavToReviews={onNavToReviews}
          theme={theme}
          toggleTheme={toggleTheme}
          currentPage={currentPage}
        />
      </div>

      <div style={styles.mainContent}>
        <div style={{ padding: isMobile ? '20px' : '40px 20px', maxWidth: '850px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header Section */}
          <div style={{ 
            display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
            justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '35px', animation: 'slideUpFade 0.5s ease forwards', gap: '15px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', background: colors.accent, borderRadius: '50%' }}></div>
                <span style={{ fontSize: '11px', color: colors.accent, fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Staging Area
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: isMobile ? '28px' : '34px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                My Cart <span style={{ color: colors.textMuted, fontWeight: '400' }}>({cartItems.length})</span>
              </h1>
            </div>
            
            {cartItems.length > 0 && (
              <button
                onClick={onNavToShop}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textMain,
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
              >
                + Add More Items
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '100px 20px', animation: 'slideUpFade 0.5s ease' }}>
              <div style={{ 
                width: '36px', height: '36px', margin: '0 auto 15px auto',
                border: `3px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderTop: `3px solid ${colors.accent}`,
                borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Loading your selection...</p>
            </div>
          )}

          {/* Empty Cart State */}
          {!loading && cartItems.length === 0 && (
            <div className="cart-card" style={{
              textAlign: 'center', padding: '80px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ 
                width: '80px', height: '80px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', marginBottom: '20px', border: `1px solid ${colors.cardBorder}`
              }}>
                🛒
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '800' }}>Your cart is empty</h3>
              <p style={{ color: colors.textMuted, fontSize: '14px', margin: '0 0 30px 0', maxWidth: '350px' }}>
                Looks like you haven't added any premium cricket gear yet.
              </p>
              <button className="btn-checkout" onClick={onNavToShop} style={{ padding: '14px 30px', fontSize: '13px' }}>
                Explore The Shop
              </button>
            </div>
          )}

          {/* Layout Split: Items + Order Summary */}
          {!loading && cartItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', alignItems: 'flex-start' }}>

              {/* LEFT: Item Cards */}
              <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                {cartItems.map((item, index) => {
                  const linePrice = parsePrice(item.price) * (item.cartQuantity || 1);
                  return (
                    <div key={`${item._id || item.id || index}`} className="cart-card" style={{
                      display: 'flex',
                      flexDirection: 'row',
                      padding: '0',
                      overflow: 'hidden',
                      animationDelay: `${index * 0.08}s`,
                      minHeight: '150px'
                    }}>

                      {/* Image Panel */}
                      <div style={{
                        width: isMobile ? '110px' : '150px',
                        flexShrink: 0,
                        background: isDark ? '#050810' : '#edf1f7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {item.image ? (
                          <img className="image-box" src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '40px', opacity: 0.35 }}>🏏</span>
                        )}
                        {/* Qty Badge on image */}
                        {(item.cartQuantity || 1) > 1 && (
                          <div style={{ position: 'absolute', top: '8px', left: '8px', background: colors.accent, color: '#06080c', borderRadius: '20px', fontSize: '10px', fontWeight: '900', padding: '2px 8px' }}>
                            ×{item.cartQuantity}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 20px', minWidth: 0 }}>

                        {/* Top Row: Status Badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {item.stockCount !== undefined && item.stockCount <= 0 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                              <span style={{ width: '5px', height: '5px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>
                              Out of Stock
                            </span>
                          ) : item.stockCount !== undefined && item.cartQuantity > item.stockCount ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                              <span style={{ width: '5px', height: '5px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
                              Exceeds Stock ({item.stockCount} left)
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#22c55e', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                              <span style={{ width: '5px', height: '5px', background: '#22c55e', borderRadius: '50%', animation: 'pulseDot 2s infinite', display: 'inline-block' }}></span>
                              In Stock {item.stockCount !== undefined && `(${item.stockCount})`}
                            </span>
                          )}
                          {item.category && <span style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: '20px' }}>{item.category}</span>}
                        </div>


                        {/* Product Name */}
                        <h3 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '15px' : '17px', fontWeight: '800', color: colors.textMain, lineHeight: '1.2' }}>
                          {item.name}
                        </h3>

                        {/* Description */}
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: colors.textMuted, lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.description || 'Premium hand-crafted willow bat designed for high performance cricket.'}
                        </p>

                        {/* Spec Pills */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {item.batWeight && <span style={styles.specPill(isDark, colors)}>⚖️ {item.batWeight}</span>}
                          {item.batHeight && <span style={styles.specPill(isDark, colors)}>📏 {item.batHeight}</span>}
                          {item.woodType && <span style={styles.specPill(isDark, colors)}>🪵 {item.woodType}</span>}
                          {item.cartColor && (
                            <span style={styles.specPill(isDark, colors)}>
                              🎨 Grip: <span style={{
                                display: 'inline-block',
                                width: '10px',
                                height: '10px',
                                backgroundColor: item.cartColor,
                                borderRadius: '50%',
                                verticalAlign: 'middle',
                                marginLeft: '4px',
                                marginRight: '2px',
                                border: '1px solid ' + (isDark ? '#fff' : '#000')
                              }}></span> {item.cartColor.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Bottom row: price breakdown + qty display + remove */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', gap: '12px' }}>

                          {/* Price breakdown */}
                          <div>
                            {/* Unit price × qty */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', color: colors.textMuted }}>{item.price}</span>
                              <span style={{ fontSize: '11px', color: colors.textMuted, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: '4px' }}>×{item.cartQuantity || 1}</span>
                            </div>
                            {/* Line total */}
                            <div style={{ fontSize: '20px', fontWeight: '900', color: colors.accent }}>
                              Rs. {linePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          {/* Qty badge (static) + Remove */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            {/* Qty Pill */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(243,198,95,0.08)' : 'rgba(217,119,6,0.08)', border: `1px solid ${isDark ? 'rgba(243,198,95,0.25)' : 'rgba(217,119,6,0.3)'}`, borderRadius: '8px', padding: '5px 12px' }}>
                              <span style={{ fontSize: '11px', color: colors.accent, fontWeight: '700', letterSpacing: '0.5px' }}>QTY</span>
                              <span style={{ fontSize: '16px', fontWeight: '900', color: colors.accent }}>{item.cartQuantity || 1}</span>
                            </div>
                            {/* Remove button */}
                            <button onClick={() => handleRemoveItem(index)} className="btn-icon-remove" title="Remove from cart">
                              🗑️
                            </button>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Order Summary */}
              <div className="summary-card" style={{ width: isMobile ? '100%' : '320px', flexShrink: 0, boxSizing: 'border-box' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ width: '8px', height: '8px', background: colors.accent, borderRadius: '50%' }}></div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', letterSpacing: '0.5px' }}>Order Summary</h3>
                </div>

                {/* Per-Item Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {cartItems.map((item, idx) => {
                    const lp = parsePrice(item.price) * (item.cartQuantity || 1);
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px' }}>
                        <span style={{ color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {item.name} <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: item.cartColor || 'red', borderRadius: '3px', marginLeft: '6px' }}></span><span style={{ fontWeight: '700', color: colors.accent }}>×{item.cartQuantity || 1}</span>
                        </span>
                        <span style={{ fontWeight: '700', color: colors.textMain, whiteSpace: 'nowrap' }}>
                          Rs. {lp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div style={{ borderTop: `1px dashed ${colors.cardBorder}`, marginBottom: '16px' }}></div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: colors.textMuted }}>Total</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: colors.accent }}>
                    Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Checkout Button */}
                <button onClick={handleProceedToCheckout} className="btn-checkout" style={{ width: '100%', padding: '16px', fontSize: '13px', borderRadius: '12px' }}>
                  Proceed to Checkout →
                </button>

                {/* Trust Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', opacity: 0.5 }}>
                  <span style={{ fontSize: '13px' }}>🔒</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Secure Encrypted Checkout</span>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  cyberGridOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)', 
    backgroundSize: '30px 30px', pointerEvents: 'none', zIndex: 1
  },
  mainContent: {
    flex: 1, overflowY: 'auto', position: 'relative', zIndex: 5
  },
  specPill: (isDark, colors) => ({
    fontSize: '11px',
    color: colors.textMuted,
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${colors.cardBorder}`,
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: '600'
  })
};

export default CartPage;
