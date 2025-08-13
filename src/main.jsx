import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster"; // Required for useToast

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Analytics />
      <App />
      <Toaster /> {/* Add Toaster here for toast notifications to appear */}
    </BrowserRouter>
  </React.StrictMode>
);