import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../frontend/src/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se encontró el elemento raíz");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);