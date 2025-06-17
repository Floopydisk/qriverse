
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import security initialization
import { securityManager } from './lib/security/security-init';

// Initialize security before React app
securityManager.init().then(() => {
  console.log('Security initialization completed');
  
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Security initialization failed:', error);
  
  // Still render the app but with degraded security
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
