import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Vui lòng thay thế clientId bằng Client ID thực tế từ Google Cloud Console
const GOOGLE_CLIENT_ID = "409878280574-mvg07sgaqnadfs57qsm962baicjj63eo.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
