import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './App/store.js';
import ErrorBoundary from './Components/ErrorBoundary';
import { ThemeProvider } from './Context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Provider store={store}>
          <PersistGate persistor={persistor} loading={null}>
            <App />
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
