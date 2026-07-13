import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';
import logoImg from './assets/logo_new.png';

function AdminDashboard({ theme, toggleTheme, onLogout, onNavToShop, onNavToHome }) {
  const isDarkMode = theme === 'dark';

  // Responsive States
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 576);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [allProducts, setAllProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [imageBase64, setImageBase64] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [bankSettings, setBankSettings] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountName: '',
    qrText: ''
  });
  const [bankSaveStatus, setBankSaveStatus] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Custom Clefts',
    price: '',
    woodType: 'premium',
    description: '',
    tag: '',
    batHeight: '33',
    batWeight: '650',
    edgeSize: '',
    stockCount: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    woodType: '',
    description: '',
    tag: '',
    batHeight: '',
    batWeight: '',
    edgeSize: '',
    image: '',
    stockCount: ''
  });
  const [editImageBase64, setEditImageBase64] = useState('');

  // Convert image 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEditImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  // Fetch  products from DB
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setAllProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bank-details');
      const data = await res.json();
      if (data && data.bankName) {
        setBankSettings(data);
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setBankSaveStatus('saving');
    try {
      const res = await fetch('http://localhost:5001/api/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankSettings)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBankSaveStatus('saved');
        setTimeout(() => setBankSaveStatus(''), 3000);
      } else {
        setBankSaveStatus('error');
      }
    } catch (err) {
      console.error('Error saving bank details:', err);
      setBankSaveStatus('error');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchBankDetails();
  }, []);

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch('http://localhost:5001/api/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      let formattedPrice = editProduct.price;
      const cleanNum = parseFloat(formattedPrice.toString().replace(/[Rr][Ss]\.?\s*/g, '').replace(/,/g, '').trim());
      if (!isNaN(cleanNum)) {
        formattedPrice = `Rs.${cleanNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      const payload = {
        id: editProduct.id,
        name: editProduct.name,
        category: editProduct.category,
        price: formattedPrice,
        woodType: editProduct.woodType,
        description: editProduct.description,
        tag: editProduct.tag,
        image: editImageBase64 || editProduct.image || '',
        batHeight: editProduct.batHeight || '33',
        batWeight: editProduct.batWeight || '650',
        edgeSize: editProduct.edgeSize || '',
        stockCount: editProduct.stockCount !== '' ? parseInt(editProduct.stockCount) : 0
      };

      const response = await fetch('http://localhost:5001/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Product updated successfully!');
        setIsEditModalOpen(false);
        setEditProduct({
          id: '',
          name: '',
          category: '',
          price: '',
          woodType: '',
          description: '',
          tag: '',
          batHeight: '',
          batWeight: '',
          edgeSize: '',
          image: '',
          stockCount: ''
        });
        setEditImageBase64('');
        fetchProducts();
      } else {
        alert('Failed to update product.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedPrice = `Rs.${parseFloat(newProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        price: formattedPrice,
        woodType: newProduct.woodType,
        description: newProduct.description,
        tag: newProduct.tag,
        image: imageBase64 || '',
        batHeight: newProduct.batHeight || '33',
        batWeight: newProduct.batWeight || '650',
        edgeSize: newProduct.edgeSize || '',
        stockCount: newProduct.stockCount !== '' ? parseInt(newProduct.stockCount) : 0,
        isFavorite: false
      };

      const response = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Product registered successfully!');
        setNewProduct({
          name: '',
          category: 'Custom Clefts',
          price: '',
          woodType: '',
          description: '',
          tag: '',
          batHeight: '33',
          batWeight: '650',
          edgeSize: '',
          stockCount: ''
        });
        setImageBase64('');
        fetchProducts();
        setActiveView('manage-products');
      } else {
        alert('Failed to register product.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };


  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth <= 992;
      const smallMobileCheck = window.innerWidth <= 576;
      setIsMobile(mobileCheck);
      setIsSmallMobile(smallMobileCheck);
      if (!mobileCheck) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('http://localhost:5001/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchOrders();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };


  const [productionOrders] = useState([
    { id: "CSB-9081", client: "M.R. Perera", type: "Softball Bat", spec: "Light-ball Speed Profile", status: "Lathe Structuring", tracking: "SMS Sent" },
    { id: "CSB-9082", client: "S.K. Silva", type: "Custom Cleft", spec: "English Willow Grade 1+", status: "Molecular Polish", tracking: "Queued" },
    { id: "CSB-9083", client: "K. Rajapaksa", type: "Hardwood Bat", spec: "Rigid Net-Training Spec", status: "Completed", tracking: "Delivered" },
  ]);

  // Analytics Calculations
  const totalRevenue = orders.filter(o => o.status === 'confirm' || o.status === 'customize' || o.status === 'finish' || o.status === 'deliveried')
    .reduce((sum, o) => {
      const priceStr = o.price ? o.price.toString().replace(/[Rr][Ss]\.?\s*/g, '').replace(/,/g, '').trim() : '0';
      return sum + parseFloat(priceStr || 0);
    }, 0);

  const activeOrdersCount = orders.filter(o => o.status !== 'deliveried').length;
  const inProductionCount = orders.filter(o => o.status === 'customize').length;
  const overdueDeliveries = orders.filter(o => {
    if (o.status !== 'customize' && o.status !== 'finish') return false;
    const confirmDate = new Date(o.confirmDate || o.date);
    const daysPassed = Math.floor((new Date() - confirmDate) / (1000 * 60 * 60 * 24));
    return daysPassed >= 3;
  }).length;

  const salesByDate = {};
  orders.forEach(o => {
    const dateStr = new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + 1;
  });
  const salesData = Object.keys(salesByDate).map(date => ({ date, orders: salesByDate[date] })).slice(-7);

  // Order Summary analytics (replacing pie chart)
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'order' || o.status === 'pending_payment').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'confirm').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'deliveried').length;
  const finishedOrdersCount = orders.filter(o => o.status === 'finish').length;

  // Download / Print utility
  const handleDownloadPrint = (title, contentHTML) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} — CS Bat Labs</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; }
          .print-header h1 { font-size: 24px; color: #1e3a5f; }
          .print-header .date { font-size: 13px; color: #64748b; }
          .print-logo { font-size: 20px; font-weight: 900; color: #1e3a5f; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f1f5f9; color: #1e3a5f; padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
          tr:nth-child(even) { background: #f8fafc; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
          .summary-card .value { font-size: 28px; font-weight: 800; color: #1e3a5f; }
          .summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
          .print-footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <div class="print-logo">CS BAT LABS</div>
            <h1>${title}</h1>
          </div>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
        </div>
        ${contentHTML}
        <div class="print-footer">© ${new Date().getFullYear()} CS Bat Labs — Confidential Business Report</div>
        <script>setTimeout(() => window.print(), 500);<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintOrderSummary = () => {
    const content = `
      <div class="summary-grid">
        <div class="summary-card"><div class="value">${totalOrdersCount}</div><div class="label">Total Orders</div></div>
        <div class="summary-card"><div class="value">${pendingOrdersCount}</div><div class="label">Pending</div></div>
        <div class="summary-card"><div class="value">${inProductionCount}</div><div class="label">In Production</div></div>
        <div class="summary-card"><div class="value">${confirmedOrdersCount}</div><div class="label">Confirmed</div></div>
        <div class="summary-card"><div class="value">${deliveredOrdersCount}</div><div class="label">Delivered</div></div>
        <div class="summary-card"><div class="value">Rs.${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div><div class="label">Total Revenue</div></div>
      </div>
    `;
    handleDownloadPrint('Order Summary Report', content);
  };

  const handlePrintOrderHistory = () => {
    const rows = orders.map(o => `
      <tr>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>${o.client || '—'}</td>
        <td>${o.product || '—'}</td>
        <td>${o.price || '—'}</td>
        <td>${(o.status || 'order').toUpperCase()}</td>
      </tr>
    `).join('');
    const content = `
      <table>
        <thead><tr><th>Date</th><th>Client</th><th>Product</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:30px;">No orders found</td></tr>'}</tbody>
      </table>
    `;
    handleDownloadPrint('Order History Report', content);
  };

  const handlePrintRevenue = () => {
    const revenueOrders = orders.filter(o => o.status === 'deliveried' || o.status === 'finish');
    const rows = revenueOrders.map(o => `
      <tr>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>${o.client || '—'}</td>
        <td>${o.product || '—'}</td>
        <td>${o.price || '—'}</td>
        <td>${(o.status || '').toUpperCase()}</td>
      </tr>
    `).join('');
    const content = `
      <div class="summary-grid">
        <div class="summary-card"><div class="value">Rs.${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div><div class="label">Total Revenue</div></div>
        <div class="summary-card"><div class="value">${revenueOrders.length}</div><div class="label">Completed Orders</div></div>
        <div class="summary-card"><div class="value">${totalOrdersCount}</div><div class="label">All Orders</div></div>
      </div>
      <h3 style="margin: 20px 0 10px; font-size: 16px; color: #1e3a5f;">Revenue Generating Orders</h3>
      <table>
        <thead><tr><th>Date</th><th>Client</th><th>Product</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:30px;">No revenue orders found</td></tr>'}</tbody>
      </table>
    `;
    handleDownloadPrint('Revenue Report', content);
  };

  const handlePrintProduction = () => {
    const prodOrders = orders.filter(o => o.status === 'customize' || o.status === 'finish' || o.status === 'confirm');
    const rows = prodOrders.map(o => `
      <tr>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>${o.client || '—'}</td>
        <td>${o.product || '—'}</td>
        <td>${(o.status || '').toUpperCase()}</td>
        <td>${o.address || '—'}</td>
      </tr>
    `).join('');
    const content = `
      <div class="summary-grid">
        <div class="summary-card"><div class="value">${orders.filter(o => o.status === 'confirm').length}</div><div class="label">Waiting Production</div></div>
        <div class="summary-card"><div class="value">${inProductionCount}</div><div class="label">In Production</div></div>
        <div class="summary-card"><div class="value">${orders.filter(o => o.status === 'finish').length}</div><div class="label">Finished</div></div>
      </div>
      <h3 style="margin: 20px 0 10px; font-size: 16px; color: #1e3a5f;">Production Orders</h3>
      <table>
        <thead><tr><th>Date</th><th>Client</th><th>Product</th><th>Status</th><th>Address</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:30px;">No production orders</td></tr>'}</tbody>
      </table>
    `;
    handleDownloadPrint('Production Workflow Report', content);
  };


  // NEW COLOR THEME: white, blue, green, dark grey, navy dark blue
  const colors = {
    bg: isDarkMode ? '#06080c' : '#f0f4f8',
    sidebarBg: isDarkMode ? '#0b0e14' : '#ffffff',
    cardBg: isDarkMode ? 'rgba(11, 14, 20, 0.45)' : '#ffffff',
    blockBg: isDarkMode ? 'rgba(11, 14, 20, 0.6)' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1e293b',
    textMuted: isDarkMode ? '#64748b' : '#64748b',
    textDark: isDarkMode ? '#cbd5e1' : '#334155',
    border: isDarkMode ? 'rgba(243, 198, 95, 0.15)' : 'rgba(30, 58, 95, 0.15)',
    borderLight: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30, 58, 95, 0.1)',
    inputBg: isDarkMode ? '#06080c' : '#f8fafc',
    accent: isDarkMode ? '#f3c65f' : '#1e3a5f',       // navy dark blue for light
    accentBlue: '#3b82f6',                              // blue
    accentGreen: '#16a34a',                             // green
    accentNavy: '#1e3a5f',                              // navy dark blue
    accentDarkGrey: '#374151',                          // dark grey
    accentHover: isDarkMode ? 'rgba(243, 198, 95, 0.15)' : 'rgba(30, 58, 95, 0.08)',
    userBox: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.8)',
    actionBtnBg: '#111827',                             // black for action buttons
    actionBtnText: '#ffffff',                           // white text for action buttons
    cardShadow: isDarkMode ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 20px rgba(30, 58, 95, 0.08)',
  };

  // Mobile bottom nav items
  const mobileNavItems = [
    { view: 'dashboard', icon: 'bx bxs-dashboard', label: 'Dashboard' },
    { view: 'add-product', icon: 'bx bx-plus-circle', label: 'Add' },
    { view: 'manage-products', icon: 'bx bxs-box', label: 'Products' },
    { view: 'manage-orders', icon: 'bx bx-list-check', label: 'Orders' },
    { view: 'production-workflow', icon: 'bx bxs-factory', label: 'Production' },
  ];

  const getStyles = () => ({
    dashboardContainer: {
      display: 'flex',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
      flexDirection: 'row',
    },
    cyberGridOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: isDarkMode
        ? 'linear-gradient(rgba(243, 198, 95, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 198, 95, 0.01) 1px, transparent 1px)'
        : 'none',
      backgroundSize: '30px 30px',
      pointerEvents: 'none',
      zIndex: 1
    },
    sidebar: {
      width: '260px',
      background: colors.sidebarBg,
      borderRight: `1px solid ${colors.border}`,
      display: isMobile ? (sidebarOpen ? 'flex' : 'none') : 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      boxSizing: 'border-box',
      zIndex: 99,
      position: 'fixed',
      top: 0, bottom: 0, left: 0,
      height: '100vh',
      boxShadow: isMobile ? '4px 0 30px rgba(0,0,0,0.15)' : (isDarkMode ? 'none' : '2px 0 20px rgba(30, 58, 95, 0.05)'),
      overflowY: 'auto'
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
    brandTextContainer: {
      display: 'flex',
      flexDirection: 'column',
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
      background: isDarkMode ? 'rgba(243,198,95,0.12)' : colors.accentNavy,
      border: isDarkMode ? '1px solid rgba(243,198,95,0.25)' : 'none',
      padding: '1px 6px',
      borderRadius: '3px',
      fontWeight: 'bold',
      marginLeft: '4px'
    },
    brandSubtitle: {
      fontSize: '11px',
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: '2px'
    },
    sidebarNav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: colors.textMuted,
      textDecoration: 'none',
      padding: '11px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s',
      letterSpacing: '0.3px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%'
    },
    navItemActive: {
      background: isDarkMode ? 'rgba(243, 198, 95, 0.08)' : 'rgba(30, 58, 95, 0.08)',
      border: isDarkMode ? '1px solid rgba(243, 198, 95, 0.2)' : '1px solid rgba(30, 58, 95, 0.15)',
      color: colors.accent,
      fontWeight: '700',
    },
    navIcon: {
      fontSize: '18px',
    },
    sidebarUser: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: colors.userBox,
      padding: '14px',
      borderRadius: '10px',
      border: `1px solid ${colors.borderLight}`,
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      background: isDarkMode ? 'rgba(243, 198, 95, 0.05)' : 'rgba(30, 58, 95, 0.06)',
      border: isDarkMode ? '1px solid rgba(243, 198, 95, 0.2)' : '1px solid rgba(30, 58, 95, 0.15)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontSize: '16px',
      color: colors.text
    },
    onlineStatusDot: {
      position: 'absolute',
      bottom: '0',
      right: '2px',
      color: '#16a34a',
      fontSize: '12px',
      textShadow: '0 0 8px #16a34a'
    },
    userName: {
      fontSize: '12px',
      fontWeight: '800',
      color: colors.text
    },
    userRole: {
      fontSize: '11px',
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: '1px'
    },
    mainContent: {
      flex: 1,
      padding: isMobile ? '20px 16px 90px 16px' : '32px 36px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 5,
      boxSizing: 'border-box',
      width: isMobile ? '100%' : 'calc(100% - 260px)',
      marginLeft: isMobile ? '0' : '260px',
      minHeight: '100vh'
    },
    topHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      borderBottom: `1px solid ${colors.borderLight}`,
      paddingBottom: '20px',
      marginBottom: '28px',
      gap: isMobile ? '16px' : '0'
    },
    headerTitleBlock: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    btnHamburger: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.sidebarBg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      fontSize: '20px',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    pageTitle: {
      fontSize: isMobile ? '22px' : '28px',
      margin: '0 0 4px 0',
      fontWeight: '900',
      letterSpacing: '-0.5px',
      color: colors.accentNavy
    },
    pageSubtitle: {
      color: colors.textMuted,
      fontSize: '13px',
      margin: 0,
    },
    headerButtons: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    btnThemeToggle: {
      background: colors.sidebarBg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      padding: '10px 14px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flex: isMobile ? '1' : 'none',
      justifyContent: 'center'
    },
    btnExport: {
      background: 'transparent',
      color: colors.text,
      border: `1px solid ${colors.borderLight}`,
      padding: '10px 18px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      flex: isMobile ? '1' : 'none',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      justifyContent: 'center'
    },
    btnNewOrder: {
      background: colors.actionBtnBg,
      color: colors.actionBtnText,
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '800',
      letterSpacing: '0.5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      justifyContent: 'center'
    },
    cardsGrid: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '16px',
      marginBottom: '28px',
    },
    summaryCard: {
      flex: 1,
      background: colors.cardBg,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: '12px',
      padding: '20px',
      backdropFilter: 'blur(10px)',
      boxShadow: colors.cardShadow,
      display: 'flex',
      flexDirection: 'column'
    },
    cardHeaderRow: {
      display: 'flex',
      justifyContent: 'space-between',
      color: colors.textMuted,
      fontSize: '10px',
      fontWeight: '800',
      letterSpacing: '1px',
      marginBottom: '12px',
    },
    cardLabel: {
      color: colors.textMuted
    },
    cardValue: {
      fontSize: '26px',
      fontWeight: '900',
      color: colors.text,
      marginBottom: '4px',
      letterSpacing: '-0.5px'
    },
    cardStat: {
      fontSize: '11px',
      color: colors.textMuted,
      fontWeight: '600'
    },
    glassPanel: {
      background: colors.cardBg,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${colors.borderLight}`,
      borderRadius: '12px',
      padding: isMobile ? '16px' : '22px',
      boxShadow: colors.cardShadow,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    },
    twoColumnGrid: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '25px',
      marginBottom: '35px'
    },
    dataBlockContainer: {
      flex: 1,
      background: colors.blockBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: isMobile ? '16px' : '28px',
      boxShadow: colors.cardShadow,
      boxSizing: 'border-box'
    },
    blockTitle: {
      fontSize: '17px',
      fontWeight: '800',
      color: colors.text,
      margin: '0 0 22px 0',
      letterSpacing: '-0.3px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '18px',
      alignItems: 'start'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    inputLabel: {
      fontSize: '10px',
      color: colors.textMuted,
      fontWeight: '800',
      letterSpacing: '0.5px'
    },
    formInput: {
      background: colors.inputBg,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: '8px',
      padding: '11px 14px',
      color: colors.text,
      fontSize: '13px',
      outline: 'none',
    },
    formSelect: {
      background: colors.inputBg,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: '8px',
      padding: '11px 14px',
      color: colors.text,
      fontSize: '13px',
      outline: 'none',
    },
    btnSubmitProduct: {
      background: colors.actionBtnBg,
      border: 'none',
      color: colors.actionBtnText,
      padding: '14px',
      borderRadius: '8px',
      fontWeight: '800',
      fontSize: '11px',
      letterSpacing: '1px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    radarPlaceholderBox: {
      height: '240px',
      background: colors.inputBg,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: '8px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    radarLine: {
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${isDarkMode ? 'rgba(243,198,95,0.4)' : 'rgba(30, 58, 95, 0.2)'}, transparent)`,
    },
    radarCoreCircle: {
      width: '120px',
      height: '120px',
      border: `1px dashed ${colors.border}`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    radarMetricsOverlay: {
      position: 'absolute',
      bottom: '15px',
      left: '15px',
      right: '15px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '5px' : '0',
      justifyContent: 'space-between',
      background: colors.sidebarBg,
      padding: '10px 15px',
      borderRadius: '6px',
      border: `1px solid ${colors.borderLight}`
    },
    radarMetricRow: {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: colors.textMuted
    },
    microBadge: {
      fontSize: '9px',
      fontFamily: 'monospace',
      background: 'rgba(22,163,74,0.12)',
      color: '#16a34a',
      border: '1px solid rgba(22,163,74,0.2)',
      padding: '2px 6px',
      borderRadius: '3px'
    },
    tableResponsiveWrapper: {
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      background: isDarkMode ? colors.cardBg : '#ffffff',
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      boxShadow: colors.cardShadow,
    },
    productionTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      minWidth: '700px'
    },
    tableTh: {
      padding: '14px 18px',
      borderBottom: `2px solid ${colors.borderLight}`,
      fontSize: '10px',
      fontWeight: '900',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f1f5f9',
      color: isDarkMode ? colors.textMuted : '#1e3a5f'
    },
    tableTr: {
      borderBottom: `1px solid ${colors.borderLight}`,
      transition: 'background 0.2s',
    },
    tableTd: {
      padding: '12px 18px',
      fontSize: '13px',
      color: colors.textDark,
      verticalAlign: 'middle'
    },
    statusBadge: {
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '700',
      display: 'inline-block'
    },
    dashFooter: {
      borderTop: `1px solid ${colors.border}`,
      paddingTop: '25px',
      marginTop: '40px',
    },
    footerTopRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '30px'
    },
    footerLinksGroup: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '25px' : '50px',
      width: isMobile ? '100%' : 'auto'
    },
    footerLinksCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    footerLinksTitle: {
      fontSize: '10px',
      color: colors.textMuted,
      fontWeight: '800',
      letterSpacing: '1px',
      marginBottom: '4px',
    },
    footerLinkItem: {
      color: colors.textMuted,
      textDecoration: 'none',
      fontSize: '12px',
      fontWeight: '600',
    },
    sidebarOverlay: {
      display: isMobile && sidebarOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 90
    },
    // Mobile bottom navbar
    mobileBottomNav: {
      display: isMobile ? 'flex' : 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: isDarkMode ? '#0b0e14' : '#ffffff',
      borderTop: `1px solid ${colors.border}`,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 100,
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 4px',
    },
    mobileNavBtn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: '8px',
      minWidth: '56px',
      transition: 'all 0.2s',
    },
    mobileNavIcon: {
      fontSize: '22px',
    },
    mobileNavLabel: {
      fontSize: '9px',
      fontWeight: '700',
      letterSpacing: '0.3px',
    },
  });

  const activeStyles = getStyles();

  // Section heading component for consistency
  const SectionHeading = ({ icon, iconColor, children }) => (
    <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <i className={icon} style={{ color: iconColor || colors.accentBlue, fontSize: '18px' }}></i>
      {children}
    </h3>
  );

  return (
    <div style={activeStyles.dashboardContainer}>


      <div style={activeStyles.cyberGridOverlay}></div>


      <div style={activeStyles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>


      <aside style={activeStyles.sidebar}>
        <div>

          <div style={{ ...activeStyles.sidebarBrand, cursor: 'pointer' }} onClick={onNavToHome}>
            <div style={activeStyles.logoRing}>
              <img src={logoImg} alt="CS Bat" style={activeStyles.sidebarLogoImg} />
            </div>
            <div style={activeStyles.brandTextContainer}>
              <span style={activeStyles.brandName}>CS Bat <span style={activeStyles.portalTag}>CORE</span></span>
              <span style={activeStyles.brandSubtitle}>Precision Telemetry</span>
            </div>
          </div>

          {/* MAIN NAV LINKS */}
          <nav style={activeStyles.sidebarNav}>
            <button
              onClick={() => { setActiveView('dashboard'); setSidebarOpen(false); }}
              style={{ ...activeStyles.navItem, ...(activeView === 'dashboard' ? activeStyles.navItemActive : {}) }}
            >
              <i className="bx bxs-dashboard" style={activeStyles.navIcon}></i> Dashboard Core
            </button>
            <button
              onClick={() => { setActiveView('add-product'); setSidebarOpen(false); }}
              style={{ ...activeStyles.navItem, ...(activeView === 'add-product' ? activeStyles.navItemActive : {}) }}
            >
              <i className="bx bx-plus-circle" style={activeStyles.navIcon}></i> Add New Product
            </button>
            <button
              onClick={() => { setActiveView('manage-products'); setSidebarOpen(false); }}
              style={{ ...activeStyles.navItem, ...(activeView === 'manage-products' ? activeStyles.navItemActive : {}) }}
            >
              <i className="bx bxs-box" style={activeStyles.navIcon}></i> Manage Products
            </button>
            <button
              onClick={() => { setActiveView('manage-orders'); setSidebarOpen(false); }}
              style={{ ...activeStyles.navItem, ...(activeView === 'manage-orders' ? activeStyles.navItemActive : {}) }}
            >
              <i className="bx bx-list-check" style={activeStyles.navIcon}></i> Manage Orders
            </button>
            <button
              onClick={() => { setActiveView('production-workflow'); setSidebarOpen(false); }}
              style={{ ...activeStyles.navItem, ...(activeView === 'production-workflow' ? activeStyles.navItemActive : {}) }}
            >
              <i className="bx bxs-factory" style={activeStyles.navIcon}></i> Production Workflow
            </button>

            <button
              onClick={() => { setActiveView('bank-settings'); setSidebarOpen(false); }}
              style={{ ...activeStyles.navItem, ...(activeView === 'bank-settings' ? activeStyles.navItemActive : {}) }}
            >
              <i className="bx bxs-bank" style={activeStyles.navIcon}></i> Bank Settings
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              style={activeStyles.navItem}
            >
              <i className="bx bxs-cog" style={activeStyles.navIcon}></i> System Settings
            </button>
            <button
              onClick={onLogout}
              style={{ ...activeStyles.navItem, color: '#ef4444' }}
            >
              <i className="bx bx-power-off" style={activeStyles.navIcon}></i> Log Out
            </button>
          </nav>
        </div>

        {/* OPERATOR SYSTEM PROFILE */}
        <div style={activeStyles.sidebarUser}>
          <div style={activeStyles.userAvatar}>
            <span style={activeStyles.onlineStatusDot}>●</span>
            👤
          </div>
          <div>
            <div style={activeStyles.userName}>R.M.S.L. Rathnayake</div>
            <div style={activeStyles.userRole}>System Operator</div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div style={activeStyles.mobileBottomNav}>
        {mobileNavItems.map(item => (
          <button
            key={item.view}
            onClick={() => { setActiveView(item.view); setSidebarOpen(false); }}
            style={{
              ...activeStyles.mobileNavBtn,
              color: activeView === item.view ? colors.accent : colors.textMuted,
              background: activeView === item.view ? colors.accentHover : 'transparent',
            }}
          >
            <i className={item.icon} style={activeStyles.mobileNavIcon}></i>
            <span style={activeStyles.mobileNavLabel}>{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            ...activeStyles.mobileNavBtn,
            color: sidebarOpen ? colors.accent : colors.textMuted,
          }}
        >
          <i className="bx bx-menu" style={activeStyles.mobileNavIcon}></i>
          <span style={activeStyles.mobileNavLabel}>More</span>
        </button>
      </div>

      {/* MAIN DASHBOARD CONTENT WINDOW */}
      <div style={activeStyles.mainContent}>

        {/* HEADER PANEL */}
        <header style={activeStyles.topHeader}>
          <div style={activeStyles.headerTitleBlock}>
            {/* HAMBURGER BUTTON FOR MOBILE VIEW */}
            <button style={activeStyles.btnHamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="bx bx-menu"></i>
            </button>
            <div>
              <h1 style={activeStyles.pageTitle}>Admin Management</h1>
              <p style={activeStyles.pageSubtitle}></p>
            </div>
          </div>
          <div style={activeStyles.headerButtons}>
            <button type="button" onClick={toggleTheme} style={activeStyles.btnThemeToggle}>
              <i className={isDarkMode ? 'bx bxs-sun' : 'bx bxs-moon'}></i>
              {isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}
            </button>
            <button type="button" style={activeStyles.btnExport} onClick={handlePrintRevenue}>
              <i className="bx bx-download"></i> EXPORT TELEMETRY
            </button>
            <button type="button" style={activeStyles.btnNewOrder} onClick={onNavToShop}>
              <i className="bx bx-cart-add"></i> INITIALIZE NEW ORDER
            </button>
          </div>
        </header>

        {activeView === 'dashboard' ? (
          <>


            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* RECENT ORDERS TABLE */}
              <div style={activeStyles.glassPanel}>
                <SectionHeading icon="bx bxs-bolt" iconColor={colors.accentBlue}>Recent Orders (Quick Glance)</SectionHeading>
                <div style={activeStyles.tableResponsiveWrapper}>
                  <table style={activeStyles.productionTable}>
                    <thead>
                      <tr>
                        <th style={activeStyles.tableTh}>Client</th>
                        <th style={activeStyles.tableTh}>Product</th>
                        <th style={activeStyles.tableTh}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order, idx) => (
                        <tr key={idx} style={activeStyles.tableTr}>
                          <td style={activeStyles.tableTd}>
                            <div style={{ fontWeight: 'bold', color: colors.text }}>{order.client}</div>
                            <div style={{ fontSize: '11px', color: colors.textMuted }}>{new Date(order.date).toLocaleDateString()}</div>
                          </td>
                          <td style={activeStyles.tableTd}>{order.product}</td>
                          <td style={activeStyles.tableTd}>
                            <span style={{
                              ...activeStyles.statusBadge,
                              background: isDarkMode ? 'rgba(243, 198, 95, 0.1)' : 'rgba(30, 58, 95, 0.08)',
                              color: colors.accent,
                              border: `1px solid ${colors.border}`
                            }}>
                              {(order.status || 'order').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>No recent orders</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ALERTS & QUICK ACTIONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={activeStyles.glassPanel}>
                  <SectionHeading icon="bx bxs-bell" iconColor="#ef4444">Alerts & Notifications</SectionHeading>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {overdueDeliveries > 0 && (
                      <div style={{ background: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #ef4444', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', color: '#ef4444' }}>
                        <strong>Alert:</strong> {overdueDeliveries} orders are overdue for delivery!
                      </div>
                    )}
                    {orders.length > 0 && orders[0].status === 'order' && (
                      <div style={{ background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid #3b82f6', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', color: '#3b82f6' }}>
                        <strong>New:</strong> Order received from {orders[0].client}
                      </div>
                    )}
                    <div style={{ background: 'rgba(22,163,74,0.08)', borderLeft: '3px solid #16a34a', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', color: '#16a34a' }}>
                      <strong>System:</strong> All production nodes operational.
                    </div>
                  </div>
                </div>

                <div style={activeStyles.glassPanel}>
                  <SectionHeading icon="bx bxs-zap" iconColor="#8b5cf6">Quick Actions</SectionHeading>
                  <button onClick={handlePrintRevenue} style={{ ...activeStyles.btnExport, marginBottom: '8px', width: '100%' }}>
                    <i className="bx bxs-file-pdf" style={{ marginRight: '6px' }}></i> Download Revenue Report
                  </button>
                  <button onClick={handlePrintOrderHistory} style={{ ...activeStyles.btnExport, marginBottom: '8px', width: '100%' }}>
                    <i className="bx bx-history" style={{ marginRight: '6px' }}></i> Download Order History
                  </button>
                  <button onClick={handlePrintOrderSummary} style={{ ...activeStyles.btnExport, width: '100%' }}>
                    <i className="bx bx-bar-chart-alt-2" style={{ marginRight: '6px' }}></i> Download Order Summary
                  </button>
                </div>
              </div>
            </div>

            {/* CHARTS ROW — Bar Chart + Order Summary Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
              {/* BAR CHART — Sales Trend */}
              <div style={activeStyles.glassPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <SectionHeading icon="bx bxs-bar-chart-alt-2" iconColor={colors.accentBlue}>Sales Trend (Last 7 Days)</SectionHeading>
                </div>
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer>
                    <BarChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
                      <XAxis dataKey="date" stroke={colors.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={colors.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.cardBg,
                          borderColor: colors.borderLight,
                          borderRadius: '8px',
                          color: colors.text,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: colors.accentBlue }}
                        cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(30,58,95,0.04)' }}
                      />
                      <Bar
                        dataKey="orders"
                        fill={colors.accentBlue}
                        radius={[6, 6, 0, 0]}
                        barSize={isSmallMobile ? 20 : 36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ORDER SUMMARY ANALYTICS — replaces PieChart */}
              <div style={activeStyles.glassPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <SectionHeading icon="bx bxs-pie-chart-alt-2" iconColor={colors.accentGreen}>Order Summary</SectionHeading>
                  <button
                    onClick={handlePrintOrderSummary}
                    style={{
                      background: colors.actionBtnBg,
                      color: colors.actionBtnText,
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className="bx bx-printer"></i> Print
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '12px' }}>
                  {/* Total Orders */}
                  <div style={{
                    background: isDarkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <i className="bx bx-package" style={{ fontSize: '22px', color: '#3b82f6', marginBottom: '6px', display: 'block' }}></i>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: colors.text }}>{totalOrdersCount}</div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', letterSpacing: '0.3px', marginTop: '2px' }}>TOTAL ORDERS</div>
                  </div>

                  {/* Pending */}
                  <div style={{
                    background: isDarkMode ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.15)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <i className="bx bx-time-five" style={{ fontSize: '22px', color: '#f59e0b', marginBottom: '6px', display: 'block' }}></i>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: colors.text }}>{pendingOrdersCount}</div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', letterSpacing: '0.3px', marginTop: '2px' }}>PENDING</div>
                  </div>

                  {/* In Production */}
                  <div style={{
                    background: isDarkMode ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <i className="bx bxs-wrench" style={{ fontSize: '22px', color: '#8b5cf6', marginBottom: '6px', display: 'block' }}></i>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: colors.text }}>{inProductionCount}</div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', letterSpacing: '0.3px', marginTop: '2px' }}>IN PRODUCTION</div>
                  </div>

                  {/* Confirmed */}
                  <div style={{
                    background: isDarkMode ? 'rgba(30,58,95,0.12)' : 'rgba(30,58,95,0.05)',
                    border: '1px solid rgba(30,58,95,0.15)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <i className="bx bx-check-shield" style={{ fontSize: '22px', color: colors.accentNavy, marginBottom: '6px', display: 'block' }}></i>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: colors.text }}>{confirmedOrdersCount}</div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', letterSpacing: '0.3px', marginTop: '2px' }}>CONFIRMED</div>
                  </div>

                  {/* Delivered */}
                  <div style={{
                    background: isDarkMode ? 'rgba(22,163,74,0.08)' : 'rgba(22,163,74,0.06)',
                    border: '1px solid rgba(22,163,74,0.15)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <i className="bx bxs-check-circle" style={{ fontSize: '22px', color: '#16a34a', marginBottom: '6px', display: 'block' }}></i>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: colors.text }}>{deliveredOrdersCount}</div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', letterSpacing: '0.3px', marginTop: '2px' }}>DELIVERED</div>
                  </div>

                  {/* Revenue */}
                  <div style={{
                    background: isDarkMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: '10px',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <i className="bx bx-dollar-circle" style={{ fontSize: '22px', color: '#10b981', marginBottom: '6px', display: 'block' }}></i>
                    <div style={{ fontSize: isSmallMobile ? '16px' : '20px', fontWeight: '900', color: colors.text }}>Rs.{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '700', letterSpacing: '0.3px', marginTop: '2px' }}>REVENUE</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeView === 'add-product' ? (
          <div style={activeStyles.dataBlockContainer}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2 style={{ ...activeStyles.blockTitle, textAlign: 'center', marginBottom: '30px' }}> Register New Bat </h2>
              <form style={activeStyles.formGrid} onSubmit={handleAddProductSubmit}>
                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>PRODUCT MODEL NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Dynasty Limited Edition"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={activeStyles.formInput}
                    required
                  />
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>EQUIPMENT MATRIX CATEGORY</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={activeStyles.formSelect}
                  >
                    <option value="Custom Clefts">Custom Clefts</option>
                    <option value="Hardwood Bats">Hardwood Bats</option>
                    <option value="Softball Bats">Softball Bats</option>
                  </select>
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>BASE PROCESSING PRICE (LKR)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    style={activeStyles.formInput}
                    required
                  />
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>WOOD VARIANT CORE</label>
                  <select
                    value={newProduct.woodType}
                    onChange={(e) => setNewProduct({ ...newProduct, woodType: e.target.value })}
                    style={activeStyles.formSelect}
                  >
                    <option value="Smart">Smart</option>
                    <option value="Good">Good</option>
                  </select>
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>PRODUCT TAG (HUD LABEL)</label>
                  <input
                    type="text"
                    placeholder="e.g. PRO SERIES, NEW DROP"
                    value={newProduct.tag}
                    onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })}
                    style={activeStyles.formInput}
                  />
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>BAT LENGTH/HEIGHT (INCHES)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 33"
                    value={newProduct.batHeight}
                    onChange={(e) => setNewProduct({ ...newProduct, batHeight: e.target.value })}
                    style={activeStyles.formInput}
                    required
                  />
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>BAT WEIGHT</label>
                  <input
                    type="number"
                    step="5"
                    placeholder="e.g. 650gm"
                    value={newProduct.batWeight}
                    onChange={(e) => setNewProduct({ ...newProduct, batWeight: e.target.value })}
                    style={activeStyles.formInput}
                    required
                  />
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>EDGE SIZE (MM)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 38"
                    value={newProduct.edgeSize}
                    onChange={(e) => setNewProduct({ ...newProduct, edgeSize: e.target.value })}
                    style={activeStyles.formInput}
                  />
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>STOCK COUNT</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={newProduct.stockCount}
                    onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                    style={activeStyles.formInput}
                    required
                  />
                </div>

                <div style={{ ...activeStyles.inputGroup, gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <label style={activeStyles.inputLabel}>SPECIFICATION DESCRIPTION</label>
                  <textarea
                    placeholder="Enter bat specs, density, balance point details..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    style={{ ...activeStyles.formInput, minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ ...activeStyles.inputGroup, gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <label style={activeStyles.inputLabel}>PRODUCT IMAGE (MAX 2MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ ...activeStyles.formInput, padding: '10px' }}
                  />
                  {imageBase64 && (
                    <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                      <img src={imageBase64} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${colors.border}` }} />
                      <button
                        type="button"
                        onClick={() => setImageBase64('')}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >✕</button>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: isMobile ? '1' : '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <button type="submit" style={{ ...activeStyles.btnSubmitProduct, width: isMobile ? '100%' : '50%', padding: '16px', fontSize: '12px' }}>REGISTER EQUIPMENT PROTOCOL</button>
                </div>
              </form>
            </div>
          </div>
        ) : activeView === 'manage-products' ? (
          <div style={activeStyles.dataBlockContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ ...activeStyles.blockTitle, margin: 0 }}><i className="bx bxs-box" style={{ marginRight: '8px', color: colors.accentBlue }}></i> All Registered Products ({allProducts.length})</h2>
              <button
                onClick={() => setActiveView('add-product')}
                style={{ ...activeStyles.btnSubmitProduct, marginTop: 0, padding: '10px 20px' }}
              >
                <i className="bx bx-plus" style={{ marginRight: '4px' }}></i> ADD NEW PRODUCT
              </button>
            </div>

            {allProducts.length > 0 ? (
              <div style={activeStyles.tableResponsiveWrapper}>
                <table style={activeStyles.productionTable}>
                  <thead>
                    <tr>
                      <th style={activeStyles.tableTh}>#</th>
                      <th style={activeStyles.tableTh}>IMAGE</th>
                      <th style={activeStyles.tableTh}>PRODUCT NAME</th>
                      <th style={activeStyles.tableTh}>CATEGORY</th>
                      <th style={activeStyles.tableTh}>WOOD TYPE</th>
                      <th style={activeStyles.tableTh}>PRICE</th>
                      <th style={activeStyles.tableTh}>SPECS</th>
                      <th style={activeStyles.tableTh}>STOCK</th>
                      <th style={activeStyles.tableTh}>TAG</th>
                      <th style={activeStyles.tableTh}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts.map((product, idx) => (
                      <tr key={product._id || idx} style={activeStyles.tableTr}>
                        <td style={{ ...activeStyles.tableTd, color: colors.accent, fontFamily: 'monospace', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={activeStyles.tableTd}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${colors.border}` }} />
                          ) : (
                            <span style={{ fontSize: '20px' }}>🏏</span>
                          )}
                        </td>
                        <td style={{ ...activeStyles.tableTd, fontWeight: '700' }}>{product.name}</td>
                        <td style={activeStyles.tableTd}>
                          <span style={{
                            background: isDarkMode ? 'rgba(243, 198, 95, 0.1)' : 'rgba(30, 58, 95, 0.08)',
                            border: `1px solid ${colors.border}`,
                            color: colors.accent,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>{product.category}</span>
                        </td>
                        <td style={{ ...activeStyles.tableTd, textTransform: 'capitalize' }}>{product.woodType}</td>
                        <td style={{ ...activeStyles.tableTd, color: colors.accent, fontWeight: '700', fontFamily: 'monospace' }}>{product.price}</td>
                        <td style={{ ...activeStyles.tableTd, fontSize: '11px', fontFamily: 'monospace' }}>
                          <div>Height: {product.batHeight || '—'}</div>
                          <div>Weight: {product.batWeight || '—'} gm</div>
                          <div>Edge: {product.edgeSize || '—'} mm</div>
                        </td>
                        <td style={{ ...activeStyles.tableTd, fontWeight: '700', fontFamily: 'monospace', color: product.stockCount <= 0 ? '#ef4444' : colors.text }}>
                          {product.stockCount !== undefined ? product.stockCount : 0}
                        </td>
                        <td style={activeStyles.tableTd}>
                          {product.tag ? (
                            <span style={{
                              background: 'rgba(22,163,74,0.12)',
                              color: '#16a34a',
                              border: '1px solid rgba(22,163,74,0.2)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '800'
                            }}>{product.tag}</span>
                          ) : (
                            <span style={{ color: colors.textMuted, fontSize: '11px' }}>—</span>
                          )}
                        </td>
                        <td style={activeStyles.tableTd}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                // Strip Rs. and commas to make it easy to edit the raw price number
                                const rawPrice = product.price ? product.price.toString().replace(/[Rr][Ss]\.?\s*/g, '').replace(/,/g, '').trim() : '';
                                setEditProduct({
                                  id: product._id,
                                  name: product.name,
                                  category: product.category || 'Custom Clefts',
                                  price: rawPrice,
                                  woodType: product.woodType || 'premium',
                                  description: product.description || '',
                                  tag: product.tag || '',
                                  batHeight: product.batHeight || '33',
                                  batWeight: product.batWeight || '650',
                                  edgeSize: product.edgeSize || '',
                                  image: product.image || '',
                                  stockCount: product.stockCount !== undefined ? product.stockCount : ''
                                });
                                setEditImageBase64('');
                                setIsEditModalOpen(true);
                              }}
                              style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#3b82f6',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="bx bx-edit"></i> UPDATE
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="bx bx-trash"></i> DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: `1px dashed ${colors.border}`, borderRadius: '8px' }}>
                <i className="bx bxs-package" style={{ fontSize: '40px', color: colors.textMuted }}></i>
                <h3 style={{ color: colors.accent, margin: '15px 0 5px 0' }}>No Products Registered</h3>
                <p style={{ color: colors.textMuted, fontSize: '13px' }}>Add your first product to see it here.</p>
                <button
                  onClick={() => setActiveView('add-product')}
                  style={{ ...activeStyles.btnSubmitProduct, display: 'inline-block' }}
                >
                  <i className="bx bx-plus" style={{ marginRight: '4px' }}></i> ADD FIRST PRODUCT
                </button>
              </div>
            )}
          </div>
        ) : activeView === 'manage-orders' ? (
          <div style={activeStyles.dataBlockContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ ...activeStyles.blockTitle, margin: 0 }}><i className="bx bx-list-check" style={{ color: colors.accentBlue, marginRight: '10px' }}></i> All System Orders</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handlePrintOrderHistory} style={{
                  background: colors.actionBtnBg,
                  color: colors.actionBtnText,
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="bx bx-download"></i> Download History
                </button>
                <button onClick={handlePrintOrderHistory} style={{
                  background: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="bx bx-printer"></i> Print
                </button>
              </div>
            </div>
            {orders.length > 0 ? (
              <div style={activeStyles.tableResponsiveWrapper}>
                <table style={activeStyles.productionTable}>
                  <thead>
                    <tr>
                      <th style={activeStyles.tableTh}>Date</th>
                      <th style={activeStyles.tableTh}>Client</th>
                      <th style={activeStyles.tableTh}>Product</th>
                      <th style={activeStyles.tableTh}>Price</th>
                      <th style={activeStyles.tableTh}>Payment</th>
                      <th style={activeStyles.tableTh}>Status</th>
                      <th style={activeStyles.tableTh}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order._id || idx} style={activeStyles.tableTr}>
                        <td style={activeStyles.tableTd}>{new Date(order.date).toLocaleDateString()}</td>
                        <td style={activeStyles.tableTd}>
                          <div style={{ fontWeight: 'bold', color: colors.text }}>{order.client}</div>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>{order.email}</div>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>{order.phone}</div>
                        </td>
                        <td style={activeStyles.tableTd}>
                          <div style={{ fontWeight: 'bold', color: colors.text }}>{order.product}</div>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>{order.spec}</div>
                        </td>
                        <td style={{ ...activeStyles.tableTd, color: colors.accent, fontWeight: 'bold' }}>{order.price}</td>
                        <td style={activeStyles.tableTd}>
                          <div style={{ textTransform: 'capitalize', fontWeight: '500', fontSize: '12px' }}>
                            {order.paymentMethod === 'bank_transfer' ? (<><i className="bx bxs-bank" style={{ marginRight: '4px' }}></i>Bank Transfer</>) : (<><i className="bx bxs-credit-card" style={{ marginRight: '4px' }}></i>Card</>)}
                          </div>
                          {order.paymentSlip ? (
                            <button
                              onClick={() => setSelectedReceipt({
                                clientName: order.client,
                                clientEmail: order.email,
                                slipBase64: order.paymentSlip,
                                orderId: order._id
                              })}
                              style={{
                                background: isDarkMode ? 'rgba(243, 198, 95, 0.12)' : 'rgba(30, 58, 95, 0.08)',
                                border: `1px solid ${colors.border}`,
                                color: colors.accent,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="bx bx-file"></i> View Slip
                            </button>
                          ) : order.paymentMethod === 'bank_transfer' ? (
                            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}><i className="bx bxs-error" style={{ marginRight: '2px' }}></i> No Slip</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}><i className="bx bx-check" style={{ marginRight: '2px' }}></i> Paid</span>
                          )}
                        </td>
                        <td style={activeStyles.tableTd}>
                          <span style={{
                            ...activeStyles.statusBadge,
                            background: order.status === 'deliveried' ? 'rgba(22, 163, 74, 0.12)' : 
                                        order.status === 'pending_payment' ? 'rgba(239, 68, 68, 0.12)' : isDarkMode ? 'rgba(243, 198, 95, 0.12)' : 'rgba(30, 58, 95, 0.08)',
                            color: order.status === 'deliveried' ? '#16a34a' : 
                                   order.status === 'pending_payment' ? '#ef4444' : colors.accent,
                            border: order.status === 'deliveried' ? '1px solid rgba(22, 163, 74, 0.25)' : 
                                    order.status === 'pending_payment' ? '1px solid rgba(239, 68, 68, 0.25)' : `1px solid ${colors.border}`
                          }}>
                            {(order.status || 'order').toUpperCase()}
                          </span>
                        </td>
                        <td style={activeStyles.tableTd}>
                          <select
                            value={order.status || 'order'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            style={activeStyles.formSelect}
                          >
                            <option value="order">Order (Pending)</option>
                            <option value="pending_payment">Pending Payment Review</option>
                            <option value="confirm">Confirm</option>
                            <option value="customize">Customize (Production)</option>
                            <option value="finish">Finish</option>
                            <option value="deliveried">Deliveried</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: `1px dashed ${colors.border}`, borderRadius: '8px' }}>
                <i className="bx bxs-package" style={{ fontSize: '40px', color: colors.textMuted }}></i>
                <h3 style={{ color: colors.accent, margin: '15px 0 5px 0' }}>No Orders Found</h3>
                <p style={{ color: colors.textMuted, fontSize: '13px' }}>Customer orders will appear here.</p>
              </div>
            )}
          </div>
        ) : activeView === 'production-workflow' ? (
          <div>
            {/* Download/Print bar for production */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handlePrintProduction} style={{
                background: colors.actionBtnBg,
                color: colors.actionBtnText,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="bx bx-download"></i> Download Report
              </button>
              <button onClick={handlePrintProduction} style={{
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="bx bx-printer"></i> Print
              </button>
            </div>

            {/* PRODUCTION LIST */}
            <div style={{ ...activeStyles.dataBlockContainer, marginBottom: '28px' }}>
              <h2 style={activeStyles.blockTitle}><i className="bx bxs-factory" style={{ color: colors.accentBlue, marginRight: '10px' }}></i> Production List (To-Do)</h2>
              <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '20px' }}>Orders confirmed by Admin, waiting to be sent to production.</p>

              <div style={activeStyles.tableResponsiveWrapper}>
                <table style={activeStyles.productionTable}>
                  <thead>
                    <tr>
                      <th style={activeStyles.tableTh}>Order Date</th>
                      <th style={activeStyles.tableTh}>Client</th>
                      <th style={activeStyles.tableTh}>Product / Spec</th>
                      <th style={activeStyles.tableTh}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === 'confirm').map((order, idx) => (
                      <tr key={order._id || idx} style={activeStyles.tableTr}>
                        <td style={activeStyles.tableTd}>{new Date(order.date).toLocaleDateString()}</td>
                        <td style={activeStyles.tableTd}>{order.client}</td>
                        <td style={activeStyles.tableTd}>
                          <div style={{ fontWeight: 'bold', color: colors.text }}>{order.product}</div>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>{order.spec}</div>
                        </td>
                        <td style={activeStyles.tableTd}>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'customize')}
                            style={{
                              background: colors.actionBtnBg,
                              color: colors.actionBtnText,
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <i className="bx bxs-wrench"></i> Send to Production
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.filter(o => o.status === 'confirm').length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>No orders waiting for production.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DELIVERY LIST */}
            <div style={activeStyles.dataBlockContainer}>
              <h2 style={activeStyles.blockTitle}><i className="bx bxs-truck" style={{ color: colors.accentGreen, marginRight: '10px' }}></i> Delivery List</h2>
              <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '20px' }}>Orders in production or finished. Highlighted if confirmed &gt; 3 days ago.</p>

              <div style={activeStyles.tableResponsiveWrapper}>
                <table style={activeStyles.productionTable}>
                  <thead>
                    <tr>
                      <th style={activeStyles.tableTh}>Client Info</th>
                      <th style={activeStyles.tableTh}>Product</th>
                      <th style={activeStyles.tableTh}>Current Status</th>
                      <th style={activeStyles.tableTh}>Delivery SLA</th>
                      <th style={activeStyles.tableTh}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const deliveryOrders = orders.filter(o => {
                        if (o.status === 'finish') return true;
                        if (o.status === 'customize') {
                          const confirmDate = new Date(o.confirmDate || o.date);
                          const daysPassed = (new Date() - confirmDate) / (1000 * 60 * 60 * 24);
                          return daysPassed >= 2;
                        }
                        return false;
                      });

                      if (deliveryOrders.length === 0) {
                        return (
                          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>No orders in production or pending delivery.</td></tr>
                        );
                      }

                      return deliveryOrders.map((order, idx) => {
                        const confirmDate = new Date(order.confirmDate || order.date);
                        const daysPassed = Math.floor((new Date() - confirmDate) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysPassed >= 3;

                        return (
                          <tr key={order._id || idx} style={activeStyles.tableTr}>
                            <td style={activeStyles.tableTd}>
                              <div style={{ fontWeight: 'bold', color: colors.text }}>{order.client}</div>
                              <div style={{ fontSize: '11px', color: colors.textMuted }}>{order.address}</div>
                              <div style={{ fontSize: '11px', color: colors.textMuted }}>{order.phone}</div>
                            </td>
                            <td style={activeStyles.tableTd}>{order.product}</td>
                            <td style={activeStyles.tableTd}>
                              <span style={{
                                ...activeStyles.statusBadge,
                                background: order.status === 'finish' ? 'rgba(22,163,74,0.1)' : 'rgba(59,130,246,0.1)',
                                color: order.status === 'finish' ? '#16a34a' : '#3b82f6',
                              }}>
                                {order.status === 'finish' ? 'Finished' : 'In Production'}
                              </span>
                            </td>
                            <td style={activeStyles.tableTd}>
                              {isOverdue ? (
                                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}><i className="bx bxs-error"></i> Must Deliver Now (3 Days+)</span>
                              ) : (
                                <span style={{ color: colors.textMuted, fontSize: '12px' }}>{3 - daysPassed} Days Remaining</span>
                              )}
                            </td>
                            <td style={activeStyles.tableTd}>
                              <button
                                onClick={() => updateOrderStatus(order._id, 'deliveried')}
                                style={{
                                  background: colors.actionBtnBg,
                                  color: colors.actionBtnText,
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontWeight: 'bold',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <i className="bx bx-check"></i> Mark Delivered
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeView === 'bank-settings' ? (
          <div style={activeStyles.dataBlockContainer}>
            <div style={{ maxWidth: '750px', margin: '0 auto' }}>
              <h2 style={{ ...activeStyles.blockTitle, textAlign: 'center', marginBottom: '10px' }}>
                <i className="bx bxs-bank" style={{ color: colors.accent, marginRight: '10px' }}></i>
                Bank Transfer Configuration
              </h2>
              <p style={{ color: colors.textMuted, fontSize: '13px', textAlign: 'center', marginBottom: '30px' }}>
                Configure bank account details and QR code for the customer checkout page. Changes are reflected in real time.
              </p>

              <form onSubmit={handleSaveBankDetails} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                  <div style={activeStyles.inputGroup}>
                    <label style={activeStyles.inputLabel}>BANK NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Seylan Bank PLC"
                      value={bankSettings.bankName}
                      onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                      style={activeStyles.formInput}
                      required
                    />
                  </div>
                  <div style={activeStyles.inputGroup}>
                    <label style={activeStyles.inputLabel}>BRANCH NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Colombo Fort"
                      value={bankSettings.branchName}
                      onChange={(e) => setBankSettings({ ...bankSettings, branchName: e.target.value })}
                      style={activeStyles.formInput}
                      required
                    />
                  </div>
                  <div style={activeStyles.inputGroup}>
                    <label style={activeStyles.inputLabel}>ACCOUNT NUMBER</label>
                    <input
                      type="text"
                      placeholder="e.g. 0860-33456910-001"
                      value={bankSettings.accountNumber}
                      onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                      style={activeStyles.formInput}
                      required
                    />
                  </div>
                  <div style={activeStyles.inputGroup}>
                    <label style={activeStyles.inputLabel}>ACCOUNT HOLDER NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. CS BAT LABS PVT LTD"
                      value={bankSettings.accountName}
                      onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
                      style={activeStyles.formInput}
                      required
                    />
                  </div>
                </div>

                <div style={activeStyles.inputGroup}>
                  <label style={activeStyles.inputLabel}>CUSTOM QR CODE TEXT (OPTIONAL)</label>
                  <textarea
                    placeholder="Leave blank to auto-generate from bank details above. Or paste a payment link / custom text here."
                    value={bankSettings.qrText}
                    onChange={(e) => setBankSettings({ ...bankSettings, qrText: e.target.value })}
                    style={{ ...activeStyles.formInput, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <span style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                    If empty, QR will encode: Bank Name, Branch, Account Number, Account Name.
                  </span>
                </div>

                {/* QR PREVIEW */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '25px',
                  background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  borderRadius: '12px',
                  border: `1px solid ${colors.borderLight}`
                }}>
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>QR CODE LIVE PREVIEW</span>
                  <div style={{
                    width: '180px',
                    height: '180px',
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `2px solid ${colors.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 25px rgba(30, 58, 95, 0.1)`
                  }}>
                    {(bankSettings.bankName || bankSettings.qrText) ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          bankSettings.qrText || `Bank: ${bankSettings.bankName}\nBranch: ${bankSettings.branchName}\nAcc: ${bankSettings.accountNumber}\nName: ${bankSettings.accountName}`
                        )}`}
                        alt="QR Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Fill in bank details to see QR preview</span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: colors.textMuted }}>This QR code will appear on the customer checkout page</span>
                </div>

                {/* BANK DETAILS PREVIEW CARD */}
                <div style={{
                  padding: '20px',
                  background: isDarkMode ? 'rgba(2, 4, 8, 0.7)' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${colors.borderLight}`
                }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '11px', color: colors.accent, letterSpacing: '1px', fontWeight: '800' }}>CUSTOMER VIEW PREVIEW</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textMuted }}>Bank:</span>
                      <strong style={{ color: colors.text }}>{bankSettings.bankName || '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textMuted }}>Branch:</span>
                      <strong style={{ color: colors.text }}>{bankSettings.branchName || '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textMuted }}>Account Number:</span>
                      <strong style={{ color: colors.text, fontFamily: 'monospace' }}>{bankSettings.accountNumber || '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textMuted }}>Account Name:</span>
                      <strong style={{ color: colors.text }}>{bankSettings.accountName || '—'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      ...activeStyles.btnSubmitProduct,
                      width: isMobile ? '100%' : '50%',
                      padding: '16px',
                      fontSize: '12px',
                      marginTop: 0,
                      background: bankSaveStatus === 'saved' ? 'rgba(22,163,74,0.15)' : activeStyles.btnSubmitProduct.background,
                      color: bankSaveStatus === 'saved' ? '#16a34a' : activeStyles.btnSubmitProduct.color,
                      borderColor: bankSaveStatus === 'saved' ? 'rgba(22,163,74,0.3)' : 'transparent'
                    }}
                    disabled={bankSaveStatus === 'saving'}
                  >
                    {bankSaveStatus === 'saving' ? '⏳ SAVING...' : bankSaveStatus === 'saved' ? '✓ SAVED SUCCESSFULLY' : bankSaveStatus === 'error' ? '⚠️ ERROR — TRY AGAIN' : '💾 SAVE BANK CONFIGURATION'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <div style={{ flex: 1 }}></div>

        {/* FOOTER METRIC ROW */}
        <footer style={activeStyles.dashFooter}>
          <div style={activeStyles.footerTopRow}>
            <div>
              <h3 style={{ color: colors.accentNavy, margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>CS Bat Central Processing Node</h3>
              <p style={{ color: colors.textMuted, fontSize: '12px', margin: 0, fontFamily: 'monospace' }}>
                © 2026 CS Bat Central. Layer-7 Secured Node Console Workspace.
              </p>
            </div>
            <div style={activeStyles.footerLinksGroup}>
              <div style={activeStyles.footerLinksCol}>
                <span style={activeStyles.footerLinksTitle}>QUICK NET LINKS</span>
                <a href="#contact" style={activeStyles.footerLinkItem}>Terminal Uplink</a>
                <a href="#sms" style={activeStyles.footerLinkItem}>SMS Logs Matrix</a>
              </div>
              <div style={activeStyles.footerLinksCol}>
                <span style={activeStyles.footerLinksTitle}>CRYPTO SUPPORT</span>
                <a href="#doc" style={activeStyles.footerLinkItem}>Documentation API</a>
                <a href="#security" style={activeStyles.footerLinkItem}>Security Keys</a>
              </div>
              <div style={activeStyles.footerLinksCol}>
                <span style={activeStyles.footerLinksTitle}>NODE MONITOR STATUS</span>
                <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}>● ALL STATIONS COMPILING OPTIMAL</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)',
          padding: '20px'
        }}>
          <div style={{
            background: colors.sidebarBg,
            color: colors.text,
            border: `1px solid ${colors.accent}`,
            borderRadius: '12px',
            padding: isMobile ? '20px' : '30px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            boxSizing: 'border-box',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setSelectedReceipt(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: colors.textMuted,
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              <i className="bx bx-x"></i>
            </button>
            <h3 style={{ margin: '0 0 10px 0', color: colors.accent, fontSize: '18px', fontWeight: '800' }}>
              Verify Payment Receipt Slip
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: colors.textMuted }}>
              Customer: <strong>{selectedReceipt.clientName}</strong> ({selectedReceipt.clientEmail})
            </p>
            
            <div style={{
              width: '100%',
              height: isMobile ? '250px' : '350px',
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '8px',
              background: '#020408',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {selectedReceipt.slipBase64.startsWith('data:application/pdf') ? (
                <iframe 
                  src={selectedReceipt.slipBase64} 
                  title="PDF Slip"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <img 
                  src={selectedReceipt.slipBase64} 
                  alt="Receipt slip preview"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  updateOrderStatus(selectedReceipt.orderId, 'confirm');
                  setSelectedReceipt(null);
                }}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                <i className="bx bx-check" style={{ marginRight: '4px' }}></i> Approve
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(selectedReceipt.orderId, 'payment_failed');
                  setSelectedReceipt(null);
                }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                <i className="bx bx-x" style={{ marginRight: '4px' }}></i> Reject
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.borderLight}`,
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editProduct && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)',
          padding: '20px'
        }}>
          <div style={{
            background: colors.sidebarBg,
            color: colors.text,
            border: `1px solid ${colors.accent}`,
            borderRadius: '12px',
            padding: isMobile ? '20px' : '30px',
            width: '100%',
            maxWidth: '550px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            boxSizing: 'border-box',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: colors.textMuted,
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 20px 0', color: colors.accent, fontSize: '18px', fontWeight: '800' }}>
              Update Product Details
            </h3>

            <form onSubmit={handleUpdateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>PRODUCT MODEL NAME</label>
                <input 
                  type="text" 
                  value={editProduct.name} 
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} 
                  style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                  placeholder="e.g. Dynasty Limited Edition"
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>EQUIPMENT MATRIX CATEGORY</label>
                  <select 
                    value={editProduct.category} 
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="Custom Clefts">Custom Clefts</option>
                    <option value="English Willow">English Willow</option>
                    <option value="Hardwood Bats">Hardwood Bats</option>
                    <option value="Softball Bats">Softball Bats</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>BASE PROCESSING PRICE (LKR)</label>
                  <input 
                    type="number" 
                    value={editProduct.price} 
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                    placeholder="15000"
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>WOOD VARIANT CORE</label>
                  <select 
                    value={editProduct.woodType} 
                    onChange={(e) => setEditProduct({ ...editProduct, woodType: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="Smart">Smart</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>PRODUCT TAG (HUD LABEL)</label>
                  <input 
                    type="text" 
                    value={editProduct.tag} 
                    onChange={(e) => setEditProduct({ ...editProduct, tag: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                    placeholder="e.g. PRO SERIES, NEW DROP"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>BAT LENGTH/HEIGHT (INCHES)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={editProduct.batHeight} 
                    onChange={(e) => setEditProduct({ ...editProduct, batHeight: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                    placeholder="e.g. 33"
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>BAT WEIGHT</label>
                  <input 
                    type="number" 
                    step="5" 
                    value={editProduct.batWeight} 
                    onChange={(e) => setEditProduct({ ...editProduct, batWeight: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                    placeholder="e.g. 650gm"
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>EDGE SIZE (MM)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={editProduct.edgeSize} 
                    onChange={(e) => setEditProduct({ ...editProduct, edgeSize: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                    placeholder="e.g. 38"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>STOCK COUNT</label>
                  <input 
                    type="number" 
                    value={editProduct.stockCount} 
                    onChange={(e) => setEditProduct({ ...editProduct, stockCount: e.target.value })} 
                    style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                    placeholder="e.g. 10"
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>SPECIFICATION DESCRIPTION</label>
                <textarea 
                  value={editProduct.description} 
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} 
                  style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '10px 14px', color: colors.text, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical', width: '100%', boxSizing: 'border-box' }} 
                  placeholder="Enter bat specs, density, balance point details..."
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '800' }}>PRODUCT IMAGE (MAX 2MB)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleEditImageChange} 
                  style={{ background: colors.inputBg, border: `1px solid ${colors.borderLight}`, borderRadius: '8px', padding: '8px 10px', color: colors.text, width: '100%', boxSizing: 'border-box' }} 
                />
                {(editImageBase64 || editProduct.image) && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={editImageBase64 || editProduct.image} 
                      alt="Product preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px', width: '100%' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  style={{ background: 'transparent', color: colors.text, border: `1px solid ${colors.borderLight}`, padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ background: colors.accent, color: isDarkMode ? '#06080c' : '#ffffff', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;