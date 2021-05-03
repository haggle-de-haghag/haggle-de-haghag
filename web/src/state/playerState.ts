import {ForeignPlayer, Game, Player, Rule, RuleId} from "../model";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {all, call, put, takeEvery} from "redux-saga/effects";
import * as PlayerApi from "../rest/player";
import {FullPlayerInfo} from "../rest/player";
import createSagaMiddleware from "redux-saga";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

export interface PlayerState {
    // Model state
    gameTitle: string;
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];

    // UI state
    selectedRuleId?: RuleId,
}

export interface ShareRule {
    rule: Rule;
    player: ForeignPlayer;
}

const slice = createSlice({
    name: 'player',
    initialState: {
        gameTitle: '',
        player: {
            id: 0,
            displayName: "",
            playerKey: "",
        },
        players: [],
        rules: [],
        selectedRuleId: undefined,
    } as PlayerState,
    reducers: {
        shareRule: (state, action: PayloadAction<ShareRule>) => {},

        setSelectedRuleId: (state, action: PayloadAction<RuleId>) => {
            state.selectedRuleId = action.payload;
        },

        initialize: (state, action: PayloadAction<FullPlayerInfo>) => {
            const info = action.payload;
            return {
                ...state,
                gameTitle: info.gameTitle,
                player: info.player,
                players: info.players,
                rules: info.rules,
                selectedRuleId: undefined,
            };
        }
    },
});
export const actions = slice.actions;

function* shareRuleSaga(action: ReturnType<typeof actions.shareRule>) {
    const payload = action.payload;
    const success: boolean = yield call(PlayerApi.shareRule, payload.rule.id, payload.player.id);
    // TODO: Show success message
}

function* installWatcherSaga() {
    yield all([
        takeEvery(actions.shareRule, shareRuleSaga)
    ])
}

function* initSaga() {
    const key = location.hash.substring(1);
    yield call(PlayerApi.reconfigure, key);
    const fullInfo: FullPlayerInfo = yield call(PlayerApi.listFullInfo);
    yield put(actions.initialize(fullInfo));
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(installWatcherSaga);
sagaMiddleware.run(initSaga as any);

export type PLDispatch = typeof store.dispatch;
export const usePLDispatch = () => useDispatch<PLDispatch>();
export const usePLSelector: TypedUseSelectorHook<PlayerState> = useSelector;
