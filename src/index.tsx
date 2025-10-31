import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { worker } from './mocks/browser';
import { seedDatabase } from './seedData';

// Start the MSW worker and seed the local IndexedDB BEFORE rendering the app.
// This avoids race conditions where the app makes API calls before the
// service worker is active and the requests fall back to the static host
// (which returns index.html and causes JSON parse errors).
const prepare = async () => {
  try {
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('MSW worker started (index)');
  } catch (err) {
    console.warn('MSW worker failed to start:', err);
  }

  try {
    await seedDatabase();
    console.log('Database seeded (index)');
  } catch (err) {
    console.warn('Database seeding failed:', err);
  }
};

prepare().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Performance metrics
  reportWebVitals();
});
