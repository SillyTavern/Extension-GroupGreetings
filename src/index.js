import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootContainer = document.getElementById('first_message_div');
const rootElement = document.createElement('div');
rootContainer.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
