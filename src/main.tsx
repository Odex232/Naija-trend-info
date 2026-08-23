import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against third-party ad script TagErrors (e.g. Google AdSense asynchronous DOM mutations in SPAs)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('adsbygoogle') ||
      msg.includes("All 'ins' elements in the DOM with class=adsbygoogle already have ads in them") ||
      msg.includes('TagError')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = reason?.message || String(reason || '');
    if (msg.includes('adsbygoogle') || msg.includes('TagError')) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

