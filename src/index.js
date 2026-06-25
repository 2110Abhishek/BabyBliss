import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import { initFirebase } from './firebase/firebase';

const startApp = async () => {
  try {
    await initFirebase();
  } catch (error) {
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2>Failed to connect to backend configuration</h2>
        <p>Could not load public keys from the server. Please ensure the backend is running and accessible.</p>
        <pre style="color: #666;">${error.message}</pre>
      </div>
    `;
    return;
  }

  // FORCE UNREGISTER SERVICE WORKER TO FIX CACHE ISSUES
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

startApp();
