import ReactDOM from "react-dom";
import React from "react";
import App from "./App";
import GameMasterPage from "./page/gameMaster/GameMasterPage";

ReactDOM.render(
    <React.StrictMode>
        <App><GameMasterPage /></App>
    </React.StrictMode>,
    document.getElementById('root')
);
