import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const isValidClerkKey = (key?: string): key is string =>
  typeof key === 'string' &&
  (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
  !key.includes('placeholder');

const root = createRoot(document.getElementById('root')!);

if (isValidClerkKey(PUBLISHABLE_KEY)) {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
