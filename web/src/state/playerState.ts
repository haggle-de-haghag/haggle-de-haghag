import {ForeignPlayer, Game, Player, PlayerId, Rule, RuleId, Token, TokenId} from "../model";
import {combineReducers, configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {all, call, delay, put, race, takeEvery} from "redux-saga/effects";
import * as PlayerApi from "../rest/player";
import {FullPlayerInfo} from "../rest/player";
import createSagaMiddleware from "redux-saga";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {retryForever} from "./sagaUtil";
import {createNotificationState, NotificationState} from "./subState/notificationState";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

export interface PlayerState {
    // Model state
    gameTitle: string;
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];
    tokens: Token[];

    // UI state
    selectedRuleId?: RuleId,
    selectedTokenId?: TokenId;
    amountInput: number,
    selectedPlayerId: PlayerId;
    errorNotification: NotificationState;
    notification: NotificationState;
    updating?: string; // initiator id
}

export interface ShareRule {
    rule: Rule;
    player: ForeignPlayer;
}

export interface GiveToken {
    playerId: PlayerId;
    tokenId: TokenId;
    amount: number;
}

export interface SetErrorMessage {
    message?: string;
    expected?: string;
}

const notificationState = createNotificationState('notification');
const errorNotificationState = createNotificationState('errorMessage', 10*1000);

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
        tokens: [],
        selectedRuleId: undefined,
        amountInput: 1,
        selectedPlayerId: 0,
        errorNotification: {},
        notification: {},
    } as PlayerState,
    reducers: {
        shareRule: (state, action: PayloadAction<ShareRule>) => state,
        giveToken: (state, action: PayloadAction<GiveToken>) => state,

        setSelectedRuleId: (state, action: PayloadAction<RuleId>) => {
            state.selectedRuleId = action.payload;
            state.selectedTokenId = undefined;
        },

        setSelectedTokenId: (state, action: PayloadAction<TokenId>) => {
            state.selectedTokenId = action.payload;
            state.selectedPlayerId = state.players.length > 0 ? state.players[0].id : 0;
            state.amountInput = 1;
            state.selectedRuleId = undefined;
        },

        setSelectedPlayerId: (state, action: PayloadAction<PlayerId>) => {
            state.selectedPlayerId = action.payload;
        },

        setAmountInput: (state, action: PayloadAction<number>) => {
            state.amountInput = action.payload;
        },

        beginUpdate: (state, action: PayloadAction<string>) => {
            state.updating = action.payload;
        },

        endUpdate: (state, action: PayloadAction<string>) => {
            if (state.updating == action.payload) {
                state.updating = undefined;
            }
        },

        setGameState: (state, action: PayloadAction<FullPlayerInfo>) => {
            const info = action.payload;
            state.gameTitle = info.gameTitle;
            state.player = info.player;
            state.players = info.players;
            state.rules = info.rules;
            state.tokens = info.tokens;

            if (info.rules.find(rule => rule.id == state.selectedRuleId) === undefined) {
                state.selectedRuleId = undefined;
            }
            if (info.tokens.find(token => token.id == state.selectedTokenId) === undefined) {
                state.selectedTokenId = undefined;
            }
        },

        initialize: (state, action: PayloadAction<FullPlayerInfo>) => {
            const info = action.payload;
            return {
                ...state,
                gameTitle: info.gameTitle,
                player: info.player,
                players: info.players,
                rules: info.rules,
                tokens: info.tokens,
                selectedRuleId: undefined,
            };
        }
    },
    extraReducers: (builder) => {
        builder.addDefaultCase((state, action) => {
            state.notification = notificationState.slice.reducer(state.notification, action);
            state.errorNotification = errorNotificationState.slice.reducer(state.errorNotification, action);
        })
    }
});
export const actions = {
    default: slice.actions,
    errorNotification: errorNotificationState.slice.actions,
    notification: notificationState.slice.actions,
};

function* shareRuleSaga(action: ReturnType<typeof actions.default.shareRule>) {
    const payload = action.payload;
    try {
        const success: boolean = yield call(PlayerApi.shareRule, payload.rule.id, payload.player.id);
        if (success) {
            yield put(actions.notification.showNotificationMessage('ルールを共有しました。'));
        } else {
            yield put(actions.notification.showNotificationMessage('ルールを共有できませんでした。'));
        }
    } catch (e) {
        console.error('API error: shareRule', e);
        yield put(actions.errorNotification.showNotificationMessage('ルールの共有に失敗しました。もう一度試してみてください。'));
    }
}

function* giveTokenSaga(action: ReturnType<typeof actions.default.giveToken>) {
    const payload = action.payload;
    try {
        const success: boolean = yield call(PlayerApi.giveToken, payload.tokenId, payload.playerId, payload.amount);
        if (success) {
            yield put(actions.notification.showNotificationMessage(`トークンを渡しました。`));
        } else {
            yield put(actions.notification.showNotificationMessage('トークンを渡せませんでした。'));
        }
    } catch (e) {
        console.error('API error: giveToken', e);
        yield put(actions.errorNotification.showNotificationMessage('トークンの受け渡しに失敗しました。もう一度試してみてください。'));
    }
}

function* installWatcherSaga() {
    yield all([
        takeEvery(actions.default.shareRule, shareRuleSaga),
        takeEvery(actions.default.giveToken, giveTokenSaga),
    ])
}

function* pollSaga() {
    while (true) {
        const initiator = `poll-${Date.now()}`;
        yield put(actions.default.beginUpdate(initiator));
        try {
            const { fullInfo, cancel }: { fullInfo?: FullPlayerInfo, cancel?: boolean } = yield race({
                fullInfo: call(PlayerApi.listFullInfo),
                cancel: delay(5000),
            });
            if (fullInfo) {
                yield put(actions.default.setGameState(fullInfo));
            } else if (cancel) {
                yield put(actions.errorNotification.showNotificationMessage("サーバーが応答していません"));
            }
        } catch (e) {
            console.error("Polling failed", e);
            yield put(actions.errorNotification.showNotificationMessage("サーバーに接続できませんでした"));
        } finally {
            yield put(actions.default.endUpdate(initiator));
        }
        yield delay(5000);
    }
}

function* initSaga() {
    const key = location.hash.substring(1);
    yield call(PlayerApi.reconfigure, key);
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(retryForever, installWatcherSaga);
sagaMiddleware.run(retryForever, notificationState.watcherSaga);
sagaMiddleware.run(retryForever, errorNotificationState.watcherSaga);
sagaMiddleware.run(initSaga as any);
sagaMiddleware.run(pollSaga as any);

export type PLDispatch = typeof store.dispatch;
export const usePLDispatch = () => useDispatch<PLDispatch>();
export const usePLSelector: TypedUseSelectorHook<PlayerState> = useSelector;
