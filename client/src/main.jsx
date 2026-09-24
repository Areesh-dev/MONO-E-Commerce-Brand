import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import App from './App';
import SkipLink from './components/ui/SkipLink';
import ScrollToTop from './components/layout/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BrandingProvider } from './context/BrandingContext';
import { WishlistProvider } from './context/WishlistContext';
import './lib/env';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollToTop />
        <BrandingProvider>
          <AuthProvider>
            <CartProvider>
              <SkipLink />
              <WishlistProvider>
              <App />
              <Toaster
                position="top-center"
                theme="dark"
                closeButton
                toastOptions={{
                  style: {
                    background: '#131313',
                    border: '1px solid #2E2C2C',
                    color: '#F5F5F5',
                  },
                }}
              />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrandingProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);