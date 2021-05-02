import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import PlayerPage from "./page/PlayerPage";

ReactDOM.render(
    <React.StrictMode>
        <App><PlayerPage /></App>
    </React.StrictMode>,
    document.getElementById('root')
);
