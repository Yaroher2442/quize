import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const onConfirmRefresh = function (event) {
    event.preventDefault();
    return event.returnValue = "Вы уверены, что хотите покинуть страницу?";
}

window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
