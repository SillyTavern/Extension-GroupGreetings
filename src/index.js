/* global SillyTavern */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { handleFirstMessageSelected } from './handlers/greetingHandler';

const extensionName = 'Extension-GroupGreetings';
const { eventSource, eventTypes } = SillyTavern.getContext();

// Register event handler for group greeting selection
eventSource.on(eventTypes.CHARACTER_FIRST_MESSAGE_SELECTED, handleFirstMessageSelected);

// Create container for the React App
const rootContainer = document.getElementById('first_message_div');
const rootElement = document.createElement('div');
rootElement.id = `${extensionName}-button`;
rootElement.classList.add('interactable');
rootElement.tabIndex = 0;
rootContainer.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
