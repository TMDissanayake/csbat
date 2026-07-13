import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import logoImg from './assets/logo_new.png';

function CheckoutPage({ onNavToShop, onNavToHome, onNavToCustomizer, onNavToLogin, onNavToDashboard, onNavToCart, onNavToReviews, onNavigateToPayHere, theme, toggleTheme, currentPage }) {
  const [activeStep, setActiveStep] = useState('address');
  const [selectedCardType, setSelectedCardType] = useState('visa');
  const [focusedField, setFocusedField] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('csbat_cart') || '[]');
      if (currentCart.length > 0) {
        setCartItems(currentCart);
      }
    } catch (e) {
      console.error('Error loading cart for checkout:', e);
    }
  }, []);

  const parsePrice = (price) => {
    if (!price) return 0;
    const cleaned = String(price)
      .replace(/[Rr][Ss]\.?\s*/g, '')
      .replace(/,/g, '')
      .trim();
    return parseFloat(cleaned) || 0;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = parsePrice(item.price);
    const qty = item.cartQuantity || 1;
    return acc + price * qty;
  }, 0);
  const totalAmount = subtotal;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', phone: '', address: '', city: '', zip: '',
    cardNumber: '', expiry: '', cvv: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'bank_transfer'
  const [slipFileBase64, setSlipFileBase64] = useState('');
  const [slipFileName, setSlipFileName] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: 'Seylan Bank PLC',
    branchName: 'Colombo Fort',
    accountNumber: '0860-33456910-001',
    accountName: 'CS BAT LABS PVT LTD',
    qrText: ''
  });

  useEffect(() => {
    fetch('http://localhost:5001/api/bank-details')
      .then(res => res.json())
      .then(data => {
        if (data && data.bankName) {
          setBankDetails(data);
        }
      })
      .catch(err => console.error('Error fetching bank details:', err));
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      fetch(`http://localhost:5001/api/user?email=${email}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.fullName) {
            const parts = data.fullName.trim().split(/\s+/);
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';
            setFormData(prev => ({
              ...prev,
              email: data.email || email,
              firstName: firstName,
              lastName: lastName,
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              zip: data.postalCode || ''
            }));
          } else {
            setFormData(prev => ({ ...prev, email: email }));
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlipChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Slip file size must be less than 5MB.");
      return;
    }
    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSlipFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("No items selected for checkout.");
      return;
    }
    if (paymentMethod === 'bank_transfer' && !slipFileBase64) {
      alert("Please upload your payment transaction receipt slip.");
      return;
    }

    if (paymentMethod === 'card') {
      const orderData = {
        client: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}${formData.city ? ', ' + formData.city : ''}`,
        city: formData.city,
        postalCode: formData.zip,
        product: cartItems.map(item => `${item.name} [Grip: ${item.cartColor || 'red'}] (x${item.cartQuantity || 1})`).join(', '),
        spec: 'Bulk Order',
        price: 'Rs. ' + totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        paymentMethod: 'card',
        paymentSlip: null,
        status: 'confirm',
        cartItems: cartItems.map(item => ({
          productId: item._id || item.id,
          quantity: item.cartQuantity || 1
        })),
        date: new Date().toISOString()
      };
      localStorage.setItem('csbat_pending_order', JSON.stringify(orderData));
      if (onNavigateToPayHere) {
        onNavigateToPayHere();
      } else {
        alert("Payment gateway routing not configured.");
      }
      return;
    }

    try {
      const orderData = {
        client: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}${formData.city ? ', ' + formData.city : ''}`,
        city: formData.city,
        postalCode: formData.zip,
        product: cartItems.map(item => `${item.name} [Grip: ${item.cartColor || 'red'}] (x${item.cartQuantity || 1})`).join(', '),
        spec: 'Bulk Order',
        price: 'Rs. ' + totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        paymentMethod: paymentMethod,
        paymentSlip: paymentMethod === 'bank_transfer' ? slipFileBase64 : null,
        status: paymentMethod === 'bank_transfer' ? 'pending_payment' : 'confirm',
        cartItems: cartItems.map(item => ({
          productId: item._id || item.id,
          quantity: item.cartQuantity || 1
        })),
        date: new Date().toISOString()
      };
      const res = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        localStorage.setItem('csbat_cart', '[]');
        window.dispatchEvent(new Event('cartUpdate'));
        alert('🔒 Order Placed! Payment slip uploaded. Pending Admin Authorization.');
        if (onNavToHome) onNavToHome();
      } else {
        alert('Failed to authorize payment.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error placing order.');
    }
  };

  const colors = {
    bg: theme === 'dark' ? '#020408' : '#eef2f6',
    textMain: theme === 'dark' ? '#eef2f6' : '#0f172a',
    sidebarBg: theme === 'dark' ? '#050912' : '#ffffff',
    cardBg: theme === 'dark' ? 'rgba(6, 10, 18, 0.85)' : '#ffffff',
    border: theme === 'dark' ? 'rgba(243, 198, 95, 0.25)' : 'rgba(217, 119, 6, 0.4)',
    borderLight: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(217, 119, 6, 0.3)',
    textMuted: '#64748b',
    accent: '#f3c65f'
  };

  return (
    <div style={{ ...styles.pageContainer, background: colors.bg, color: colors.textMain }}>
      
  <div style={{
    ...styles.cyberGridOverlay,
    background: theme === 'dark'
      ? 'linear-gradient(rgba(243,198,95,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(243,198,95,0.03) 1px, transparent 1px)'
      : 'linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)'
  }}></div>

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

      
      
      {/* Order item */}
      <div style={styles.masterWrapper}>

        
        <div style={{ ...styles.orderManifestWindow, background: colors.cardBg, overflowY: 'auto', maxHeight: '600px' }}>
          <div style={styles.manifestHeader}>
            <span style={styles.manifestLabel}>SELECTED ARSENAL UNITS</span>
            <span style={styles.manifestQtyTag}>QTY: {cartItems.reduce((acc, item) => acc + (item.cartQuantity || 1), 0)} - CONFIRMED</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={styles.manifestBody}>
                <div style={{ ...styles.batImageFrame, width: '70px', height: '70px' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>🏏</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...styles.batMainName, color: colors.textMain, fontSize: '14px' }}>
                    {item.name} <span style={{ color: colors.accent, fontSize: '12px' }}>(x{item.cartQuantity || 1})</span>
                  </h4>
                  <p style={{ ...styles.batSpecs, color: '#8899aa', fontSize: '11px', margin: '4px 0' }}>
                    {item.category || item.woodType || 'Standard'}
                  </p>
                  <p style={{ ...styles.batSpecs, color: '#8899aa', fontSize: '11px', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Grip: <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: item.cartColor || 'red', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}></span> {item.cartColor ? item.cartColor.toUpperCase() : 'RED'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...styles.batPriceTag, fontSize: '14px' }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${colors.borderLight}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#8899aa' }}>Total Charge:</span>
            <span style={{ fontSize: '16px', fontWeight: '900', color: colors.accent }}>Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        
        <div style={{ ...styles.centralCardWindow, background: colors.cardBg }}>

          {/* DELIVERY details */}
          {activeStep === 'address' && (
            <form onSubmit={(e) => { e.preventDefault(); setActiveStep('payment'); }} style={styles.stepFadeIn}>
              <h2 style={{ ...styles.windowMainHeading, color: colors.textMain }}>01. Delivery & Contact Coordinates</h2>
              <p style={styles.windowSubHeading}>Fill the secure deployment routing destination details below.</p>

              <div style={styles.inputStack}>
                <div style={styles.fieldBlock}>
                  <label style={styles.decLabel}>Email Hub</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'email' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="operator@domain.com" />
                </div>

                <div style={{ ...styles.dualGridRow, flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={styles.fieldBlock}>
                    <label style={styles.decLabel}>First Name</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'firstName' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="Aiden" />
                  </div>
                  <div style={styles.fieldBlock}>
                    <label style={styles.decLabel}>Last Name</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'lastName' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="Sterling" />
                  </div>
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.decLabel}>Secure Contact Phone</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'phone' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="+94 7X XXX XXXX" />
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.decLabel}>Street Address Node</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'address' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="No. 45, Core Axis Avenue" />
                </div>

                <div style={{ ...styles.dualGridRow, flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={styles.fieldBlock}>
                    <label style={styles.decLabel}>City Node</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleInputChange} onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'city' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="Colombo" />
                  </div>
                  <div style={styles.fieldBlock}>
                    <label style={styles.decLabel}>Zip / Postal Code</label>
                    <input type="text" name="zip" required value={formData.zip} onChange={handleInputChange} onFocus={() => setFocusedField('zip')} onBlur={() => setFocusedField('')} style={{ ...styles.decInput, background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#ffffff', color: colors.textMain, borderColor: focusedField === 'zip' ? '#f3c65f' : 'rgba(255,255,255,0.06)' }} placeholder="00100" />
                  </div>
                </div>
              </div>

              <button type="submit" style={styles.btnActionPrimary}>PROCEED TO PAYMENT ➔</button>
            </form>
          )}

          {/* PAYMENT details */}
          {activeStep === 'payment' && (
            <form onSubmit={handleCheckoutSubmit} style={styles.stepFadeIn}>
              <h2 style={{ ...styles.windowMainHeading, color: colors.textMain }}>02. Secure Encrypted Remittance</h2>
              <p style={styles.windowSubHeading}>Select card architecture or bank transfer setup.</p>

              <div style={{ ...styles.cardTypeMatrixRow, flexDirection: isMobile ? 'column' : 'row' }}>
                <div onClick={() => setPaymentMethod('card')} style={{ ...styles.cartTypeTab, borderColor: paymentMethod === 'card' ? '#f3c65f' : 'rgba(255,255,255,0.04)', background: paymentMethod === 'card' ? 'rgba(243,198,95,0.04)' : colors.sidebarBg }}>
                  <span style={{ fontSize: '18px' }}>💳</span>
                  <span style={{ ...styles.cardBrandName, color: colors.textMain }}>Card Payment</span>
                </div>

                <div onClick={() => setPaymentMethod('bank_transfer')} style={{ ...styles.cartTypeTab, borderColor: paymentMethod === 'bank_transfer' ? '#f3c65f' : 'rgba(255,255,255,0.04)', background: paymentMethod === 'bank_transfer' ? 'rgba(243,198,95,0.04)' : colors.sidebarBg }}>
                  <span style={{ fontSize: '18px' }}>🏦</span>
                  <span style={{ ...styles.cardBrandName, color: colors.textMain }}>Bank Transfer / QR</span>
                </div>
              </div>

              {paymentMethod === 'card' ? (
                <div style={{
                  marginTop: '20px',
                  padding: '25px',
                  background: theme === 'dark' ? 'rgba(243, 198, 95, 0.03)' : '#f8fafc',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px' }}>💳</div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: colors.textMain }}>PayHere Secure Remittance</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8899aa', lineHeight: '1.5' }}>
                    You will be redirected to the secure <strong>PayHere Payment Gateway</strong> to input your credit/debit card details and complete this transaction.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <i className="bx bx-shield-quarter" style={{ color: '#16a34a', fontSize: '16px' }}></i>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>PCI-DSS SECURE GATEWAY ENABLED</span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '20px', background: theme === 'dark' ? 'rgba(2, 4, 8, 0.7)' : '#f8fafc', borderRadius: '8px', border: `1px solid ${colors.borderLight}` }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '13px', color: colors.accent, letterSpacing: '0.5px' }}>OFFLINE REMITTANCE DATA</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', lineHeight: '1.4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Bank:</span>
                        <strong style={{ color: colors.textMain }}>{bankDetails.bankName}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Branch:</span>
                        <strong style={{ color: colors.textMain }}>{bankDetails.branchName}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Account Number:</span>
                        <strong style={{ color: colors.textMain, fontFamily: 'monospace' }}>{bankDetails.accountNumber}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Account Name:</span>
                        <strong style={{ color: colors.textMain }}>{bankDetails.accountName}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '8px', border: `1px solid ${colors.borderLight}` }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Scan QR to Pay Instantly</span>
                    <div style={{ width: '150px', height: '150px', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          bankDetails.qrText || `Bank: ${bankDetails.bankName}\nBranch: ${bankDetails.branchName}\nAcc: ${bankDetails.accountNumber}\nName: ${bankDetails.accountName}`
                        )}`}
                        alt="Payment QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>CS-PAY SECURE TRANSIT CORE</span>
                  </div>

                  <div style={styles.fieldBlock}>
                    <label style={styles.decLabel}>Upload Payment Receipt Slip (PDF/Image)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="application/pdf, image/*" 
                        onChange={handleSlipChange} 
                        style={{ display: 'none' }} 
                        id="payment-slip-upload"
                      />
                      <label htmlFor="payment-slip-upload" style={{ ...styles.btnActionSecondary, border: '1px dashed #f3c65f', padding: '12px 20px', borderRadius: '4px', display: 'inline-block', color: '#f3c65f', cursor: 'pointer', textAlign: 'center', flex: 1, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                        {slipFileName ? '🔄 Change File' : '📤 Choose File'}
                      </label>
                      {slipFileName && (
                        <div style={{ fontSize: '11px', color: colors.textMain, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                          📄 {slipFileName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                ...styles.inlineSummaryTally,
                background: theme === 'dark' ? '#020408' : '#eef2f6',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.08)'
              }}>
                <span style={styles.tallyLabel}>TOTAL CHARGEABLE VALUE</span>
                <span style={{ ...styles.tallyPrice, color: colors.textMain }}>Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ ...styles.dualActionGroup, flexDirection: isMobile ? 'column-reverse' : 'row', gap: isMobile ? '12px' : '0' }}>
                <button type="button" onClick={() => setActiveStep('address')} style={styles.btnActionSecondary}>➔ Modify Coordinates</button>
                <button type="submit" style={styles.btnActionPrimaryInlineGold}>
                  {paymentMethod === 'bank_transfer' ? 'SUBMIT SLIP' : 'PROCEED TO PAYHERE ➔'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      <footer style={styles.decFooter}>
        <span>© 2026 CS BAT LABS OPERATIONS. PROTOCOL SHIELD ON.</span>
      </footer>

    </div>
  );
}

const styles = {
  pageContainer: { background: '#020408', color: '#eef2f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  cyberGridOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', backgroundSize: '40px 40px', zIndex: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050912', borderBottom: '1px solid rgba(243, 198, 95, 0.15)', position: 'relative', zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoRing: { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #f3c65f', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: '80%', height: '80%', objectFit: 'contain' },
  navLogoText: { fontWeight: '900', fontSize: '18px', color: '#fff', letterSpacing: '-0.5px' },
  portalTag: { color: '#f3c65f', fontSize: '10px', marginLeft: '5px', verticalAlign: 'top' },
  navLinks: { display: 'flex', gap: '30px' },
  navLink: { color: '#94a3b8', textDecoration: 'none', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', transition: '0.3s', cursor: 'pointer' },
  navActions: { display: 'flex', alignItems: 'center', gap: '20px' },
  navIcon: { color: '#f3c65f', cursor: 'pointer', fontSize: '20px', transition: '0.3s' },
  btnLoginNav: { background: 'transparent', border: '1px solid #f3c65f', color: '#f3c65f', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', transition: '0.3s' },
  masterWrapper: { flex: 1, width: '100%', maxWidth: '580px', margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', zIndex: 1 },

  orderManifestWindow: {
    background: 'linear-gradient(135deg, #060a12 0%, #0a0f1a 100%)',
    border: '1px solid rgba(243, 198, 95, 0.2)',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
    position: 'relative',
    marginBottom: '30px'
  },
  manifestHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', marginBottom: '14px' },
  manifestLabel: { fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px' },
  manifestQtyTag: { fontSize: '10px', color: '#f3c65f', fontWeight: '900', background: 'rgba(243,198,95,0.05)', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(243,198,95,0.1)' },
  manifestBody: { display: 'flex', alignItems: 'center' },
  batImageFrame: { width: '90px', height: '90px', background: '#04070d', borderRadius: '12px', border: '1px solid rgba(243, 198, 95, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' },
  batMainName: { margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px' },
  batSpecs: { margin: '4px 0 0 0', fontSize: '11.5px', color: '#475569' },
  batPriceTag: { fontSize: '16px', fontWeight: '900', color: '#f3c65f', textAlign: 'right' },
  specBadge: { background: 'rgba(243,198,95,0.1)', color: '#f3c65f', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' },

  centralCardWindow: { background: 'rgba(6, 10, 18, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid #f3c65f', boxShadow: '0 0 15px rgba(243, 198, 95, 0.15)', borderRadius: '8px', padding: '35px', boxSizing: 'border-box', position: 'relative' },
  windowMainHeading: { margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#fff', position: 'relative', zIndex: 1 },
  windowSubHeading: { margin: '0 0 25px 0', fontSize: '12px', color: '#475569', lineHeight: '1.4', position: 'relative', zIndex: 1 },
  stepFadeIn: { display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 },
  inputStack: { display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', zIndex: 2 },
  dualGridRow: { display: 'flex', gap: '16px' },
  fieldBlock: { display: 'flex', flexDirection: 'column', flex: 1 },
  decLabel: { fontSize: '11px', color: '#54657e', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' },
  decInput: { background: 'rgba(2, 4, 8, 0.7)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)', borderRadius: '4px', padding: '14px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 3, transition: '0.3s' },
  cardTypeMatrixRow: { display: 'flex', gap: '10px' },
  cartTypeTab: { flex: 1, border: '1px solid', borderRadius: '5px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.3s' },
  cardBrandName: { fontSize: '11.5px', fontWeight: '700', color: '#fff' },
  inlineSummaryTally: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020408', padding: '18px', borderRadius: '4px', marginTop: '25px', border: '1px dashed rgba(255,255,255,0.03)' },
  tallyLabel: { fontSize: '11px', fontWeight: '800', color: '#475569' },
  tallyPrice: { fontSize: '17px', fontWeight: '900', color: '#fff' },
  btnActionPrimary: { background: '#f3c65f', color: '#020408', border: 'none', width: '100%', padding: '16px', borderRadius: '4px', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer', marginTop: '25px', zIndex: 3, position: 'relative', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '1px' },
  dualActionGroup: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px' },
  btnActionSecondary: { background: 'transparent', border: 'none', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.3s' },
  btnActionPrimaryInlineGold: { background: '#f3c65f', color: '#020408', border: 'none', padding: '14px 28px', borderRadius: '4px', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '1px' },
  decFooter: { padding: '25px 6%', textAlign: 'center', borderTop: '1px solid #0f172a', fontSize: '10px', color: '#334155', fontWeight: '700', position: 'relative', zIndex: 1 }
};

export default CheckoutPage;