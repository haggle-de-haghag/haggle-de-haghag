import {ForeignPlayer, Game, Player, PlayerId, Rule, RuleId, Token, TokenId} from "../model";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {all, call, delay, put, takeEvery} from "redux-saga/effects";
import * as PlayerApi from "../rest/player";
import {FullPlayerInfo} from "../rest/player";
import createSagaMiddleware from "redux-saga";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {retryForever} from "./sagaUtil";

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
    errorMessage?: string;
    notification?: string;
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

export interface SetNotificationMessage {
    message?: string;
    expected?: string;
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
        tokens: [],
        selectedRuleId: undefined,
        amountInput: 1,
        selectedPlayerId: 0,
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

        showErrorMessage: (state, action: PayloadAction<string>) => state,

        setErrorMessage: (state, action: PayloadAction<SetErrorMessage>) => {
            const payload = action.payload;
            if (payload.expected === undefined || payload.expected == state.errorMessage) {
                state.errorMessage = payload.message;
            }
        },

        showNotificationMessage: (state, action: PayloadAction<string>) => state,

        setNotificationMessage: (state, action: PayloadAction<SetNotificationMessage>) => {
            const payload = action.payload;
            if (payload.expected === undefined || payload.expected == state.notification) {
                state.notification = payload.message;
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
});
export const actions = slice.actions;

function* showErrorSaga(action: ReturnType<typeof actions.showErrorMessage>) {
    const message = action.payload;
    yield put(actions.setErrorMessage({ message }));
    yield delay(10 * 1000);
    yield put(actions.setErrorMessage({ message: undefined, expected: message }));
}

function* showNotificationSaga(action: ReturnType<typeof actions.showNotificationMessage>) {
    const message = action.payload;
    yield put(actions.setNotificationMessage({ message }));
    yield delay(3 * 1000);
    yield put(actions.setNotificationMessage({ message: undefined, expected: message }));
}

function* shareRuleSaga(action: ReturnType<typeof actions.shareRule>) {
    const payload = action.payload;
    try {
        const success: boolean = yield call(PlayerApi.shareRule, payload.rule.id, payload.player.id);
        if (success) {
            yield put(actions.showNotificationMessage('ルールを共有しました。'));
        } else {
            yield put(actions.showNotificationMessage('ルールを共有できませんでした。'));
        }
    } catch (e) {
        console.error('API error: shareRule', e);
        yield put(actions.showErrorMessage('ルールの共有に失敗しました。もう一度試してみてください。'));
    }
}

function* giveTokenSaga(action: ReturnType<typeof actions.giveToken>) {
    const payload = action.payload;
    try {
        const success: boolean = yield call(PlayerApi.giveToken, payload.tokenId, payload.playerId, payload.amount);
        if (success) {
            yield put(actions.showNotificationMessage(`トークンを渡しました。`));
        } else {
            yield put(actions.showNotificationMessage('トークンを渡せませんでした。'));
        }
    } catch (e) {
        console.error('API error: giveToken', e);
        yield put(actions.showErrorMessage('トークンの受け渡しに失敗しました。もう一度試してみてください。'));
    }
}

function* installWatcherSaga() {
    yield all([
        takeEvery(actions.shareRule, shareRuleSaga),
        takeEvery(actions.giveToken, giveTokenSaga),
        takeEvery(actions.showErrorMessage, showErrorSaga),
        takeEvery(actions.showNotificationMessage, showNotificationSaga),
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
sagaMiddleware.run(retryForever, installWatcherSaga);
sagaMiddleware.run(initSaga as any);

export type PLDispatch = typeof store.dispatch;
export const usePLDispatch = () => useDispatch<PLDispatch>();
export const usePLSelector: TypedUseSelectorHook<PlayerState> = useSelector;
