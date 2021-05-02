import ReactDOM from "react-dom";
import React from "react";
import App from "./App";
import GameMasterPage from "./page/gameMaster/GameMasterPage";
import {Provider} from "react-redux";
import {store} from "./state/gameMasterState";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App><GameMasterPage /></App>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
