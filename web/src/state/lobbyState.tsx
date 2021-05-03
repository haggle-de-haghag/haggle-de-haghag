import createSagaMiddleware from "redux-saga";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {all, call, takeEvery} from "redux-saga/effects";
import * as LobbyApi from '../rest/lobby';
import {Game, Player} from "../model";
import {retryForever} from "./sagaUtil";

export interface LobbyState {
    gameTitleInput: string;
    gameKeyInput: string;
    playerNameInput: string;
}

interface JoinGame {
    gameKey: string;
    playerName: string;
}

interface CreateGame {
    title: string;
}

const slice = createSlice({
    name: 'lobby',
    initialState: {
        gameTitleInput: '',
        gameKeyInput: '',
        playerNameInput: '',
    } as LobbyState,
    reducers: {
        setGameTitleInput: (state, action: PayloadAction<string>) => {
            state.gameTitleInput = action.payload;
        },

        setGameKeyInput: (state, action: PayloadAction<string>) => {
            state.gameKeyInput = action.payload;
        },

        setPlayerNameInput: (state, action: PayloadAction<string>) => {
            state.playerNameInput = action.payload;
        },

        joinGame: (state, action: PayloadAction<JoinGame>) => {},
        createGame: (state, action: PayloadAction<CreateGame>) => {}
    }
});

export const actions = slice.actions;

function* joinGameSaga(action: ReturnType<typeof actions.joinGame>) {
    const payload = action.payload;
    const player: Player = yield call(LobbyApi.joinGame, payload.gameKey, payload.playerName);
    location.assign(`${location.protocol}//${location.host}/player.html#${player.playerKey}`);
}

function* createGameSaga(action: ReturnType<typeof actions.createGame>) {
    const payload = action.payload;
    const game: Game = yield call(LobbyApi.createGame, payload.title);
    location.assign(`${location.protocol}//${location.host}/game_master.html#${game.masterKey}`);
}

function* createWatcherSaga() {
    yield all([
        takeEvery(actions.joinGame, joinGameSaga),
        takeEvery(actions.createGame, createGameSaga),
    ]);
}

function* initializeSaga() {
    yield call(LobbyApi.configure);
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(initializeSaga);
sagaMiddleware.run(retryForever, createWatcherSaga);

export type LobbyDispatch = typeof store.dispatch;
export const useLobbyDispatch = () => useDispatch<LobbyDispatch>();
export const useLobbySelector: TypedUseSelectorHook<LobbyState> = useSelector;