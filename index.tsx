
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isPlaceholderKey = !PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('pk_test_...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (isPlaceholderKey) {
  root.render(
    <React.StrictMode>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f8fafc'
      }}>
        <h1 style={{ color: '#0f172a' }}>Configuration Required</h1>
        <p style={{ color: '#64748b', maxWidth: '500px' }}>
          Please set your <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> in your <code>.env.local</code> file.
        </p>
        <p style={{ color: '#64748b' }}>
          You can find your API keys at <a href="https://dashboard.clerk.com/last-active?path=api-keys" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>dashboard.clerk.com</a>
        </p>
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left' }}>
          <code style={{ fontSize: '12px' }}>VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key</code>
        </div>
      </div>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
