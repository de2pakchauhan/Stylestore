import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import BasketModal from './components/BasketModal';
import LoginModal from './components/LoginModal';
import ProfileModalWrapper from './components/ProfileModalWrapper';
import Footer from './components/Footer'; // Import Footer component

function Layout() {
  const { isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const [isBasketOpen, setIsBasketOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar onBasketClick={() => setIsBasketOpen(true)} />
      
      {/* Main content area */}
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<ProductGrid />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>

      {/* Profile modal (rendered as overlay when route matches) */}
      {location.pathname === '/profile' && <ProfileModalWrapper />}

      {/* Other modals */}
      <BasketModal 
        isOpen={isBasketOpen} 
        onClose={() => setIsBasketOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Footer */}
      <Footer />  {/* Add Footer here */}
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/*" element={<Layout />} />
      <Route path="/profile" element={<Layout />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <AuthenticatedApp />
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;