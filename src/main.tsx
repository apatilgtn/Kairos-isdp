import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

// Enhanced global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Log temporal dead zone errors for debugging
  if (event.error.message?.includes('before initialization')) {
    console.error('Temporal dead zone error detected:', {
      message: event.error.message,
      stack: event.error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Global emergency functions for debugging
(window as any).KAIROS_EMERGENCY = {
  reset: () => {
    console.log('Performing emergency reset...');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  },
  info: () => {
    console.log('KAIROS Platform Debug Information');
    console.log('Available commands:');
    console.log('- KAIROS_EMERGENCY.reset() - Clear all data and reload');
    console.log('- KAIROS_EMERGENCY.clearStorage() - Clear only storage');
    console.log('Current storage:', Object.keys(localStorage));
  },
  clearStorage: () => {
    console.log('Clearing localStorage...');
    localStorage.clear();
    sessionStorage.clear();
    console.log('Storage cleared. Reload the page to complete reset.');
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
