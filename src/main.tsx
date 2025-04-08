
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Important: Users need to configure these Auth0 environment variables
// VITE_AUTH0_DOMAIN
// VITE_AUTH0_CLIENT_ID
// VITE_AUTH0_AUDIENCE (optional)

createRoot(document.getElementById("root")!).render(<App />);
