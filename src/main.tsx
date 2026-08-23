import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against third-party ad script TagErrors (e.g. Google AdSense asynchronous DOM mutations in SPAs)
if (typeof window !== 'undefined') {
  // 1. Monkey-patch adsbygoogle.push to trap synchronous TagError throws
  const originalAdsbygoogle = (window as any).adsbygoogle || [];
  (window as any).adsbygoogle = new Proxy(originalAdsbygoogle, {
    get(target, prop, receiver) {
      if (prop === 'push') {
        return function (...args: any[]) {
          try {
            return Array.prototype.push.apply(target, args);
          } catch (err: any) {
            console.debug('adsbygoogle push intercepted safely:', err?.message || err);
            return 0;
          }
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });

  // 2. Global Error Event Interceptor
  window.addEventListener('error', (event) => {
    const msg = (event?.message || '').toLowerCase();
    const errorObj = event?.error;
    const errorStr = (errorObj?.message || errorObj?.name || String(errorObj || '')).toLowerCase();
    
    if (
      msg.includes('adsbygoogle') ||
      msg.includes('tagerror') ||
      msg.includes("all 'ins' elements in the dom") ||
      errorStr.includes('adsbygoogle') ||
      errorStr.includes('tagerror') ||
      errorStr.includes("all 'ins' elements in the dom")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return true;
    }
  }, true);

  // 3. Global Unhandled Rejection Interceptor
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (reason?.message || reason?.name || String(reason || '')).toLowerCase();
    if (
      msg.includes('adsbygoogle') ||
      msg.includes('tagerror') ||
      msg.includes("all 'ins' elements in the dom")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

