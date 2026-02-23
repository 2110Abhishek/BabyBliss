// src/components/PWAInstall/PWAInstall.jsx (debug version - remove debug code before production)
import React, { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PWAInstall.css';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const PWAInstall = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      console.log('[PWA DEBUG] beforeinstallprompt event fired', e);
      e.preventDefault(); // prevent the browser showing mini-infobar
      // Save event locally and on window for manual testing
      setDeferredPrompt(e);
      window.__deferredPWA = e;
      setVisible(true);
    }

    function onAppInstalled() {
      console.log('[PWA DEBUG] appinstalled event fired');
      setDeferredPrompt(null);
      window.__deferredPWA = null;
      setVisible(false);
      toast.success('BlissBloomly installed!');
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    // debug: log if service worker is controlling
    if ('serviceWorker' in navigator) {
      console.log('[PWA DEBUG] SW controller:', navigator.serviceWorker.controller);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      if (!deferredPrompt) {
        toast('Install not available right now');
        return;
      }
      console.log('[PWA DEBUG] calling prompt()');
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('[PWA DEBUG] userChoice', choice);
      if (choice.outcome === 'accepted') toast.success('Thanks — app installed!');
      else toast('Install dismissed');
      setDeferredPrompt(null);
      window.__deferredPWA = null;
      setVisible(false);
    } catch (err) {
      console.error('Install error', err);
      toast.error('Install failed');
    }
  };

  // debug helper to trigger from the UI if we have window.__deferredPWA
  const handleDebugTrigger = async () => {
    const e = window.__deferredPWA;
    if (!e) return toast('No saved prompt available (window.__deferredPWA is empty)');
    console.log('[PWA DEBUG] manual trigger from debug button', e);
    try {
      e.prompt();
      const choice = await e.userChoice;
      console.log('[PWA DEBUG] manual choice', choice);
      if (choice.outcome === 'accepted') toast.success('Thanks — app installed!');
      else toast('Install dismissed');
      setDeferredPrompt(null);
      window.__deferredPWA = null;
      setVisible(false);
    } catch (err) {
      console.error(err);
      toast.error('Manual trigger failed');
    }
  };

  // Do not render anything if not visible and no debug on localhost
  if (!visible && !isLocal) return null;

  return (
    <div className={`pwa-install ${className}`}>
      {visible && (
        <button className="pwa-install-btn" onClick={handleInstallClick} aria-label="Install BlissBloomly">
          <FiDownload />
          Install BlissBloomly
        </button>
      )}

      {/* Debug helper (only visible on localhost) */}
      {isLocal && (
        <button
          style={{
            marginLeft: visible ? 8 : 0,
            padding: '0.35rem 0.6rem',
            borderRadius: 8,
            background: '#334155',
            color: '#fff',
            border: 'none',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={handleDebugTrigger}
          title="Debug: trigger saved install prompt (localhost only)"
        >
          Debug Install
        </button>
      )}
    </div>
  );
};

export default PWAInstall;
