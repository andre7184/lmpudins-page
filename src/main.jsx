import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ProductPage from './ProductPage.jsx';
import VersionsPage from './VersionsPage.jsx';
import './styles.css';

const isProductPage = /^\/produto\/[^/]+\/?$/.test(window.location.pathname);
const isVersionsPage = /^\/versoes\/?$/.test(window.location.pathname);
createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isProductPage ? <ProductPage /> : isVersionsPage ? <VersionsPage /> : <App />}</React.StrictMode>
);