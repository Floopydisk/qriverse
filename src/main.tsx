
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

if (!domain || !clientId) {
    console.error(
        "Auth0 domain and client ID must be provided in .env file. Please check your environment variables."
    );
}
// Important: Users need to configure these Auth0 environment variables
// VITE_AUTH0_DOMAIN
// VITE_AUTH0_CLIENT_ID
// VITE_AUTH0_AUDIENCE (optional)

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* Auth0Provider wraps the entire application to provide authentication context */}
        {/* Redirect URI is set to the current origin */}
        {/* useRefreshTokens and cacheLocation are set for better token management */}
        {/* authorizationParams is used to specify the audience for the API */}
        {/* If you have a custom domain, you can set it here */}

        {domain && clientId && (
            <Auth0Provider
                domain={domain}
                clientId={clientId}
                authorizationParams={{
                    redirect_uri: window.location.origin,
            }}
            >
                <App />
            </Auth0Provider>
        )}
    </React.StrictMode>
);
