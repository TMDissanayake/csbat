import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import ShopPage from './ShopPage';
import CustomizerPage from './CustomizerPage';
import CheckoutPage from './CheckoutPage';
import CartPage from './CartPage';
import ReviewsPage from './ReviewsPage';
import PayHerePage from './PayHerePage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);


  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('csbat_theme');
    return savedTheme ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('csbat_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (role) => {
    if (redirectAfterLogin) {
      setCurrentPage(redirectAfterLogin);
      setRedirectAfterLogin(null);
    } else {
      setCurrentPage(role);
    }
  };




  const handleNavToDashboard = () => {
    const email = localStorage.getItem('userEmail');
    if (email === 'admin@csbat.com') {
      setCurrentPage('admin');
    } else if (email) {
      setCurrentPage('customer');
    } else {
      setCurrentPage('landing');
    }
  };


  const themeProps = {
    theme: theme,
    toggleTheme: toggleTheme,
    currentPage: currentPage
  };

  return (
    <div>
      {/* Landing Page */}
      {currentPage === 'landing' && (
        <LandingPage
          onNavToHome={() => setCurrentPage('landing')}
          onNavToLogin={() => setCurrentPage('login')}
          onNavToShop={() => setCurrentPage('shop')}
          onNavToCustomizer={() => setCurrentPage('customizer')}
          onNavToDashboard={handleNavToDashboard}
          onNavToCart={() => setCurrentPage('cart')}
          onNavToReviews={() => setCurrentPage('reviews')}
          {...themeProps}
        />
      )}

      {/* Category / Shop Page */}
      {currentPage === 'shop' && (
        <ShopPage
          onNavToHome={() => setCurrentPage('landing')}
          onNavToCustomizer={() => setCurrentPage('customizer')}
          onNavToLogin={() => setCurrentPage('login')}
          onNavToDashboard={handleNavToDashboard}
          onNavigateToCheckout={() => setCurrentPage('checkout')}
          onNavToCart={() => setCurrentPage('cart')}
          onNavToReviews={() => setCurrentPage('reviews')}
          {...themeProps}
        />
      )}

      {/* Customizer Page */}
      {currentPage === 'customizer' && (
        <CustomizerPage
          onNavToHome={() => setCurrentPage('landing')}
          onNavToShop={() => setCurrentPage('shop')}
          onNavToLogin={() => setCurrentPage('login')}
          onNavToDashboard={handleNavToDashboard}
          onNavigateToCheckout={() => setCurrentPage('checkout')}
          onNavToCart={() => setCurrentPage('cart')}
          onNavToReviews={() => setCurrentPage('reviews')}
          {...themeProps}
        />
      )}

      {/*Checkout Page */}
      {currentPage === 'checkout' && (
        <CheckoutPage
          onNavToShop={() => setCurrentPage('shop')}
          onNavToHome={() => setCurrentPage('landing')}
          onNavToCustomizer={() => setCurrentPage('customizer')}
          onNavToLogin={() => setCurrentPage('login')}
          onNavToDashboard={handleNavToDashboard}
          onNavToCart={() => setCurrentPage('cart')}
          onNavToReviews={() => setCurrentPage('reviews')}
          onNavigateToPayHere={() => setCurrentPage('payhere')}
          {...themeProps}
        />
      )}

      {/* PayHere Payment Gateway */}
      {currentPage === 'payhere' && (
        <PayHerePage
          onPaymentSuccess={handleNavToDashboard}
          onCancel={() => setCurrentPage('checkout')}
          theme={theme}
        />
      )}

      {/* Cart Page */}
      {currentPage === 'cart' && (
        <CartPage
          onNavToHome={() => setCurrentPage('landing')}
          onNavToShop={() => setCurrentPage('shop')}
          onNavToCustomizer={() => setCurrentPage('customizer')}
          onNavToLogin={() => setCurrentPage('login')}
          onNavToDashboard={handleNavToDashboard}
          onNavToCart={() => setCurrentPage('cart')}
          onNavigateToCheckout={() => setCurrentPage('checkout')}
          onNavToReviews={() => setCurrentPage('reviews')}
          {...themeProps}
        />
      )}

      {currentPage === 'login' && (
        <AuthPage onLoginSuccess={handleLoginSuccess} onNavToHome={() => setCurrentPage('landing')} {...themeProps} />
      )}

      {/* Reviews Page */}
      {currentPage === 'reviews' && (
        <ReviewsPage
          onNavToHome={() => setCurrentPage('landing')}
          onNavToShop={() => setCurrentPage('shop')}
          onNavToCustomizer={() => setCurrentPage('customizer')}
          onNavToLogin={() => {
            setRedirectAfterLogin('reviews');
            setCurrentPage('login');
          }}
          onNavToDashboard={handleNavToDashboard}
          onNavToCart={() => setCurrentPage('cart')}
          onNavToReviews={() => setCurrentPage('reviews')}
          {...themeProps}
        />
      )}

      {currentPage === 'admin' && (
        <AdminDashboard
          onLogout={() => {
            localStorage.removeItem('userEmail');
            setCurrentPage('landing');
          }}
          onNavToShop={() => setCurrentPage('shop')}
          onNavToHome={() => setCurrentPage('landing')}
          {...themeProps}
        />
      )}

      {currentPage === 'customer' && (
        <CustomerDashboard
          onLogout={() => {
            localStorage.removeItem('userEmail');
            setCurrentPage('landing');
          }}
          onNavToShop={() => setCurrentPage('shop')}
          onNavToHome={() => setCurrentPage('landing')}
          {...themeProps}
        />
      )}
    </div>
  );
}

export default App;