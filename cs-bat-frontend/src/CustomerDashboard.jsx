import React, { useState, useEffect } from 'react';
import './index.css';
import logoImg from './assets/logo_new.png';

function CustomerDashboard({ onLogout, onNavToShop, onNavToHome, theme, toggleTheme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ fullName: "Loading...", email: "" });
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', city: '', postalCode: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [orders, setOrders] = useState([]);
  const steps = [
    { id: 1, label: "Order Placed", icon: "bx bx-file" }, 
    { id: 2, label: "Confirmed", icon: "bx bx-check-shield" },
    { id: 3, label: "In Production", icon: "bx bxs-wrench" }, 
    { id: 4, label: "Dispatched", icon: "bx bxs-truck" }
  ];

  const fetchUserOrders = (email) => {
    fetch(`http://localhost:5001/api/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const userOrders = data.filter(order => order.email && order.email.toLowerCase() === email.toLowerCase());
          setOrders(userOrders);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      fetch(`http://localhost:5001/api/user?email=${email}`)
        .then(res => res.json())
        .then(data => { 
          if(data) {
            setUser(data); 
            setFormData({
              fullName: data.fullName || '',
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              postalCode: data.postalCode || ''
            });
          }
        })
        .catch(err => console.error(err));

      fetchUserOrders(email);

      // Set up background polling every 5 seconds to get updates instantly
      const intervalId = setInterval(() => {
        fetchUserOrders(email);
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, []);

  const getProgressStep = (status) => {
    if (!status) return 1;
    switch (status.toLowerCase()) {
      case 'order':
      case 'pending_payment':
      case 'payment_failed':
        return 1;
      case 'confirm':
        return 2;
      case 'customize':
        return 3;
      case 'deliveried':
      case 'finish':
        return 4;
      default:
        return 1;
    }
  };

  const latestOrder = orders.length > 0 ? orders[0] : null;
  const currentOrder = latestOrder ? {
    id: latestOrder._id || "CSB-PENDING",
    model: latestOrder.product || "Custom Cricket Bat",
    progressStep: getProgressStep(latestOrder.status)
  } : null;

  const handleOpenEdit = () => {
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      postalCode: user.postalCode || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...formData
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUser({ ...user, ...formData });
        setIsEditing(false);
        alert('Profile updated successfully!');
        if (user.email) fetchUserOrders(user.email);
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile.');
    }
  };

  const isDarkMode = theme === 'dark';

  // SAME THEME COLOR PALETTE (white, blue, green, dark grey, navy dark blue)
  const colors = {
    bg: isDarkMode ? '#06080c' : '#f0f4f8',
    sidebarBg: isDarkMode ? '#0b0e14' : '#ffffff',
    cardBg: isDarkMode ? 'rgba(11, 14, 20, 0.45)' : '#ffffff',
    blockBg: isDarkMode ? 'rgba(11, 14, 20, 0.6)' : '#ffffff',
    textMain: isDarkMode ? '#ffffff' : '#1e293b',
    textMuted: '#64748b',
    border: isDarkMode ? 'rgba(243, 198, 95, 0.15)' : 'rgba(30, 58, 95, 0.12)',
    borderLight: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 58, 95, 0.08)',
    accent: isDarkMode ? '#f3c65f' : '#1e3a5f',           // Navy Dark Blue
    accentBlue: '#3b82f6',                                  // Blue
    accentGreen: '#16a34a',                                 // Green
    actionBtnBg: '#111827',                                 // Black action buttons
    actionBtnText: '#ffffff',                               // White text
    inputBg: isDarkMode ? '#06080c' : '#f8fafc',            // Input background color depending on theme
    cardShadow: isDarkMode ? 'none' : '0 10px 30px rgba(30, 58, 95, 0.05)',
  };

  const styles = getStyles(colors, theme, isDarkMode);

  const handleMobileTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div style={{...styles.dashboardContainer, background: colors.bg, color: colors.textMain}}>
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 998,
            transition: 'opacity 0.3s'
          }}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside style={{
        ...styles.sidebar,
        background: colors.sidebarBg,
        borderColor: colors.border,
        ...(isMobile ? {
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : '-280px',
          width: '270px',
          height: '100vh',
          zIndex: 999,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: sidebarOpen ? '10px 0 40px rgba(0,0,0,0.4)' : 'none'
        } : {})
      }}>
        <div>
          <div style={{...styles.sidebarBrand, cursor: 'pointer'}} onClick={onNavToHome}>
            <div style={{...styles.logoRing, borderColor: colors.border}}>
              <img src={logoImg} style={styles.sidebarLogoImg} alt="logo"/>
            </div>
            <span style={styles.brandName}>CS Bat <span style={styles.portalTag}>MEMBER</span></span>
          </div>

          <div style={styles.sidebarNav}>
            <button 
              style={{
                ...styles.navItem, 
                color: activeTab === 'dashboard' ? colors.accent : colors.textMuted, 
                ...(activeTab === 'dashboard' ? styles.navItemActive : {})
              }} 
              onClick={() => handleMobileTabClick('dashboard')}
            >
              <i className="bx bxs-dashboard" style={styles.navIcon}></i> Dashboard
            </button>
            <button 
              style={{
                ...styles.navItem, 
                color: activeTab === 'orders' ? colors.accent : colors.textMuted, 
                ...(activeTab === 'orders' ? styles.navItemActive : {})
              }} 
              onClick={() => handleMobileTabClick('orders')}
            >
              <i className="bx bx-list-check" style={styles.navIcon}></i> My Orders
            </button>
            <button 
              style={{
                ...styles.navItem, 
                color: activeTab === 'delivery' ? colors.accent : colors.textMuted, 
                ...(activeTab === 'delivery' ? styles.navItemActive : {})
              }} 
              onClick={() => handleMobileTabClick('delivery')}
            >
              <i className="bx bxs-truck" style={styles.navIcon}></i> Delivery Details
            </button>
          </div>
        </div>
        
        <div>
          <div style={{...styles.sidebarUser, background: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.8)', borderColor: colors.border}} onClick={handleOpenEdit}>
            <div style={styles.userAvatar}>👤</div>
            <div>
              <div style={{...styles.userName, color: colors.textMain}}>{user.fullName}</div>
              <div style={{...styles.userRole, color: colors.textMuted}}>Elite Member</div>
            </div>
          </div>
          
          <div style={{...styles.sidebarFooter, borderColor: colors.border}}>
            <button style={styles.logoutBtn} onClick={onLogout}>
              <i className="bx bx-power-off" style={{ marginRight: '6px' }}></i> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN PANEL CONTENT */}
      <div style={{...styles.mainContent, ...(isMobile ? { padding: '20px 16px', height: 'auto', minHeight: '100vh' } : {})}}>
        <header style={{...styles.topHeader, borderColor: colors.borderLight}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.border}`,
                  color: colors.textMain,
                  fontSize: '20px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={sidebarOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
              </button>
            )}
            <div>
              <h1 style={{...styles.welcomeTitle, fontSize: isMobile ? '20px' : '28px'}}>
                {activeTab === 'dashboard' ? `Welcome back, ${user.fullName.split(' ')[0]}` : 
                 activeTab === 'orders' ? 'My Orders' : 'Delivery Coordinates'}
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>
                {isMobile ? 'Manage configs & track orders.' : 'Manage configurations, track weapon assembly steps, and inspect invoice logs.'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={{...styles.btnThemeToggle, background: colors.sidebarBg, color: colors.textMain}} onClick={toggleTheme}>
              <i className={isDarkMode ? 'bx bxs-sun' : 'bx bxs-moon'} style={{ fontSize: '14px' }}></i>
              {isMobile ? '' : (isDarkMode ? 'LIGHT MODE' : 'DARK MODE')}
            </button>
            <button type="button" style={styles.btnNewCustom} onClick={onNavToShop}>
              <i className="bx bx-plus-circle" style={{ fontSize: '14px' }}></i> {isMobile ? 'NEW ORDER' : 'LAUNCH NEW CUSTOMIZATION'}
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* STATS METRIC GRID */}
            <section style={styles.cardsGrid}>
              <div style={{...styles.summaryCard, background: colors.cardBg, borderColor: colors.borderLight}}>
                <div style={styles.cardHeaderRow}>
                  <span style={{color: colors.textMuted}}>TOTAL BATS ORDERED</span>
                  <i className="bx bx-shopping-bag" style={{ color: colors.accentBlue, fontSize: '18px' }}></i>
                </div>
                <div style={styles.cardValue}>{String(orders.length).padStart(2, '0')}</div>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>Bespoke configurations registered</span>
              </div>
              
              <div style={{...styles.summaryCard, background: colors.cardBg, borderColor: colors.borderLight}}>
                <div style={styles.cardHeaderRow}>
                  <span style={{color: colors.textMuted}}>ACTIVE STREAM SHIPPINGS</span>
                  <i className="bx bx-time" style={{ color: colors.accentGreen, fontSize: '18px' }}></i>
                </div>
                <div style={styles.cardValue}>
                  {String(orders.filter(o => o.status !== 'deliveried' && o.status !== 'finish').length).padStart(2, '0')}
                </div>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>Items currently in assembly line</span>
              </div>
              
              <div style={{...styles.summaryCard, background: colors.cardBg, borderColor: colors.borderLight}}>
                <div style={styles.cardHeaderRow}>
                  <span style={{color: colors.textMuted}}>AUTHORIZED PROFILE SCORE</span>
                  <i className="bx bx-badge-check" style={{ color: colors.accent, fontSize: '18px' }}></i>
                </div>
                <div style={styles.cardValue}>98%</div>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>Elite member verification index</span>
              </div>
            </section>

            {/* LIVE STEP TRACKER */}
            {currentOrder ? (
              <section style={{...styles.dataBlockContainer, background: colors.blockBg, borderColor: colors.border}}>
                <div className="tracker-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px'}}>
                  <div>
                    <h2 className="tracker-title" style={{...styles.blockTitle, color: colors.textMain, margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="bx bx-sync bx-spin" style={{ color: colors.accentBlue }}></i> Live Assembly Tracker: {currentOrder.id}
                    </h2>
                    <span style={{fontSize: '13px', color: colors.textMuted, fontWeight: '700'}}>{currentOrder.model}</span>
                  </div>
                  <span style={styles.microBadge}>
                    <i className="bx bxs-zap" style={{ marginRight: '4px' }}></i> REAL-TIME MONITOR ONLINE
                  </span>
                </div>

                {/* Stepper Timeline */}
                <div className="stepper-row-container" style={styles.trackerStepperRow}>
                  {steps.map((step, index) => {
                    const isCompleted = currentOrder.progressStep > step.id;
                    const isActive = currentOrder.progressStep === step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="step-node-item" style={{
                          ...styles.stepNode,
                          opacity: (isCompleted || isActive) ? 1 : 0.45
                        }}>
                          <div style={{
                            ...styles.stepCircle,
                            background: isCompleted ? colors.accentGreen : (isActive ? colors.accent : (isDarkMode ? '#1e293b' : '#e2e8f0')),
                            borderColor: (isCompleted) ? colors.accentGreen : (isActive ? colors.accent : colors.textMuted),
                            color: isCompleted ? '#ffffff' : (isActive ? (isDarkMode ? '#06080c' : '#ffffff') : colors.textMuted),
                            boxShadow: isActive ? `0 0 16px ${colors.accent}40` : 'none'
                          }}>
                            <i className={step.icon} style={{ fontSize: '16px' }}></i>
                          </div>
                          <span style={{
                            ...styles.stepLabel,
                            color: isActive ? colors.accent : isCompleted ? colors.textMain : colors.textMuted,
                            fontWeight: isActive ? '800' : '600'
                          }}>{step.label}</span>
                        </div>

                        {index < steps.length - 1 && (
                          <div className="step-line-divider" style={{
                            ...styles.stepLine,
                            background: currentOrder.progressStep > step.id ? colors.accentGreen : (isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                            boxShadow: currentOrder.progressStep > step.id ? `0 0 8px ${colors.accentGreen}40` : 'none'
                          }}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Alert Notification Card */}
                <div style={{
                  marginTop: '32px',
                  padding: '20px 24px',
                  background: latestOrder.status === 'deliveried' ? 'rgba(22, 163, 74, 0.08)' :
                              latestOrder.status === 'payment_failed' ? 'rgba(239, 68, 68, 0.08)' :
                              latestOrder.status === 'pending_payment' ? 'rgba(245, 158, 11, 0.08)' :
                              'rgba(59, 130, 246, 0.08)',
                  borderLeft: `4px solid ${
                    latestOrder.status === 'deliveried' ? '#16a34a' :
                    latestOrder.status === 'payment_failed' ? '#ef4444' :
                    latestOrder.status === 'pending_payment' ? '#f59e0b' :
                    '#3b82f6'
                  }`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px'
                }}>
                  <i className={
                    latestOrder.status === 'deliveried' ? 'bx bxs-check-circle' :
                    latestOrder.status === 'payment_failed' ? 'bx bxs-error' :
                    latestOrder.status === 'pending_payment' ? 'bx bx-time' : 'bx bxs-info-circle'
                  } style={{
                    fontSize: '24px',
                    color: latestOrder.status === 'deliveried' ? '#16a34a' :
                           latestOrder.status === 'payment_failed' ? '#ef4444' :
                           latestOrder.status === 'pending_payment' ? '#f59e0b' : '#3b82f6'
                  }}></i>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '800', color: colors.textMain }}>
                      {latestOrder.status === 'deliveried' ? 'Status: Dispatched / Delivered' :
                       latestOrder.status === 'payment_failed' ? 'Status: Remittance Verification Failed' :
                       latestOrder.status === 'pending_payment' ? 'Status: Verifying Receipt Slip' :
                       latestOrder.status === 'confirm' ? 'Status: Payment Cleared & Queued' :
                       latestOrder.status === 'customize' ? 'Status: Lathe Structuring Active' :
                       latestOrder.status === 'finish' ? 'Status: Production Completed' :
                       'Status: Order Registered'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted, lineHeight: '1.5' }}>
                      {latestOrder.status === 'deliveried' ? 'Your bespoke weapon is out for delivery! Please expect arrival shortly at your secure coordinates.' :
                       latestOrder.status === 'payment_failed' ? 'The uploaded payment receipt could not be verified by the admin node. Please re-upload or contact support.' :
                       latestOrder.status === 'pending_payment' ? 'Remittance verification slip is currently under review by our operations team. This process usually takes less than 2 hours.' :
                       latestOrder.status === 'confirm' ? 'Your payment has been successfully authorized. Your custom order cleft has been sent to the manufacturing workflow.' :
                       latestOrder.status === 'customize' ? 'Our craftspeople are active on your profile specification. Wood carving, balancing, and molecular polishing streams are online.' :
                       latestOrder.status === 'finish' ? 'Your custom cricket bat is fully prepared and packaged. Transport logistics are coordinating routing setup.' :
                       'We have received your custom configuration specs. Please proceed with payment slip authorization if offline bank transfer was chosen.'}
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section style={{...styles.dataBlockContainer, background: colors.blockBg, borderColor: colors.border, textAlign: 'center', padding: '60px 20px'}}>
                <div style={{fontSize: '54px', marginBottom: '18px'}}>🏏</div>
                <h2 style={{...styles.blockTitle, color: colors.textMain, margin: '0 0 10px 0'}}>No Active Orders</h2>
                <p style={{fontSize: '13.5px', color: colors.textMuted, maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: '1.6'}}>
                  You haven't placed any custom orders yet. Design your own bespoke cricket bat and track its production stage!
                </p>
                <button style={styles.btnNewCustom} onClick={onNavToShop}>＋ LAUNCH NEW CUSTOMIZATION</button>
              </section>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <div style={{...styles.dataBlockContainer, background: colors.blockBg, borderColor: colors.borderLight}}>
            <h3 style={styles.blockTitle}><i className="bx bx-history" style={{ marginRight: '6px' }}></i> Invoice logs & order records</h3>
            {orders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{width: '100%', borderCollapse: 'collapse', color: colors.textMain, minWidth: '600px'}}>
                  <thead>
                    <tr style={{textAlign: 'left', color: colors.accent, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f1f5f9', height: '44px'}}>
                      <th style={{padding: '12px 16px', borderRadius: '8px 0 0 8px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px'}}>ORDER ID</th>
                      <th style={{padding: '12px 16px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px'}}>PRODUCT / MODEL</th>
                      <th style={{padding: '12px 16px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px'}}>PAYMENT METHOD</th>
                      <th style={{padding: '12px 16px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px'}}>STATUS</th>
                      <th style={{padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px'}}>DATE REGISTERED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} style={{borderTop: `1px solid ${colors.borderLight}`, transition: 'background 0.2s'}} className="table-row-hover">
                        <td style={{padding: '14px 16px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold'}}>{order._id}</td>
                        <td style={{padding: '14px 16px', fontWeight: '700'}}>{order.product}</td>
                        <td style={{padding: '14px 16px', textTransform: 'capitalize', fontSize: '13px'}}>{order.paymentMethod === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card'}</td>
                        <td style={{padding: '14px 16px'}}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: order.status === 'deliveried' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: order.status === 'deliveried' ? '#16a34a' : '#3b82f6',
                            border: `1px solid ${order.status === 'deliveried' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                          }}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{padding: '14px 16px', fontSize: '13px', color: colors.textMuted}}>{new Date(order.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '50px 20px', color: colors.textMuted}}>
                <i className="bx bx-package" style={{fontSize: '48px', display: 'block', marginBottom: '12px'}}></i>
                No order records placed yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div style={{...styles.dataBlockContainer, background: colors.blockBg, borderColor: colors.borderLight, maxWidth: '650px'}}>
            <h2 style={{...styles.blockTitle, color: colors.textMain, display: 'flex', alignItems: 'center', gap: '8px'}}>
              <i className="bx bxs-map-pin" style={{ color: colors.accentBlue }}></i> Shipping Coordinates
            </h2>
            <p style={{fontSize: '13px', color: colors.textMuted, marginBottom: '24px', lineHeight: '1.5'}}>
              Configure your primary dispatch coordinates. These profiles are automatically applied to checkout routers.
            </p>
            <form onSubmit={handleSaveProfile} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={{display: 'flex', gap: '15px', flexDirection: window.innerWidth < 500 ? 'column' : 'row'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{fontSize: '11px', color: colors.textMuted, fontWeight: '800', letterSpacing: '0.5px'}}>FULL NAME</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    style={styles.inputField} 
                    placeholder="Aiden Sterling"
                    required 
                  />
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{fontSize: '11px', color: colors.textMuted, fontWeight: '800', letterSpacing: '0.5px'}}>SECURE TELEPHONE</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    style={styles.inputField} 
                    placeholder="+94 7X XXX XXXX"
                    required
                  />
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                <label style={{fontSize: '11px', color: colors.textMuted, fontWeight: '800', letterSpacing: '0.5px'}}>STREET DISPATCH ADDRESS</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  style={styles.inputField} 
                  placeholder="No. 45, Core Axis Avenue"
                  required
                />
              </div>

              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{fontSize: '11px', color: colors.textMuted, fontWeight: '800', letterSpacing: '0.5px'}}>CITY</label>
                  <input 
                    type="text" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    style={styles.inputField} 
                    placeholder="Colombo"
                    required
                  />
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{fontSize: '11px', color: colors.textMuted, fontWeight: '800', letterSpacing: '0.5px'}}>POSTAL CODE</label>
                  <input 
                    type="text" 
                    value={formData.postalCode} 
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})} 
                    style={styles.inputField} 
                    placeholder="00100"
                    required
                  />
                </div>
              </div>

              <button type="submit" style={styles.saveBtn}>
                <i className="bx bx-save" style={{ marginRight: '6px' }}></i> SAVE COORDINATES
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Profile details editor modal */}
      {isEditing && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalBox, background: colors.sidebarBg, color: colors.textMain, borderColor: colors.border}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{color: colors.accent, margin: 0, fontSize: '18px', fontWeight: '800'}}><i className="bx bxs-user-detail" style={{ marginRight: '6px' }}></i>Edit Profile Details</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '20px', cursor: 'pointer' }}><i className="bx bx-x"></i></button>
            </div>
            <form onSubmit={handleSaveProfile} style={{display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left'}}>
              
              <div>
                <label style={{fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '0.5px'}}>FULL NAME</label>
                <input 
                  type="text" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                  style={styles.inputField} 
                  required 
                />
              </div>

              <div>
                <label style={{fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '0.5px'}}>PHONE NUMBER</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  style={styles.inputField} 
                />
              </div>

              <div>
                <label style={{fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '0.5px'}}>DELIVERY ADDRESS</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  style={styles.inputField} 
                />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={{fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '0.5px'}}>CITY</label>
                  <input 
                    type="text" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    style={styles.inputField} 
                  />
                </div>
                <div style={{flex: 1}}>
                  <label style={{fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '0.5px'}}>POSTAL CODE</label>
                  <input 
                    type="text" 
                    value={formData.postalCode} 
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})} 
                    style={styles.inputField} 
                  />
                </div>
              </div>

              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} style={{...styles.cancelBtn, color: colors.textMain, borderColor: colors.borderLight}}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const getStyles = (colors, theme, isDarkMode) => ({
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: "'Plus Jakarta Sans', 'Google Sans', 'Product Sans', sans-serif",
    transition: 'background 0.3s, color 0.3s'
  },
  sidebar: {
    width: '260px',
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    height: '100vh',
    boxSizing: 'border-box',
    zIndex: 50,
    transition: 'background 0.3s, border-color 0.3s, left 0.3s'
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoRing: {
    background: isDarkMode ? 'rgba(243, 198, 95, 0.03)' : 'rgba(30, 58, 95, 0.05)',
    border: `1px solid ${colors.border}`,
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sidebarLogoImg: {
    width: '30px',
    height: '30px',
    objectFit: 'contain',
  },
  brandName: {
    fontSize: '17px',
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: '0.5px'
  },
  portalTag: {
    fontSize: '9px',
    color: isDarkMode ? '#f3c65f' : '#ffffff',
    background: isDarkMode ? 'rgba(243,198,95,0.12)' : colors.accent,
    padding: '1px 6px',
    borderRadius: '3px',
    fontWeight: 'bold',
    marginLeft: '4px'
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navIcon: {
    fontSize: '18px',
  },
  sidebarUser: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '14px', 
    borderRadius: '12px',
    cursor: 'pointer',
    border: `1px solid ${colors.borderLight}`,
    transition: 'all 0.2s'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    background: isDarkMode ? 'rgba(243, 198, 95, 0.05)' : 'rgba(30, 58, 95, 0.06)',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    color: colors.textMain
  },
  userName: {
    fontSize: '13px',
    fontWeight: '800',
  },
  userRole: {
    fontSize: '11px',
    fontWeight: '600'
  },
  mainContent: {
    flex: 1,
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 5,
    boxSizing: 'border-box',
    overflowY: 'auto',
    height: '100vh'
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.borderLight}`,
    paddingBottom: '20px',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  welcomeTitle: {
    fontSize: '28px',
    margin: '0 0 4px 0',
    fontWeight: '900',
    letterSpacing: '-0.5px'
  },
  btnThemeToggle: {
    border: `1px solid ${colors.border}`,
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  btnNewCustom: {
    background: colors.actionBtnBg,
    color: colors.actionBtnText,
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '11px',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  cardsGrid: {
    display: 'flex',
    gap: '20px',
    marginBottom: '28px',
    flexDirection: window.innerWidth < 768 ? 'column' : 'row'
  },
  summaryCard: {
    flex: 1,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '16px',
    padding: '20px',
    boxShadow: colors.cardShadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1px',
  },
  cardValue: {
    fontSize: '32px',
    fontWeight: '900',
    color: colors.textMain,
    margin: '4px 0'
  },
  dataBlockContainer: {
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '20px',
    padding: '28px',
    boxShadow: colors.cardShadow,
    marginBottom: '28px',
    boxSizing: 'border-box',
  },
  blockTitle: {
    fontSize: '17px',
    fontWeight: '800',
    margin: '0 0 20px 0',
  },
  microBadge: {
    fontSize: '9px',
    fontFamily: 'monospace',
    background: isDarkMode ? 'rgba(243,198,95,0.08)' : 'rgba(30,58,95,0.06)',
    color: colors.accent,
    border: `1px solid ${colors.borderLight}`,
    padding: '3px 8px',
    borderRadius: '6px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center'
  },
  trackerStepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 10px',
    position: 'relative',
    flexWrap: window.innerWidth < 600 ? 'wrap' : 'nowrap',
    gap: window.innerWidth < 600 ? '20px' : '0'
  },
  stepNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
    transition: 'opacity 0.3s',
    minWidth: '80px'
  },
  stepCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '13px',
    marginBottom: '10px',
    border: '2px solid',
    transition: 'all 0.3s'
  },
  stepLabel: {
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },
  stepLine: {
    flex: 1,
    height: '3px',
    margin: '0 10px',
    transform: 'translateY(-14px)',
    zIndex: 1,
    transition: 'background 0.3s',
    display: window.innerWidth < 600 ? 'none' : 'block'
  },
  sidebarFooter: {
    paddingTop: '20px',
    borderTop: `1px solid ${colors.borderLight}`,
    marginTop: '15px'
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#ef4444',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  navItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    background: 'transparent', 
    border: 'none', 
    padding: '11px 14px', 
    width: '100%', 
    textAlign: 'left', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    marginBottom: '4px'
  },
  navItemActive: { 
    background: isDarkMode ? 'rgba(243, 198, 95, 0.08)' : 'rgba(30, 58, 95, 0.08)', 
    border: isDarkMode ? '1px solid rgba(243, 198, 95, 0.2)' : '1px solid rgba(30, 58, 95, 0.15)',
    fontWeight: '700',
  },
  inputField: { 
    width: '100%', 
    padding: '11px 14px', 
    borderRadius: '8px', 
    border: `1px solid ${colors.borderLight}`, 
    background: colors.inputBg, 
    color: colors.textMain, 
    outline: 'none', 
    fontSize: '13px', 
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  saveBtn: { 
    background: colors.actionBtnBg, 
    border: 'none', 
    color: colors.actionBtnText, 
    padding: '12px 24px', 
    cursor: 'pointer', 
    borderRadius: '8px', 
    fontWeight: '800', 
    fontSize: '12px',
    transition: 'opacity 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  cancelBtn: { 
    background: 'transparent', 
    border: `1px solid ${colors.borderLight}`, 
    padding: '12px 24px', 
    cursor: 'pointer', 
    borderRadius: '8px', 
    fontWeight: '700', 
    fontSize: '12px',
    transition: 'all 0.2s' 
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', 
    zIndex: 9999, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backdropFilter: 'blur(5px)',
    padding: '20px'
  },
  modalBox: { 
    padding: '30px', 
    borderRadius: '16px', 
    width: '100%', 
    maxWidth: '450px', 
    border: `1px solid ${colors.border}`, 
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    boxSizing: 'border-box'
  }
});

export default CustomerDashboard;