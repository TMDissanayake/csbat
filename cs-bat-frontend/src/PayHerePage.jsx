import React, { useState, useEffect } from 'react';

function PayHerePage({ onPaymentSuccess, onCancel, theme }) {
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: ''
  });
  
  // Validation states
  const [errors, setErrors] = useState({});
  
  // Payment processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(7);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txRef, setTxRef] = useState('');

  useEffect(() => {
    try {
      const pending = JSON.parse(localStorage.getItem('csbat_pending_order'));
      if (pending) {
        setOrderData(pending);
      } else {
        alert("No pending order found. Returning to checkout.");
        onCancel();
      }
    } catch (e) {
      console.error("Error reading pending order:", e);
      onCancel();
    }
  }, [onCancel]);

  // Card formatting & validation handlers
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Keep only digits
    if (value.length > 16) value = value.slice(0, 16);
    // Format as xxxx xxxx xxxx xxxx
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length > 0) {
      setFormData(prev => ({ ...prev, cardNumber: parts.join(' ') }));
    } else {
      setFormData(prev => ({ ...prev, cardNumber: value }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Keep only digits
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      setFormData(prev => ({ ...prev, expiry: value.slice(0, 2) + '/' + value.slice(2) }));
    } else {
      setFormData(prev => ({ ...prev, expiry: value }));
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setFormData(prev => ({ ...prev, cvv: value }));
    }
  };

  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }));
  };

  // Card type detector
  const getCardType = () => {
    const num = formData.cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const validateForm = () => {
    const newErrors = {};
    const cleanCard = formData.cardNumber.replace(/\s/g, '');
    
    if (cleanCard.length !== 16) {
      newErrors.cardNumber = 'Card number must be exactly 16 digits.';
    }
    
    const expiryParts = formData.expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiry = 'Expiry date must be in MM/YY format.';
    } else {
      const month = parseInt(expiryParts[0], 10);
      const year = parseInt(expiryParts[1], 10) + 2000;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month.';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Card has expired.';
      }
    }
    
    if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be exactly 3 digits.';
    }
    
    if (formData.cardholderName.trim().length < 3) {
      newErrors.cardholderName = 'Enter full cardholder name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Start 7-second simulation loading overlay
    setIsProcessing(true);
    setProgress(0);
    setSecondsRemaining(7);

    const startTime = Date.now();
    const duration = 7000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);
      
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setSecondsRemaining(remaining);

      if (elapsed >= duration) {
        clearInterval(timer);
        processOrderSuccess();
      }
    }, 100);
  };

  const processOrderSuccess = async () => {
    try {
      // Create random Tx Reference
      const ref = 'PH-TXN-' + Math.floor(10000000 + Math.random() * 90000000);
      setTxRef(ref);

      // Create order in DB
      const finalOrderData = {
        ...orderData,
        status: 'confirm',
        paymentMethod: 'card',
        paymentSlip: null, // Card payments don't require slip
        date: new Date().toISOString()
      };

      const res = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrderData)
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        // Clear card & cart
        localStorage.setItem('csbat_cart', '[]');
        localStorage.removeItem('csbat_pending_order');
        window.dispatchEvent(new Event('cartUpdate'));
        
        setIsProcessing(false);
        setPaymentSuccess(true);
      } else {
        alert("Server failed to register the order. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred during payment processing. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Connecting to PayHere gateway...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageBackground}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes successPop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-spin {
          animation: spin 1.2s linear infinite;
        }
        .animate-pulse-warning {
          animation: pulse 1.5s infinite ease-in-out;
        }
        .animate-success {
          animation: successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .btn-hover:hover {
          background-color: #002db3 !important;
          transform: translateY(-1px);
        }
        .cancel-btn:hover {
          background-color: #f1f5f9 !important;
        }
      `}</style>

      {/* PayHere Secured Top Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoGroup}>
            <span style={styles.payText}>Pay</span>
            <span style={styles.hereText}>Here</span>
            <span style={styles.logoDivider}>|</span>
            <span style={styles.logoTag}>Secure Payment Gateway</span>
          </div>
          <div style={styles.securitySeal}>
            <i className="bx bx-shield-quarter" style={{ fontSize: '18px', color: '#16a34a' }}></i>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>256-BIT SSL SECURE CONNECTION</span>
          </div>
        </div>
      </header>

      {/* Main Form container */}
      <main style={styles.main}>
        <div style={styles.wrapper}>
          
          {/* LEFT: Merchant and Order details */}
          <div style={styles.orderPanel}>
            <h3 style={styles.merchantTitle}>CS BAT LABS PVT LTD</h3>
            <p style={styles.merchantSubtitle}>Colombo, Sri Lanka</p>
            
            <div style={styles.divider}></div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Reference Code</span>
              <span style={styles.detailValBold}>CSB-PAY-{Date.now().toString().slice(-6)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Client Name</span>
              <span style={styles.detailVal}>{orderData.client}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Payment Currency</span>
              <span style={styles.detailVal}>LKR (Sri Lankan Rupee)</span>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.productsList}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>PAYING FOR ITEMS</span>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={styles.productItem}>
                  <span style={styles.productName}>{orderData.product}</span>
                </div>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.amountBox}>
              <span style={styles.amountLabel}>Total Payable Amount</span>
              <span style={styles.amountValue}>{orderData.price}</span>
            </div>
          </div>

          {/* RIGHT: Credit Card billing form */}
          <div style={styles.paymentPanel}>
            <div style={styles.cardHeaderRow}>
              <h4 style={styles.panelTitle}>Pay with Credit / Debit Card</h4>
              <div style={styles.cardLogoRow}>
                <svg width="34" height="22" viewBox="0 0 36 22" style={{ marginRight: '6px' }}><rect width="36" height="22" rx="3" fill="#1434CB" /><path d="M11.5 15L13.2 6.5H15.8L14.1 15H11.5ZM21.2 6.7C20.7 6.5 19.9 6.3 19.1 6.3C16.3 6.3 14.3 7.8 14.3 10C14.3 11.6 15.7 12.5 16.8 13C17.9 13.5 18.3 13.9 18.3 14.4C18.3 15.1 17.5 15.4 16.8 15.4C15.6 15.4 14.9 15.1 14.4 14.8L13.9 16.8C14.5 17.1 15.5 17.3 16.6 17.3C19.6 17.3 21.5 15.8 21.5 13.5C21.5 11.2 18.3 10.9 18.3 9.9C18.3 9.5 18.7 9.1 19.5 9.1C19.9 9.1 20.6 9.2 21.1 9.5L21.2 6.7ZM25.2 6.5L23.2 15H25.6L27.6 6.5H25.2ZM7.2 6.5L4.8 12.3L4.1 8.5C3.9 7.4 3 6.6 2 6.5V6.5L5.5 15H8.2L12.1 6.5H7.2Z" fill="white" /></svg>
                <svg width="34" height="22" viewBox="0 0 36 22"><rect width="36" height="22" rx="3" fill="#222" /><circle cx="14" cy="11" r="7" fill="#EB001B" /><circle cx="22" cy="11" r="7" fill="#F79E1B" fillOpacity="0.8" /></svg>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>CARDHOLDER NAME</label>
                <div style={styles.inputWrapper}>
                  <i className="bx bx-user" style={styles.inputIcon}></i>
                  <input
                    type="text"
                    placeholder="E.G. AIDEN STERLING"
                    value={formData.cardholderName}
                    onChange={handleNameChange}
                    style={{ ...styles.input, borderColor: errors.cardholderName ? '#ef4444' : '#cbd5e1' }}
                    disabled={isProcessing}
                    required
                  />
                </div>
                {errors.cardholderName && <span style={styles.errorText}>{errors.cardholderName}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>CARD NUMBER</label>
                <div style={styles.inputWrapper}>
                  <i className={getCardType() === 'visa' ? 'bx bxl-visa' : getCardType() === 'mastercard' ? 'bx bxl-mastercard' : 'bx bx-credit-card'} style={{ ...styles.inputIcon, color: getCardType() !== 'unknown' ? '#0038FF' : '#94a3b8', fontSize: '20px' }}></i>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    style={{ ...styles.input, paddingLeft: '40px', borderColor: errors.cardNumber ? '#ef4444' : '#cbd5e1' }}
                    disabled={isProcessing}
                    required
                  />
                </div>
                {errors.cardNumber && <span style={styles.errorText}>{errors.cardNumber}</span>}
              </div>

              <div style={styles.dualRow}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>EXPIRY DATE</label>
                  <div style={styles.inputWrapper}>
                    <i className="bx bx-calendar" style={styles.inputIcon}></i>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={handleExpiryChange}
                      maxLength="5"
                      style={{ ...styles.input, borderColor: errors.expiry ? '#ef4444' : '#cbd5e1' }}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                  {errors.expiry && <span style={styles.errorText}>{errors.expiry}</span>}
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>CVV CODE</label>
                  <div style={styles.inputWrapper}>
                    <i className="bx bx-lock" style={styles.inputIcon}></i>
                    <input
                      type="password"
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={handleCvvChange}
                      maxLength="3"
                      style={{ ...styles.input, borderColor: errors.cvv ? '#ef4444' : '#cbd5e1' }}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                  {errors.cvv && <span style={styles.errorText}>{errors.cvv}</span>}
                </div>
              </div>

              <div style={styles.secureNotice}>
                <i className="bx bx-lock-alt" style={{ color: '#16a34a', fontSize: '15px' }}></i>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>
                  Secure 3D-Authenticated checkout transaction protocol.
                </span>
              </div>

              <div style={styles.actionRow}>
                <button
                  type="button"
                  onClick={onCancel}
                  className="cancel-btn"
                  style={styles.btnCancel}
                  disabled={isProcessing}
                >
                  Cancel Payment
                </button>
                <button
                  type="submit"
                  className="btn-hover"
                  style={styles.btnPay}
                  disabled={isProcessing}
                >
                  Pay LKR {orderData.price.replace(/[^\d.,]/g, '')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* PayHere Footer */}
      <footer style={styles.footer}>
        <p>© 2026 PayHere (Pvt) Ltd. All Rights Reserved. PCI-DSS Certified Compliant Partner.</p>
      </footer>

      {/* PROCESSING MODAL OVERLAY */}
      {isProcessing && (
        <div style={styles.overlay}>
          <div style={styles.loadingBox}>
            <div className="animate-spin" style={styles.spinner}></div>
            <h3 style={styles.loadingTitle}>Processing Remittance...</h3>
            <p style={styles.loadingCountdown}>Time remaining: {secondsRemaining} seconds</p>
            
            {/* Progress bar container */}
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
            </div>

            {/* Warning alert message box */}
            <div className="animate-pulse-warning" style={styles.warningBox}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '800' }}>⚠️ CRITICAL INSTRUCTION</h4>
              <p style={{ margin: 0, fontSize: '11.5px', lineHeight: '1.4' }}>
                DO NOT refresh the page, close the browser window, or click the back button. Doing so will abort the secure payment link router and may result in duplicate authorization cycles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS MODAL OVERLAY */}
      {paymentSuccess && (
        <div style={styles.overlay}>
          <div className="animate-success" style={styles.successBox}>
            <div style={styles.successIconBox}>
              <i className="bx bx-check" style={{ fontSize: '48px', color: '#ffffff' }}></i>
            </div>
            
            <h2 style={styles.successTitle}>Payment Successful!</h2>
            <p style={styles.successSubtitle}>Your transaction has been authorized successfully by PayHere.</p>
            
            <div style={styles.receiptContainer}>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Merchant</span>
                <strong style={styles.receiptValue}>CS BAT LABS PVT LTD</strong>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Transaction Reference</span>
                <strong style={{ ...styles.receiptValue, fontFamily: 'monospace' }}>{txRef}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Amount Authorized</span>
                <strong style={{ ...styles.receiptValue, color: '#16a34a' }}>{orderData.price}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Date / Time</span>
                <strong style={styles.receiptValue}>{new Date().toLocaleString()}</strong>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>
              You will be redirected back to the CS Bat Labs Dashboard in a few seconds...
            </p>

            <button
              onClick={onPaymentSuccess}
              style={styles.btnRedirect}
            >
              Return to CS Bat Labs ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#0f172a'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(0, 56, 255, 0.1)',
    borderLeftColor: '#0038FF',
    borderRadius: '50%',
    marginBottom: '15px'
  },
  pageBackground: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#334155'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  headerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  payText: {
    fontSize: '22px',
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0038FF'
  },
  hereText: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#F7A200'
  },
  logoDivider: {
    fontSize: '18px',
    color: '#cbd5e1',
    margin: '0 12px'
  },
  logoTag: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b'
  },
  securitySeal: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f8fafc',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  main: {
    flex: 1,
    padding: '30px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    // Responsive flex wrap handled via styles if required, but standard flex desktop is fine for LKR gateways.
    '@media (max-width: 768px)': {
      flexDirection: 'column'
    }
  },
  orderPanel: {
    flex: '1.2',
    backgroundColor: '#0038FF', // Royal blue background for order details info block
    padding: '35px',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column'
  },
  merchantTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  merchantSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    margin: '20px 0'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '13px'
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  detailVal: {
    fontWeight: '600'
  },
  detailValBold: {
    fontWeight: '800',
    color: '#F7A200'
  },
  productsList: {
    flex: 1
  },
  productItem: {
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '12px'
  },
  productName: {
    fontWeight: '700',
    color: '#ffffff'
  },
  amountBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  amountLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  amountValue: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff'
  },
  paymentPanel: {
    flex: '1.5',
    padding: '35px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  panelTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a'
  },
  cardLogoRow: {
    display: 'flex',
    alignItems: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.5px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#94a3b8',
    fontSize: '18px'
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    '&:focus': {
      borderColor: '#0038FF',
      boxShadow: '0 0 0 3px rgba(0, 56, 255, 0.1)'
    }
  },
  dualRow: {
    display: 'flex',
    gap: '15px'
  },
  errorText: {
    fontSize: '11px',
    color: '#ef4444',
    fontWeight: '600',
    marginTop: '2px'
  },
  secureNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0fdf4',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #bbf7d0',
    marginTop: '5px'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    gap: '12px'
  },
  btnCancel: {
    background: 'none',
    border: '1px solid #cbd5e1',
    color: '#64748b',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    flex: '1',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  btnPay: {
    backgroundColor: '#0038FF',
    border: 'none',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    flex: '1.2',
    transition: 'all 0.2s',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0, 56, 255, 0.2)'
  },
  footer: {
    padding: '20px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#64748b',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0'
  },
  
  // Overlay processing modal styles
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '20px'
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '35px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  loadingTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0'
  },
  loadingCountdown: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 20px 0',
    fontWeight: '700'
  },
  progressContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '25px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0038FF',
    borderRadius: '3px',
    transition: 'width 0.1s linear'
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #ef4444',
    padding: '16px',
    borderRadius: '8px',
    color: '#991b1b',
    textAlign: 'left'
  },
  
  // Success box
  successBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '35px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #e2e8f0'
  },
  successIconBox: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 10px 20px rgba(22, 163, 74, 0.2)'
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 6px 0'
  },
  successSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 24px 0',
    lineHeight: '1.4'
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '18px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px'
  },
  receiptLabel: {
    color: '#64748b'
  },
  receiptValue: {
    color: '#0f172a'
  },
  btnRedirect: {
    width: '100%',
    backgroundColor: '#111827',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: '850',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textAlign: 'center'
  }
};

export default PayHerePage;
