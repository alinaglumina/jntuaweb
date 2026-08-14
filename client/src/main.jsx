import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast.jsx';
import { store } from './store/index.js';
import { queryClient } from './lib/queryClient.js';
import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
        <ToastProvider>
          <App />
        </ToastProvider>
=======

          <ToastProvider>
            <App />
          </ToastProvider>

>>>>>>> 8230811 (Migrate from react-helmet-async to React 19 native document metadata)
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
