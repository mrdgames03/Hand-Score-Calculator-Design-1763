import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Create a root element
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Render the app
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker from index file for better compatibility
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // We register the service worker after the page has loaded
    // to ensure it doesn't impact initial load performance
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}