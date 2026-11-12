import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.css';
const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
    {import.meta.env.PROD && <Analytics />}
  </React.StrictMode>
);
