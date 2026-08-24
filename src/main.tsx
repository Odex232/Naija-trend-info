import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against third-party ad script TagErrors (e.g. Google AdSense asynchronous DOM mutations in SPAs)
if (typeof window !== 'undefined') {
  // 1. Intercept adsbygoogle array and its push method safely
  let _adsbygoogle = (window as any).adsbygoogle || [];
  const wrapSafePush = (target: any) => {
    if (!target || typeof target.push !== 'function') return target;
    if (target._safePushWrapped) return target;
    const origPush = target.push.bind(target);
    target.push = function (...args: any[]) {
      try {
        return origPush(...args);
      } catch (err: any) {
        console.debug('adsbygoogle TagError intercepted safely:', err?.message || err);
        return 0;
      }
    };
    target._safePushWrapped = true;
    return target;
  };

  _adsbygoogle = wrapSafePush(_adsbygoogle);

  try {
    Object.defineProperty(window, 'adsbygoogle', {
      get() {
        return _adsbygoogle;
      },
      set(val) {
        _adsbygoogle = wrapSafePush(val);
      },
      configurable: true,
      enumerable: true
    });
  } catch {
    (window as any).adsbygoogle = _adsbygoogle;
  }

  // 2. Global Error Event Interceptor
  window.addEventListener('error', (event) => {
    const msg = (event?.message || '').toLowerCase();
    const errorObj = event?.error;
    const errorStr = (errorObj?.message || errorObj?.name || String(errorObj || '')).toLowerCase();
    
    if (
      msg.includes('adsbygoogle') ||
      msg.includes('tagerror') ||
      msg.includes("all 'ins' elements") ||
      msg.includes('already have ads in them') ||
      errorStr.includes('adsbygoogle') ||
      errorStr.includes('tagerror') ||
      errorStr.includes("all 'ins' elements") ||
      errorStr.includes('already have ads in them')
    ) {
      event.preventDefault();
      event.stopPropagation?.();
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
      msg.includes("all 'ins' elements") ||
      msg.includes('already have ads in them')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);

  // 4. Fallback window.onerror handler
  const prevOnError = window.onerror;
  window.onerror = function (msg, url, lineNo, colNo, error) {
    const errStr = (String(msg || '') + ' ' + String(error?.message || error || '')).toLowerCase();
    if (
      errStr.includes('adsbygoogle') ||
      errStr.includes('tagerror') ||
      errStr.includes("all 'ins' elements") ||
      errStr.includes('already have ads in them')
    ) {
      return true;
    }
    if (typeof prevOnError === 'function') {
      return (prevOnError as any)(msg, url, lineNo, colNo, error);
    }
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

