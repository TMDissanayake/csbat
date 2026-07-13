import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import logoImg from './assets/logo_new.png';

function ShopPage({ currentCategory = "All", onNavToHome, onNavToLogin, onNavToDashboard, onNavToCustomizer, onNavigateToCheckout, onNavToCart, onNavToReviews, theme, toggleTheme, currentPage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState(currentCategory);
  const [selectedWood, setSelectedWood] = useState([]);
  const [selectedWeight, setSelectedWeight] = useState('All');
  const [heightBMI, setHeightBMI] = useState('175');
  const [weightBMI, setWeightBMI] = useState('75');
  const [playStyle, setPlayStyle] = useState('All-Rounder');
  const [isBmiFiltered, setIsBmiFiltered] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('red');
  const [cardColors, setCardColors] = useState({}); // colour per product (default red)
  const [cardQuantities, setCardQuantities] = useState({});
  const isLoggedIn = !!localStorage.getItem('userEmail');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('csbat_favorites') || '[]');
    } catch (e) {
      return [];
    }
  });

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('csbat_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const getCrossedPrice = (priceStr) => {
    if (!priceStr) return '';
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return '';
    const original = Math.round(num * 1.25);
    return `Rs.${original.toLocaleString()}`;
  };

  const handleAddToCart = (product, quantity = 1, color = 'red') => {
    if (!isLoggedIn) {
      alert("You are not logged into the system. Please login first.");
      if (onNavToLogin) onNavToLogin();
      return;
    }
    if (product.stockCount !== undefined && product.stockCount <= 0) {
      alert("Sorry, this item is out of stock!");
      return;
    }
    try {
      const currentCart = JSON.parse(localStorage.getItem('csbat_cart') || '[]');
      const productId = product._id || product.id;
      const existingItemIndex = currentCart.findIndex(
        item => (item._id || item.id) === productId && (item.cartColor || 'red') === color
      );

      const existingQty = existingItemIndex > -1 ? (currentCart[existingItemIndex].cartQuantity || 0) : 0;
      if (product.stockCount !== undefined && existingQty + quantity > product.stockCount) {
        alert(`Cannot add more items. Only ${product.stockCount} items are in stock, and you already have ${existingQty} in your cart.`);
        return;
      }

      if (existingItemIndex > -1) {
        // Increment quantity of the item with the same color
        currentCart[existingItemIndex].cartQuantity = (currentCart[existingItemIndex].cartQuantity || 1) + quantity;
      } else {
        currentCart.push({ ...product, cartQuantity: quantity, cartColor: color });
      }

      localStorage.setItem('csbat_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('cartUpdate'));
      alert(`🛒 ${product.name} (x${quantity}) in ${color} grip has been added to your cart!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOrderNow = (product, color = 'red') => {
    if (!isLoggedIn) {
      alert("You are not logged into the system. Please login first.");
      if (onNavToLogin) onNavToLogin();
      return;
    }
    if (product.stockCount !== undefined && product.stockCount <= 0) {
      alert("Sorry, this item is out of stock!");
      return;
    }
    try {
      const currentCart = JSON.parse(localStorage.getItem('csbat_cart') || '[]');
      const productId = product._id || product.id;
      const existingItemIndex = currentCart.findIndex(
        item => (item._id || item.id) === productId && (item.cartColor || 'red') === color
      );

      const existingQty = existingItemIndex > -1 ? (currentCart[existingItemIndex].cartQuantity || 0) : 0;
      if (product.stockCount !== undefined && existingQty + 1 > product.stockCount) {
        alert(`Cannot order. Only ${product.stockCount} items are in stock, and you already have ${existingQty} in your cart.`);
        return;
      }

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].cartQuantity = (currentCart[existingItemIndex].cartQuantity || 1) + 1;
      } else {
        currentCart.push({ ...product, cartQuantity: 1, cartColor: color });
      }

      localStorage.setItem('csbat_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('cartUpdate'));

      localStorage.setItem('csbat_checkout_id', product._id || product.id);
      if (onNavigateToCheckout) {
        onNavigateToCheckout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const colors = {
    bg: theme === 'dark' ? '#0a0d14' : '#f0f4f8',
    textMain: theme === 'dark' ? '#ffffff' : '#1e293b',
    sidebarBg: theme === 'dark' ? '#111622' : '#ffffff',
    cardBg: theme === 'dark' ? '#111622' : '#ffffff',
    border: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(30, 58, 95, 0.12)',
    borderLight: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 58, 95, 0.08)',
    textMuted: '#64748b',
    accent: theme === 'dark' ? '#f3c65f' : '#1e3a5f',
    actionBtnBg: '#111827',
    actionBtnText: '#ffffff'
  };

  const styles = getStyles(colors, theme);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 950);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentCategory) setActiveCategory(currentCategory);
  }, [currentCategory]);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const toggleWoodFilter = (type) => {
    setSelectedWood(prev =>
      prev.includes(type) ? prev.filter(w => w !== type) : [...prev, type]
    );
  };

  // Calculate AI Bat Recommendations
  const getAiRecommendation = () => {
    const heightNum = parseFloat(heightBMI) || 0;
    const weightNum = parseFloat(weightBMI) || 0;
    if (heightNum <= 0 || weightNum <= 0) return null;

    // 1. Bat Size/Length Recommendation based on Height (Rounded to whole numbers)
    let recLength = 'Short Handle (34")';
    let lengthMin = 33.0;
    let lengthMax = 33.9;
    let idealSizeVal = 34;

    if (heightNum < 120) {
      recLength = 'Size 1 (25")';
      lengthMin = 0; lengthMax = 26.0;
      idealSizeVal = 25;
    } else if (heightNum >= 120 && heightNum < 130) {
      recLength = 'Size 2 (28")';
      lengthMin = 26.1; lengthMax = 28.0;
      idealSizeVal = 28;
    } else if (heightNum >= 130 && heightNum < 138) {
      recLength = 'Size 3 (29")';
      lengthMin = 28.1; lengthMax = 29.0;
      idealSizeVal = 29;
    } else if (heightNum >= 138 && heightNum < 145) {
      recLength = 'Size 4 (30")';
      lengthMin = 29.1; lengthMax = 30.0;
      idealSizeVal = 30;
    } else if (heightNum >= 145 && heightNum < 151) {
      recLength = 'Size 5 (31")';
      lengthMin = 30.1; lengthMax = 31.0;
      idealSizeVal = 31;
    } else if (heightNum >= 151 && heightNum < 159) {
      recLength = 'Size 6 (32")';
      lengthMin = 31.1; lengthMax = 32.0;
      idealSizeVal = 32;
    } else if (heightNum >= 159 && heightNum < 169) {
      recLength = 'Harrow (33")';
      lengthMin = 32.1; lengthMax = 32.9;
      idealSizeVal = 33;
    } else if (heightNum >= 169 && heightNum < 184) {
      recLength = 'Short Handle (34")';
      lengthMin = 33.0; lengthMax = 33.9;
      idealSizeVal = 34;
    } else {
      recLength = 'Long Handle (35")';
      lengthMin = 34.0; lengthMax = 99.0;
      idealSizeVal = 35;
    }

    // 2. Bat Weight Recommendation based on Player Weight and Style
    let weightClass = 'Medium';
    let weightLabel = '600g-630g';
    let weightMin = 600;
    let weightMax = 630;

    if (weightNum < 50) {
      weightClass = 'Light';
      weightLabel = '550g-590g';
      weightMin = 500;
      weightMax = 590;
    } else if (weightNum >= 50 && weightNum < 75) {
      weightClass = 'Medium';
      weightLabel = '600g-630g';
      weightMin = 600;
      weightMax = 630;
    } else if (weightNum >= 75 && weightNum < 90) {
      weightClass = 'Medium-Heavy';
      weightLabel = '640g-670g';
      weightMin = 640;
      weightMax = 670;
    } else {
      weightClass = 'Heavy';
      weightLabel = '680g-720g';
      weightMin = 680;
      weightMax = 999;
    }

    // Style adjustments
    if (playStyle === 'Power-Hitter') {
      if (weightClass === 'Light') {
        weightClass = 'Medium';
        weightLabel = '600g-630g';
        weightMin = 600; weightMax = 630;
      } else if (weightClass === 'Medium') {
        weightClass = 'Medium-Heavy';
        weightLabel = '640g-670g';
        weightMin = 640; weightMax = 670;
      } else if (weightClass === 'Medium-Heavy') {
        weightClass = 'Heavy';
        weightLabel = '680g-720g';
        weightMin = 680; weightMax = 720;
      } else {
        weightClass = 'Super-Heavy';
        weightLabel = '730g+';
        weightMin = 730; weightMax = 999;
      }
    } else if (playStyle === 'Defensive') {
      if (weightClass === 'Heavy') {
        weightClass = 'Medium-Heavy';
        weightLabel = '640g-670g';
        weightMin = 640; weightMax = 670;
      } else if (weightClass === 'Medium-Heavy') {
        weightClass = 'Medium';
        weightLabel = '600g-630g';
        weightMin = 600; weightMax = 630;
      } else if (weightClass === 'Medium') {
        weightClass = 'Light';
        weightLabel = '550g-590g';
        weightMin = 500; weightMax = 590;
      }
    }

    let recEdge = '38mm-40mm';
    if (playStyle === 'Defensive') {
      recEdge = '36mm-38mm';
    } else if (playStyle === 'Power-Hitter') {
      recEdge = '40mm-44mm';
    }

    let sweetSpot = 'Mid Sweet Spot';
    if (playStyle === 'Defensive') {
      sweetSpot = 'High Sweet Spot';
    } else if (playStyle === 'Power-Hitter') {
      sweetSpot = 'Low Sweet Spot';
    }

    return {
      recLength,
      lengthMin,
      lengthMax,
      idealSizeVal,
      weightClass,
      weightLabel,
      weightMin,
      weightMax,
      recEdge,
      sweetSpot
    };
  };

  const aiRec = getAiRecommendation();

  const filteredProducts = products.filter(product => {
    // If AI filter is active, filter ONLY by Ideal Size and Ideal Weight matching
    if (isBmiFiltered && aiRec) {
      const pWeight = parseFloat(product.batWeight);
      if (pWeight) {
        let numericWeight = pWeight;
        if (pWeight < 10) {
          // convert lbs to g
          numericWeight = pWeight * 453.592;
        }
        if (numericWeight < aiRec.weightMin || numericWeight > aiRec.weightMax) return false;
      } else {
        return false;
      }

      const pHeight = parseFloat(product.batHeight);
      if (pHeight) {
        let numericHeight = pHeight;
        if (pHeight > 50) {
          // convert cm to inches
          numericHeight = pHeight / 2.54;
        }
        if (Math.round(numericHeight) !== aiRec.idealSizeVal) return false;
      } else {
        return false;
      }
      return true;
    }

    // Default filters
    if (activeCategory !== 'All' && product.category !== activeCategory) return false;
    if (selectedWood.length > 0 && !selectedWood.includes(product.woodType)) return false;

    if (selectedWeight && selectedWeight !== 'All') {
      // Filter by manual weight chip selection
      const pWeight = parseFloat(product.batWeight);
      if (pWeight) {
        let isLight = false;
        let isMedium = false;
        let isHeavy = false;

        if (pWeight < 10) {
          isLight = pWeight < 2.10;
          isMedium = pWeight >= 2.10 && pWeight <= 2.12;
          isHeavy = pWeight >= 2.13;
        } else {
          isLight = pWeight < 600;
          isMedium = pWeight >= 600 && pWeight <= 650;
          isHeavy = pWeight > 650;
        }

        if (selectedWeight.startsWith('Light') && !isLight) return false;
        if (selectedWeight.startsWith('Medium') && !isMedium) return false;
        if (selectedWeight.startsWith('Heavy') && !isHeavy) return false;
      }
    }
    return true;
  });

  return (
    <div style={{ 
      ...styles.pageContainer, 
      background: colors.bg, 
      color: colors.textMain,
      height: isMobile ? 'auto' : '100vh',
      overflow: isMobile ? 'visible' : 'hidden'
    }}>
      <div style={{ ...styles.cyberGridOverlay, backgroundImage: `linear-gradient(${theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(180, 83, 9, 0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(180, 83, 9, 0.03)'} 1px, transparent 1px)` }}></div>

      <Navbar
        onNavToHome={onNavToHome}
        onNavToShop={() => { }}
        onNavToCustomizer={onNavToCustomizer}
        onNavToLogin={onNavToLogin}
        onNavToDashboard={onNavToDashboard}
        onNavToCart={onNavToCart}
        onNavToReviews={onNavToReviews}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
      />

      {/* main view start at under the navigation bar */}
      <div style={{ 
        ...styles.mainSplitWrapper, 
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'auto' : 'calc(100vh - 72px)',
        overflow: isMobile ? 'visible' : 'hidden'
      }}>


        {isMobile && (
          <button
            style={styles.mobileFilterTrigger}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? "⚡ CLOSE CONFIGURATION" : " REFINE CORES & BMI SUGGESTIONS"}
          </button>
        )}

        {/* STATIC SIDEBAR */}
        <aside style={{
          ...styles.filterSidebar,
          background: colors.sidebarBg,
          borderRight: '1px solid ' + colors.border,
          display: isMobile && !showMobileFilters ? 'none' : 'block',
          width: isMobile ? '100%' : '300px',
          height: isMobile ? 'auto' : '100%',
          overflowY: isMobile ? 'visible' : 'auto'
        }}>
          <div style={{ ...styles.sidebarSectionTitle, borderBottom: '1px solid ' + colors.border }}>REFINE SELECTION <span style={{ color: colors.accent }}>▼</span></div>

          {/* AI Recommendation Panel */}
          <div style={{ ...styles.specBmiBox, background: colors.bg, borderColor: colors.border }}>
            <label style={{ ...styles.filterLabelHeader, color: colors.accent, fontWeight: '900' }}>🤖 AI Bat Spec Radar</label>
            <div style={styles.inputFieldBlock}>
              <label style={styles.inputLabel}>Height (cm)</label>
              <input
                type="number"
                value={heightBMI}
                onChange={(e) => {
                  setHeightBMI(e.target.value);
                  setIsBmiFiltered(false);
                }}
                style={{ ...styles.sidebarTextInput, background: colors.sidebarBg, color: colors.textMain, borderColor: colors.borderLight }}
              />
            </div>
            <div style={styles.inputFieldBlock}>
              <label style={styles.inputLabel}>Weight (kg)</label>
              <input
                type="number"
                value={weightBMI}
                onChange={(e) => {
                  setWeightBMI(e.target.value);
                  setIsBmiFiltered(false);
                }}
                style={{ ...styles.sidebarTextInput, background: colors.sidebarBg, color: colors.textMain, borderColor: colors.borderLight }}
              />
            </div>
            <div style={styles.inputFieldBlock}>
              <label style={styles.inputLabel}>Play Style</label>
              <select
                value={playStyle}
                onChange={(e) => {
                  setPlayStyle(e.target.value);
                  setIsBmiFiltered(false);
                }}
                style={{ ...styles.sidebarTextInput, background: colors.sidebarBg, color: colors.textMain, borderColor: colors.borderLight, cursor: 'pointer' }}
              >
                <option value="Defensive">Defensive / Touch Player</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Power-Hitter">Attacking / Power-Hitter</option>
              </select>
            </div>

            {aiRec && (
              <div style={{
                margin: '12px 0',
                padding: '10px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '4px',
                border: '1px solid ' + colors.border,
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Ideal Size:</span>
                  <span style={{ fontWeight: 'bold', color: colors.textMain }}>{aiRec.recLength}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Ideal Weight:</span>
                  <span style={{ fontWeight: 'bold', color: colors.textMain }}>{aiRec.weightLabel} ({aiRec.weightClass})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Edge Thickness:</span>
                  <span style={{ fontWeight: 'bold', color: colors.textMain }}>{aiRec.recEdge}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Sweet Spot:</span>
                  <span style={{ fontWeight: 'bold', color: colors.accent, fontSize: '10px' }}>{aiRec.sweetSpot}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsBmiFiltered(true);
                  setSelectedWeight('All');
                }}
                style={{
                  ...styles.btnGoldSmall,
                  flex: 2,
                  background: isBmiFiltered ? '#4caf50' : colors.accent,
                  color: '#06080c',
                  fontWeight: '900'
                }}
              >
                {isBmiFiltered ? '✓ SPECS APPLIED' : '🔍 APPLY AI FILTER'}
              </button>
              {isBmiFiltered && (
                <button
                  type="button"
                  onClick={() => setIsBmiFiltered(false)}
                  style={{
                    ...styles.btnOutlineSmall,
                    flex: 1,
                    margin: 0,
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#ef4444'
                  }}
                >
                  RESET
                </button>
              )}
            </div>
          </div>

          {/* Weight Profile */}


          {/* Custom Builder  */}
          <div style={styles.customBuildPromptBox}>
            <h4 style={{ margin: '0 0 5px 0', color: colors.accent, fontSize: '13px', fontWeight: '800' }}>Need a 100% custom Spec?</h4>
            <button type="button" onClick={onNavToCustomizer} style={styles.btnOutlineSmall}>OPEN 3D CUSTOMIZER ➔</button>
          </div>
        </aside>


        <div style={{ 
          ...styles.rightScrollContent, 
          background: colors.bg,
          height: isMobile ? 'auto' : '100%',
          overflowY: isMobile ? 'visible' : 'auto'
        }}>

          <div style={{ padding: isMobile ? '20px 20px' : '40px 40px 0 40px' }}>
            {/* HERO HEADER */}
            <header style={styles.shopHeroHeader}>
              <div style={styles.cyberBadge}>⚡ THE ARMORY MATRIX DEPLOYED</div>
              <h1 style={{ ...styles.mainShopTitle, color: colors.textMain, fontSize: isMobile ? '28px' : '38px' }}>Our Collection - Performance Ready Bats</h1>
              <p style={{ ...styles.mainShopSubtitle, color: theme === 'dark' ? '#94a3b8' : '#475569' }}>

              </p>

              {/* CATEGORY TABS */}
              <div style={{ ...styles.tabsContainer, gap: isMobile ? '8px' : '12px' }}>
                {['All', 'Custom Clefts', 'Hardwood Bats', 'Softball Bats'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      ...styles.tabButton,
                      background: activeCategory === cat ? colors.accent : (theme === 'dark' ? 'rgba(15, 18, 24, 0.65)' : '#ffffff'),
                      color: activeCategory === cat ? '#06080c' : colors.textMain,
                      border: activeCategory === cat ? `1px solid ${colors.accent}` : '1px solid ' + colors.border,
                      padding: isMobile ? '8px 14px' : '10px 18px',
                      fontSize: isMobile ? '10px' : '11px',
                      boxShadow: activeCategory !== cat && theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </header>

            {/* PRODUCTS GRID */}
            <main style={styles.productsGridMatrix}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isFav = favorites.includes(product._id || product.id) || product.isFavorite;
                  const activeColor = cardColors[product._id || product.id] || 'red';
                  return (
                    <div style={{ ...styles.productCyberCard, background: colors.cardBg }} key={product._id || product.id}>
                      <div style={{ ...styles.cardImageWrapper, background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
                        {product.tag && <span style={styles.cardBadge}>{product.tag}</span>}
                        
                        {/* Heart Favorite Toggle Button (top right) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product._id || product.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transition: 'all 0.2s',
                            zIndex: 10
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <i
                            className={isFav ? "bx bxs-heart" : "bx bx-heart"}
                            style={{
                              color: isFav ? '#ff5a00' : '#64748b',
                              fontSize: '18px'
                            }}
                          />
                        </button>

                        {/* Clickable Image opens details Modal */}
                        <div
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedQuantity(1);
                            setSelectedColor(activeColor);
                          }}
                          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          {product.image ? (
                            <img src={product.image} alt={product.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                          ) : (
                            <div style={styles.placeholderImgElement}>
                              <span style={{ fontSize: '32px' }}>🏏</span>
                              <span style={{ color: colors.accent, fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '10px' }}>{product.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Variant Circle Filled Colors exactly like requested */}
                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0 8px 0', alignItems: 'center' }}>
                        {['red', 'green', 'blue', 'black'].map(col => {
                          const isSelected = activeColor === col;
                          return (
                            <button
                              key={col}
                              type="button"
                              onClick={() => setCardColors({ ...cardColors, [product._id || product.id]: col })}
                              title={`${col} grip`}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: isSelected 
                                  ? `2px solid ${theme === 'dark' ? '#ffffff' : '#1e3a5f'}` 
                                  : '2px solid transparent',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px',
                                transition: 'all 0.2s',
                                transform: isSelected ? 'scale(1.15)' : 'scale(1)'
                              }}
                            >
                              <span style={{
                                display: 'block',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                backgroundColor: col,
                                boxShadow: isSelected ? `0 0 8px ${col}` : 'none'
                              }} />
                            </button>
                          );
                        })}
                      </div>

                      <div style={styles.cardDetailsInfo}>
                        {/* Category Label Tag like "WOMEN SHOES" */}
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            color: '#ff5a00',
                            background: theme === 'dark' ? 'rgba(255, 90, 0, 0.12)' : 'rgba(255, 90, 0, 0.06)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'inline-block'
                          }}>
                            {product.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedQuantity(1);
                            setSelectedColor(activeColor);
                          }}
                          style={{ ...styles.productItemTitle, color: colors.textMain, cursor: 'pointer', marginBottom: '8px', fontSize: '17px', fontWeight: '800' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = colors.accent}
                          onMouseLeave={(e) => e.currentTarget.style.color = colors.textMain}
                        >
                          {product.name}
                        </h3>

                        {/* Pricing and Stock */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ color: colors.textMain, fontWeight: '900', fontSize: '18px' }}>
                              {product.price}
                            </span>
                            <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '12.5px' }}>
                              {getCrossedPrice(product.price)}
                            </span>
                          </div>
                          <span style={{ 
                            fontSize: '11.5px', 
                            fontWeight: '800', 
                            color: product.stockCount <= 0 ? '#ef4444' : product.stockCount <= 3 ? '#f59e0b' : '#16a34a' 
                          }}>
                            {product.stockCount <= 0 ? 'Out of stock' : product.stockCount <= 3 ? `Only ${product.stockCount} left` : `${product.stockCount} in stock`}
                          </span>
                        </div>

                        <p style={{ ...styles.productItemDesc, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: '12.5px', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                          {product.description}
                        </p>

                        {/* Quantity + Add to Cart Row */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: 'auto' }}>
                          
                          {/* Quantity Selector */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderRadius: '10px',
                            padding: '2px',
                          }}>
                            <button
                              type="button"
                              onClick={() => setCardQuantities({ ...cardQuantities, [product._id || product.id]: Math.max(1, (cardQuantities[product._id || product.id] || 1) - 1) })}
                              style={{
                                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                                border: 'none',
                                color: colors.textMain,
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                transition: 'transform 0.1s'
                              }}
                              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >-</button>
                            <span style={{ width: '22px', textAlign: 'center', fontSize: '13px', fontWeight: '800', color: colors.textMain }}>
                              {cardQuantities[product._id || product.id] || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const maxStock = product.stockCount !== undefined ? product.stockCount : 99;
                                setCardQuantities({ 
                                  ...cardQuantities, 
                                  [product._id || product.id]: Math.min(maxStock, (cardQuantities[product._id || product.id] || 1) + 1) 
                                });
                              }}
                              style={{
                                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                                border: 'none',
                                color: colors.textMain,
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                transition: 'transform 0.1s'
                              }}
                              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >+</button>
                          </div>

                          {/* Add to Cart button */}
                          <button
                            type="button"
                            disabled={product.stockCount <= 0}
                            onClick={() => {
                              handleAddToCart(product, cardQuantities[product._id || product.id] || 1, activeColor);
                              setCardQuantities({ ...cardQuantities, [product._id || product.id]: 1 });
                            }}
                            style={{
                              background: product.stockCount <= 0 ? '#374151' : colors.actionBtnBg,
                              color: product.stockCount <= 0 ? '#94a3b8' : colors.actionBtnText,
                              border: 'none',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '11px',
                              letterSpacing: '0.5px',
                              cursor: product.stockCount <= 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              flex: 1,
                              transition: 'all 0.2s',
                              boxShadow: product.stockCount <= 0 ? 'none' : '0 4px 10px rgba(0,0,0,0.1)',
                              opacity: product.stockCount <= 0 ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (product.stockCount > 0) {
                                e.currentTarget.style.opacity = '0.9';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (product.stockCount > 0) {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }
                            }}
                          >
                            <i className="bx bx-cart-add" style={{ fontSize: '15px' }}></i> {product.stockCount <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                          </button>
                        </div>

                        {/* View Details button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedQuantity(1);
                            setSelectedColor(activeColor);
                          }}
                          style={{
                            background: 'rgba(59, 130, 246, 0.06)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            fontWeight: '800',
                            fontSize: '11px',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.06)';
                          }}
                        >
                          <i className="bx bx-info-circle" style={{ fontSize: '14px' }}></i> VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ ...styles.emptyContainer, borderColor: colors.border }}>
                  <span style={{ fontSize: '32px' }}>📡</span>
                  <h3 style={{ color: colors.accent, margin: '15px 0 5px 0' }}>No Data Nodes Matched</h3>
                </div>
              )}
            </main>

            {/* LOAD MORE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
              <button style={{ ...styles.btnLoadMore, borderColor: colors.border, color: colors.textMain }}>LOAD MORE COLLECTION</button>
            </div>
          </div>

          {/* FOOTER AREA */}
          <footer style={{ ...styles.footerArea, background: colors.sidebarBg, borderTop: '1px solid ' + colors.border, padding: isMobile ? '40px 20px' : '50px 40px 30px 40px' }}>
            <div style={{ ...styles.footerMain, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '30px' : '50px' }}>
              <div style={{ flex: '1.5' }}>
                <h3 style={{ color: colors.accent, margin: '0 0 15px 0', fontWeight: '900', fontSize: '24px' }}>CS Bat</h3>
                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: '13.5px', maxWidth: '320px', lineHeight: '1.6', margin: 0 }}>
                  Precision engineered performance for the elite professional.
                </p>
              </div>
              <div style={styles.footerLinksGrid}>
                <div style={styles.footerCol}>
                  <span style={styles.footerColTitle}>SUPPORT</span>
                  <span style={{ ...styles.footerLink, color: theme === 'dark' ? '#94a3b8' : '#475569' }}>Contact Us</span>
                  <span style={{ ...styles.footerLink, color: theme === 'dark' ? '#94a3b8' : '#475569' }}>Shipping Policy</span>
                </div>
                <div style={styles.footerCol}>
                  <span style={styles.footerColTitle}>QUICK LINKS</span>
                  <span style={{ ...styles.footerLink, color: theme === 'dark' ? '#94a3b8' : '#475569' }}>Weapons</span>
                  <span style={{ ...styles.footerLink, color: theme === 'dark' ? '#94a3b8' : '#475569' }}>Custom Area</span>
                </div>
                <div style={styles.footerCol}>
                  <span style={styles.footerColTitle}>NEWSLETTER</span>
                  <div style={styles.newsletterBox}>
                    <input type="email" placeholder="ENTER EMAIL" style={{ ...styles.newsletterInput, color: colors.textMain }} />
                    <span style={{ color: colors.accent, cursor: 'pointer' }}>➔</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ ...styles.footerBottomLine, borderTop: '1px solid ' + colors.border }}>
              <span>© 2026 CS Bat - Precision Engineered For Performance. All Rights Reserved.</span>
            </div>
          </footer>

          {/* Dynamic Product Details Modal */}
          {selectedProduct && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(6, 10, 18, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                background: colors.sidebarBg,
                border: '1px solid ' + colors.border,
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh'
              }}>
                {/* Close button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: '1px solid ' + colors.borderLight,
                    color: colors.textMain,
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}
                >
                  ✕
                </button>

                <div style={{ padding: '30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '25px' }}>
                    {/* Left: Product image */}
                    <div style={{
                      flex: 1,
                      background: theme === 'dark' ? '#0d1017' : '#eef2f6',
                      borderRadius: '12px',
                      border: '1px solid ' + colors.borderLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '200px',
                      padding: '10px'
                    }}>
                      {selectedProduct.image ? (
                        <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ fontSize: '72px' }}>🏏</div>
                      )}
                    </div>

                    {/* Right: Specs & Info */}
                    <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{
                          fontSize: '9px',
                          color: '#06080c',
                          background: colors.accent,
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontWeight: 'bold',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          display: 'inline-block',
                          marginBottom: '8px'
                        }}>
                          {selectedProduct.category}
                        </span>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '800', color: colors.textMain }}>
                          {selectedProduct.name}
                        </h2>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: colors.accent, marginBottom: '15px' }}>
                          {selectedProduct.price}
                        </div>
                        <p style={{ fontSize: '13px', color: theme === 'dark' ? '#94a3b8' : '#475569', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                          {selectedProduct.description}
                        </p>

                        {/* Specs Table */}
                        <div style={{
                          background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                          borderRadius: '8px',
                          border: '1px solid ' + colors.borderLight,
                          padding: '12px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid ' + colors.borderLight }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Weight</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMain }}>{selectedProduct.batWeight || '600 gm'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid ' + colors.borderLight }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Height</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMain }}>{selectedProduct.batHeight || '33.5"'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: selectedProduct.edgeSize ? '8px' : '0px', borderBottom: selectedProduct.edgeSize ? '1px solid ' + colors.borderLight : 'none' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Wood Type / Core</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMain }}>{selectedProduct.woodType || 'Premium English Willow'}</span>
                          </div>
                          {selectedProduct.edgeSize && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderBottom: '1px solid ' + colors.borderLight, paddingBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>Edge Size</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMain }}>{selectedProduct.edgeSize} mm</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Availability</span>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: 'bold', 
                              color: selectedProduct.stockCount <= 0 ? '#ef4444' : selectedProduct.stockCount <= 3 ? '#f59e0b' : '#16a34a' 
                            }}>
                              {selectedProduct.stockCount <= 0 ? 'Out of Stock' : selectedProduct.stockCount <= 3 ? `Only ${selectedProduct.stockCount} left` : `${selectedProduct.stockCount} in stock`}
                            </span>
                          </div>

                          {/* Grip Color Selector in Modal */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STICKER COLOR:</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {['red', 'green', 'blue', 'black'].map(col => {
                                const isSelected = selectedColor === col;
                                return (
                                  <button
                                    key={col}
                                    type="button"
                                    onClick={() => setSelectedColor(col)}
                                    title={col.charAt(0).toUpperCase() + col.slice(1)}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      backgroundColor: col,
                                      border: isSelected ? `2.5px solid ${colors.accent}` : '1.5px solid rgba(255, 255, 255, 0.2)',
                                      boxShadow: isSelected ? `0 0 10px ${colors.accent}` : 'none',
                                      cursor: 'pointer',
                                      borderRadius: '50%',
                                      padding: 0,
                                      transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                                      transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>QUANTITY:</span>
                            <div style={{ display: 'flex', alignItems: 'center', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                              <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} style={{ background: 'transparent', border: 'none', color: colors.textMain, padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>-</button>
                              <span style={{ width: '30px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: colors.textMain }}>{selectedProduct.stockCount <= 0 ? 0 : selectedQuantity}</span>
                              <button 
                                onClick={() => setSelectedQuantity(selectedQuantity + 1)} 
                                disabled={selectedProduct.stockCount <= 0 || selectedQuantity >= selectedProduct.stockCount}
                                style={{ 
                                  background: 'transparent', 
                                  border: 'none', 
                                  color: colors.textMain, 
                                  padding: '6px 14px', 
                                  cursor: (selectedProduct.stockCount <= 0 || selectedQuantity >= selectedProduct.stockCount) ? 'not-allowed' : 'pointer', 
                                  fontWeight: 'bold', 
                                  fontSize: '16px',
                                  opacity: (selectedProduct.stockCount <= 0 || selectedQuantity >= selectedProduct.stockCount) ? 0.3 : 1
                                }}
                              >+</button>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => {
                              handleOrderNow(selectedProduct, selectedColor);
                              setSelectedProduct(null);
                            }}
                            disabled={selectedProduct.stockCount <= 0}
                            style={{
                              background: selectedProduct.stockCount <= 0 ? '#475569' : colors.accent,
                              color: selectedProduct.stockCount <= 0 ? '#94a3b8' : '#06080c',
                              border: 'none',
                              flex: 1.5,
                              padding: '14px',
                              borderRadius: '6px',
                              fontWeight: '900',
                              fontSize: '13px',
                              cursor: selectedProduct.stockCount <= 0 ? 'not-allowed' : 'pointer',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              opacity: selectedProduct.stockCount <= 0 ? 0.6 : 1
                            }}
                          >
                            {selectedProduct.stockCount <= 0 ? 'OUT OF STOCK' : 'ORDER NOW ⚡'}
                          </button>
                          <button
                            onClick={() => {
                              handleAddToCart(selectedProduct, selectedQuantity, selectedColor);
                              setSelectedProduct(null);
                            }}
                            disabled={selectedProduct.stockCount <= 0}
                            style={{
                              background: 'transparent',
                              border: '1px solid ' + (selectedProduct.stockCount <= 0 ? '#475569' : colors.border),
                              color: selectedProduct.stockCount <= 0 ? '#94a3b8' : colors.textMain,
                              flex: 1,
                              padding: '14px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: selectedProduct.stockCount <= 0 ? 'not-allowed' : 'pointer',
                              textTransform: 'uppercase',
                              opacity: selectedProduct.stockCount <= 0 ? 0.6 : 1
                            }}
                          >
                            ADD TO CART
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


const getStyles = (colors, theme) => ({
  pageContainer: {
    background: '#0a0d14', color: '#ffffff', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box'
  },
  cyberGridOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.003) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.003) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 1
  },


  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0d14', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', height: '72px', position: 'relative', zIndex: 1000, boxSizing: 'border-box', width: '100%'
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoRing: { background: 'rgba(243, 198, 95, 0.05)', border: `1px solid ${colors.accent}`, padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: '25px', height: '25px', objectFit: 'contain' },
  navLogoText: { fontSize: '18px', fontWeight: '900', color: '#fff', letterSpacing: '0.5px' },
  portalTag: { fontSize: '9px', color: '#06080c', background: colors.accent, padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold', marginLeft: '4px' },
  navLinks: { display: 'flex', gap: '25px', height: '100%', alignItems: 'center' },
  navLink: { color: '#cbd5e1', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer' },
  navActions: { display: 'flex', alignItems: 'center', gap: '15px' },
  searchContainer: { display: 'flex', alignItems: 'center', gap: '8px', background: '#111622', padding: '6px 12px', borderRadius: '6px' },
  searchInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '130px' },
  navIcon: { color: colors.accent, cursor: 'pointer', fontSize: '14px', position: 'relative' },
  cartCount: { position: 'absolute', top: '-6px', right: '-8px', background: colors.accent, color: '#06080c', fontSize: '8px', fontWeight: '900', padding: '1px 4px', borderRadius: '50%' },
  btnLoginNav: { background: 'rgba(243, 198, 95, 0.08)', border: '1px solid rgba(243, 198, 95, 0.2)', color: colors.accent, fontSize: '10px', padding: '6px 12px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' },

  /* MAIN LAYOUT BOUNDARIES */
  mainSplitWrapper: { display: 'flex', width: '100%', height: 'calc(100vh - 72px)', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' },

  filterSidebar: {
    background: '#111622', borderRight: '1px solid rgba(255, 255, 255, 0.03)', padding: '22px', boxSizing: 'border-box', zIndex: 90,
    height: '100%', overflowY: 'auto'
  },

  rightScrollContent: {
    flex: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', zIndex: 5
  },

  mobileFilterTrigger: { background: 'rgba(243, 198, 95, 0.1)', border: `1px solid ${colors.accent}`, color: colors.accent, fontWeight: '900', fontSize: '11px', padding: '14px', borderRadius: '6px', width: '100%', cursor: 'pointer', marginBottom: '20px' },
  shopHeroHeader: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', width: '100%', boxSizing: 'border-box' },
  cyberBadge: { fontSize: '9px', color: colors.accent, fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px' },
  mainShopTitle: { fontWeight: '800', margin: '0 0 10px 0', color: '#fff', letterSpacing: '-0.5px' },
  mainShopSubtitle: { color: '#94a3b8', fontSize: '13.5px', maxWidth: '680px', lineHeight: '1.6', margin: '0 0 20px 0' },
  tabsContainer: { display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap', marginBottom: '30px' },
  tabButton: { borderRadius: '4px', fontWeight: '700', cursor: 'pointer' },
  sidebarSectionTitle: { fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: colors.accent, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', marginBottom: '20px' },
  filterGroup: { marginBottom: '20px' },
  filterLabelHeader: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  checkboxInput: { accentColor: colors.accent, cursor: 'pointer' },
  checkboxLabel: { fontSize: '12.5px', color: '#cbd5e1', cursor: 'pointer' },
  specBmiBox: { background: '#0a0d14', border: '1px solid rgba(255, 255, 255, 0.03)', padding: '15px', borderRadius: '6px', marginBottom: '20px' },
  inputFieldBlock: { marginBottom: '10px' },
  inputLabel: { display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '4px' },
  sidebarTextInput: { background: '#111622', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px', color: '#fff', width: '100%', boxSizing: 'border-box', fontSize: '12px' },
  btnGoldSmall: { background: colors.accent, color: '#06080c', border: 'none', width: '100%', padding: '10px', borderRadius: '4px', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  weightChipsGrid: { display: 'flex', flexDirection: 'column', gap: '6px' },
  weightChip: { width: '100%', padding: '8px 12px', borderRadius: '4px', fontSize: '11.5px', textAlign: 'left', cursor: 'pointer', fontWeight: '600' },
  customBuildPromptBox: { background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', padding: '15px', borderRadius: '6px', marginTop: '20px' },
  btnOutlineSmall: { background: 'transparent', border: '1px solid rgba(243,198,95,0.2)', color: colors.accent, fontWeight: '700', padding: '8px 12px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', width: '100%' },

  productsGridMatrix: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  productCyberCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxShadow: theme === 'dark' ? '0 10px 25px rgba(0,0,0,0.1)' : '0 10px 30px rgba(30, 58, 95, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  cardImageWrapper: { position: 'relative', height: '220px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' },
  cardBadge: { position: 'absolute', top: '12px', left: '12px', background: '#ff5a00', color: '#ffffff', fontSize: '9px', fontWeight: '900', padding: '3px 8px', borderRadius: '4px', zIndex: 5 },
  placeholderImgElement: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' },
  cardCategoryTag: { display: 'none' },
  cardDetailsInfo: { padding: '8px 0 0 0', display: 'flex', flexDirection: 'column', flex: 1 },
  cardPrimaryRow: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
  productItemTitle: { margin: 0, fontSize: '17px', fontWeight: '800', lineHeight: 1.3 },
  productItemPrice: { fontWeight: '900', fontSize: '18px' },
  productItemDesc: { fontSize: '12.5px', lineHeight: '1.5' },
  cardActionsFooterRow: { display: 'flex', gap: '6px', alignItems: 'center', marginTop: 'auto' },
  viewDetailsActionBtn: { border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer' },
  favoriteToggleActionBtn: { background: 'transparent', border: 'none', cursor: 'pointer' },
  btnLoadMore: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '11px', fontWeight: '700', padding: '12px 30px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '1px' },
  emptyContainer: { gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(253,198,95,0.15)', borderRadius: '8px' },

  footerArea: {
    background: '#0a0d14', borderTop: '1px solid rgba(255, 255, 255, 0.05)', width: '100%', boxSizing: 'border-box', marginTop: 'auto'
  },
  footerMain: { display: 'flex', justifyContent: 'space-between', width: '100%' },
  footerLinksGrid: { display: 'flex', gap: '50px' },
  footerCol: { display: 'flex', flexDirection: 'column', minWidth: '120px' },
  footerColTitle: { fontSize: '11px', color: colors.accent, fontWeight: '700', marginBottom: '12px', letterSpacing: '0.5px' },
  footerLink: { color: '#94a3b8', fontSize: '12.5px', marginBottom: '8px', cursor: 'pointer' },
  newsletterBox: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #475569', paddingBottom: '5px', width: '180px' },
  newsletterInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', width: '100%' },
  footerBottomLine: { margin: '30px 0 0 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.02)', textAlign: 'left', color: '#475569', fontSize: '11px' }
});

export default ShopPage;