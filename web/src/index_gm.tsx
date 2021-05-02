import ReactDOM from "react-dom";
import React from "react";
import App from "./App";
import GameMasterPage from "./page/gameMaster/GameMasterPage";
import {ProvideInMemoryGameMasterState} from "./state/inMemory";

ReactDOM.render(
    <React.StrictMode>
        <ProvideInMemoryGameMasterState>
            <App><GameMasterPage /></App>
        </ProvideInMemoryGameMasterState>
    </React.StrictMode>,
    document.getElementById('root')
);
