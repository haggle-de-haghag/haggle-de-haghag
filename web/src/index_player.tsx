import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import PlayerPage from "./page/PlayerPage";
import {ProvideInMemoryGameState} from "./state/inMemory";

ReactDOM.render(
    <React.StrictMode>
        <ProvideInMemoryGameState>
            <App><PlayerPage /></App>
        </ProvideInMemoryGameState>
    </React.StrictMode>,
    document.getElementById('root')
);
