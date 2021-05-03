import ReactDOM from "react-dom";
import React from "react";
import {Provider} from "react-redux";
import App from "./App";
import {LobbyPage} from "./page/lobby/LobbyPage";
import {store} from "./state/lobbyState";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App><LobbyPage /></App>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

