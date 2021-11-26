import {
    Game,
    GameState,
    Player,
    PlayerId,
    Rule,
    RuleAccessMap,
    RuleId,
    Token,
    TokenAllocationMap,
    TokenId
} from "../model";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import {all, call, delay, put, race, takeEvery} from 'redux-saga/effects';
import * as GameMasterRestApi from '../rest/gameMaster';
import {FullGameInfo, PlayerIdWithAccess, PlayerIdWithAmount, UpdateTokenResponse} from '../rest/gameMaster';
import {retryForever} from "./sagaUtil";
import {createNotificationState, NotificationState} from "./subState/notificationState";
import {NotFoundError} from "../rest/common";
import {FullPlayerInfo} from "../rest/player";
import * as PlayerApi from "../rest/player";
import {knownGames} from "../storage/knownGames";

export interface GameMasterState {
    // Model state
    game: Game;
    players: Player[];
    rules: Rule[];
    ruleAccessList: RuleAccessMap;
    tokens: Token[];
    tokenAllocationMap: TokenAllocationMap;

    // UI state (Rule)
    ruleTitleInput: string;
    ruleTextInput: string;
    selectedRuleId?: RuleId;
    defaultAssignmentsInput: PlayerId[];

    // UI state (Token)
    tokenTitleInput: string;
    tokenTextInput: string;
    selectedTokenId?: TokenId;
    allocationInputs: { [playerId: number]: number };
    errorNotification: NotificationState;
    notification: NotificationState;

    // UI state (other)
    updating?: string; // initiator id
}

export interface CreateRule {
    title: string;
    text: string;
    accessList: PlayerId[];
}

export interface UpdateRule {
    ruleId: RuleId;
    title?: string;
    text?: string;
    defaultAssignments?: PlayerId[];
}

export interface MoveRule {
    ruleId: RuleId;
    to: number;
}

export interface ChangeRuleAccess {
    playerId: PlayerId;
    ruleId: RuleId;
    assigned: boolean;
}

export interface CreateToken {
    title: string;
    text: string;
}

export interface UpdateToken {
    tokenId: TokenId;
    title?: string;
    text?: string;
    allocation?: {[playerId: number]: number};
}

export interface SetAllocation {
    playerId: number;
    amount: number;
}

export interface ReplaceAllocation {
    tokenId: number;
    allocation: PlayerIdWithAmount[];
}

export interface AddTokenToPlayer {
    playerId: number;
    tokenId: number;
    amount: number;
}

export interface SetPlayerTokenAllocation {
    playerId: number;
    tokenId: number;
    amount: number;
}

const errorNotificationState = createNotificationState('errorNotification', 10*1000);
const notificationState = createNotificationState('notification');

const initialState: GameMasterState = {
    game: {
        id: 0,
        title: '',
        gameKey: '',
        masterKey: '',
        state: 'PLAYING',
    },
    players: [],
    rules: [],
    ruleAccessList: [],
    tokens: [],
    tokenAllocationMap: {},
    ruleTitleInput: '',
    ruleTextInput: '',
    defaultAssignmentsInput: [],
    tokenTitleInput: '',
    tokenTextInput: '',
    allocationInputs: [],
    errorNotification: {},
    notification: {},
};

const slice = createSlice({
    name: 'state',
    initialState: initialState,
    reducers: {
        createRule: (state, action: PayloadAction<CreateRule>) => state,
        updateRule: (state, action: PayloadAction<UpdateRule>) => state,
        deleteRule: (state, action:PayloadAction<RuleId>) => state,

        addRule: (state, action: PayloadAction<Rule>) => {
            return {
                ...state,
                rules: [...state.rules, action.payload]
            };
        },

        replaceRule: (state, action: PayloadAction<Rule>) => {
            const rule = action.payload;
            const index = state.rules.findIndex((r) => r.id == rule.id);
            if (index == -1) {
                throw Error(`Rule ${rule.id} does not exist`);
            }
            state.rules[index] = rule;
        },

        removeRule: (state, action: PayloadAction<RuleId>) => {
            state.rules = state.rules.filter((rule) => rule.id != action.payload);
            if (state.selectedRuleId == action.payload) {
                state.selectedRuleId = undefined;
            }
            state.rules.forEach((r, index) => r.ruleNumber = index+1);
        },

        moveRule: (state, action: PayloadAction<MoveRule>) => {
            const { ruleId, to } = action.payload;
            const fromIndex = state.rules.findIndex((r) => r.id == ruleId);
            const rule = state.rules[fromIndex];
            state.rules.splice(fromIndex, 1);
            state.rules = state.rules.slice(0, to).concat(rule, state.rules.slice(to))
                .map((r, index) =>({
                    ...r,
                    ruleNumber: index + 1,
                }));
        },

        setRules: (state, action: PayloadAction<Rule[]>) => {
            state.rules = action.payload;
        },

        changeRuleAccessListInput: (state, action: PayloadAction<ChangeRuleAccess>) => {
            const {ruleId, playerId, assigned} = action.payload;
            const tempAssignments = state.defaultAssignmentsInput.filter((pid) => pid != playerId);
            if (assigned) {
                tempAssignments.push(playerId);
            }
            state.defaultAssignmentsInput = tempAssignments;
        },

        setRuleTitleInput: (state, action: PayloadAction<string>) => {
            state.ruleTitleInput = action.payload;
        },

        setRuleTextInput: (state, action: PayloadAction<string>) => {
            state.ruleTextInput = action.payload;
        },

        changeSelectedRule: (state, action: PayloadAction<RuleId>) => {
            const ruleId = action.payload;
            const rule = state.rules.find((r) => r.id == ruleId);
            if (rule == undefined) {
                console.error(`Rule ${ruleId} doesn't exist. Action: ${action}`);
                return state;
            }

            state.selectedRuleId = ruleId;
            state.ruleTitleInput = rule.title;
            state.ruleTextInput = rule.text;
            state.defaultAssignmentsInput = (state.ruleAccessList[ruleId] ?? [])
                .filter((pwa) => pwa.accessType == 'ASSIGNED')
                .map((pwa) => pwa.playerId);
            state.selectedTokenId = undefined;
        },

        createToken: (state, action: PayloadAction<CreateToken>) => state,
        updateToken: (state, action: PayloadAction<UpdateToken>) => state,
        deleteToken: (state, action: PayloadAction<TokenId>) => state,

        addToken: (state, action: PayloadAction<Token>) => {
            state.tokens.push(action.payload);
        },

        replaceToken: (state, action: PayloadAction<Token>) => {
            const token = action.payload;
            const index = state.tokens.findIndex((t) => t.id == token.id);
            if (index == -1) {
                console.error(`Token ${token.id} doesn't exist`);
                return state;
            }
            state.tokens[index] = token;
        },

        removeToken: (state, action: PayloadAction<TokenId>) => {
            state.tokens = state.tokens.filter((token) => token.id != action.payload);
            if (state.selectedTokenId == action.payload) {
                state.selectedTokenId = undefined;
            }
        },

        replaceAllocation: (state, action: PayloadAction<ReplaceAllocation>) => {
            const payload = action.payload;
            state.tokenAllocationMap[payload.tokenId] = payload.allocation;
        },

        changeSelectedToken: (state, action: PayloadAction<TokenId>) => {
            const tokenId = action.payload;
            const token = state.tokens.find((t) => t.id == tokenId);
            if (token == undefined) {
                console.error(`Token ${tokenId} doesn't exist. Action: ${action}`);
                return state;
            }

            const allocation: {[playerId: number]: number} = {};
            const allocationMap = state.tokenAllocationMap[tokenId] ?? [];
            state.players.forEach((p) => {
                const playerIdWithAmount = allocationMap.find((pwa) => pwa.playerId == p.id);
                allocation[p.id] = playerIdWithAmount?.amount ?? 0;
            });

            state.selectedTokenId = tokenId;
            state.tokenTitleInput = token.title;
            state.tokenTextInput = token.text;
            state.selectedRuleId = undefined;
            state.allocationInputs = allocation;
        },

        setTokenTitleInput: (state, action: PayloadAction<string>) => {
            state.tokenTitleInput = action.payload;
        },

        setTokenTextInput: (state, action: PayloadAction<string>) => {
            state.tokenTextInput = action.payload;
        },

        setAllocation: (state, action: PayloadAction<SetAllocation>) => {
            const payload = action.payload;
            state.allocationInputs[payload.playerId] = payload.amount;
        },

        addTokenToPlayer: (state, action: PayloadAction<AddTokenToPlayer>) => state,

        setPlayerTokenAllocation: (state, action: PayloadAction<SetPlayerTokenAllocation>) => {
            const { playerId, tokenId, amount } = action.payload;
            const allocation = state.tokenAllocationMap[tokenId].find((a) => a.playerId == playerId);
            if (allocation) {
                allocation.amount = amount;
            } else {
                state.tokenAllocationMap[tokenId].push({playerId, amount});
            }
        },

        updateTitle: (state, action: PayloadAction<string>) => state,

        createStubPlayers: (state, action: PayloadAction<number>) => {},

        setGameState: (state, action: PayloadAction<GameState>) => {
            state.game.state = action.payload;
        },

        kickPlayer: (state, action: PayloadAction<Player>) => {
            const player = action.payload;
            const index = state.players.findIndex((p) => p.id == player.id);
            if (index == -1) {
                return state;
            }
            state.players = state.players.splice(index, 1);
        },

        setPlayers: (state, action: PayloadAction<Player[]>) => {
            state.players = action.payload;
        },

        beginUpdate: (state, action: PayloadAction<string>) => {
            state.updating = action.payload;
        },

        endUpdate: (state, action: PayloadAction<string>) => {
            if (state.updating == action.payload) {
                state.updating = undefined;
            }
        },

        setGame: (state, action: PayloadAction<Game>) => {
            state.game = action.payload;
        },

        setFullGame: (state, action: PayloadAction<FullGameInfo>) => {
            const info = action.payload;
            state.game = info.game;
            state.rules = info.rules;
            state.players = info.players;
            state.ruleAccessList = info.ruleAccessMap;
            state.tokens = info.tokens;
            state.tokenAllocationMap = info.tokenAllocationMap;
        },

        initialize: (state, action: PayloadAction<FullGameInfo>) => {
            const info = action.payload;
            return {
                ...state,
                game: info.game,
                rules: info.rules,
                players: info.players,
                ruleAccessList: info.ruleAccessMap,
                tokens: info.tokens,
                tokenAllocationMap: info.tokenAllocationMap,
                ruleTitleInput: '',
                ruleTextInput: '',
                selectedRuleId: undefined,
                tokenTitleInput: '',
                tokenTextInput: '',
                selectedTokenId: undefined,
            };
        }
    },
    extraReducers: (builder) => {
        builder.addDefaultCase((state, action) => {
            state.notification = notificationState.slice.reducer(state.notification, action);
            state.errorNotification = errorNotificationState.slice.reducer(state.errorNotification, action);
        });
    }
});

export const actions = {
    default: slice.actions,
    errorNotification: errorNotificationState.slice.actions,
    notification: notificationState.slice.actions,
};

function* createRuleSaga(action: ReturnType<typeof actions.default.createRule>) {
    const payload = action.payload;
    try {
        const createdRule: Rule = yield call(GameMasterRestApi.createRule, payload.title, payload.text);
        yield put(actions.default.addRule(createdRule));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage("ルールの作成に失敗しました。リロードしてもう一度試してみてください。"));
    }
}

function* updateRuleSaga(action: ReturnType<typeof actions.default.updateRule>) {
    const payload = action.payload;
    try {
        const updatedRule: Rule = yield call(GameMasterRestApi.updateRule, payload.ruleId, payload.title, payload.text, payload.defaultAssignments);
        yield put(actions.default.replaceRule(updatedRule));
        yield put(actions.notification.showNotificationMessage("ルールを保存しました。"));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage("ルールの保存に失敗しました。もう一度試してみてください。"));
    }
}

function* deleteRuleSaga(action: ReturnType<typeof actions.default.deleteRule>) {
    try {
        yield call(GameMasterRestApi.deleteRule, action.payload);
        yield put(actions.default.removeRule(action.payload));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('ルールの削除に失敗しました。もう一度試してみてください。'));
    }
}

function* createTokenSaga(action: ReturnType<typeof actions.default.createToken>) {
    const payload = action.payload;
    try {
        const createdToken: Token = yield call(GameMasterRestApi.createToken, payload.title, payload.text);
        yield put(actions.default.addToken(createdToken));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage("トークンの作成に失敗しました。もう一度試してみてください。"));
    }
}

function* updateTokenSaga(action: ReturnType<typeof actions.default.updateToken>) {
    const payload = action.payload;
    try {
        const response: UpdateTokenResponse = yield call(GameMasterRestApi.updateToken, payload.tokenId, payload.title, payload.text, payload.allocation);
        yield put(actions.default.replaceToken(response.token));
        yield put(actions.default.replaceAllocation({tokenId: response.token.id, allocation: response.playerTokens}));
        yield put(actions.notification.showNotificationMessage("トークンを保存しました。"));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage("トークンの保存に失敗しました。もう一度試してみてください。"));
    }
}

function* deleteTokenSaga(action: ReturnType<typeof actions.default.deleteToken>) {
    try {
        yield call(GameMasterRestApi.deleteToken, action.payload);
        yield put(actions.default.removeToken(action.payload));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('トークンの削除に失敗しました。もう一度試してみてください。'));
    }
}

function* updateTitleSaga(action: ReturnType<typeof actions.default.updateTitle>) {
    try {
        const game: Game = yield call(GameMasterRestApi.updateTitle, action.payload);
        yield put(actions.default.setGame(game));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('ゲームタイトルの更新に失敗しました。もう一度試してみてください。'));
    }
}

function* setGameStateSaga(action: ReturnType<typeof actions.default.setGameState>) {
    try {
        const game: Game = yield call(GameMasterRestApi.setGameState, action.payload);
        yield put(actions.default.setGame(game));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('感想戦モードの設定に失敗しました。もう一度試してみてください。'));
    }
}

function* addTokenToPlayerSaga(action: ReturnType<typeof actions.default.addTokenToPlayer>) {
    try {
        const { playerId, tokenId, amount } = action.payload;
        const newAmount: number = yield call(GameMasterRestApi.addTokenToPlayer, playerId, tokenId, amount);
        yield put(actions.default.setPlayerTokenAllocation({ playerId, tokenId, amount: newAmount }));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('トークンの付与/削除に失敗しました'));
    }
}

function* moveRuleSaga(action: ReturnType<typeof actions.default.moveRule>) {
    try {
        const { ruleId, to } = action.payload;
        // moveRule API expects `to` as in ruleNumber
        const newRules: Rule[] = yield call(GameMasterRestApi.moveRule, ruleId, to + 1);
        yield put(actions.default.setRules(newRules));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('ルールの並び替えに失敗しました'));
    }
}

function* createStubPlayersSaga(action: ReturnType<typeof actions.default.createStubPlayers>) {
    try {
        const amount = action.payload;
        const players: Player[] = yield call(GameMasterRestApi.createStubPlayers, amount);
        yield put(actions.default.setPlayers(players));
        yield put(actions.notification.showNotificationMessage('仮プレイヤーを作成しました'));
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('仮プレイヤーの作成に失敗しました'));
    }
}

function* kickPlayerSaga(action: ReturnType<typeof actions.default.kickPlayer>) {
    try {
        const player = action.payload;
        yield call(GameMasterRestApi.kickPlayer, player.id);
    } catch (e) {
        console.error("API error", e);
        yield put(actions.errorNotification.showNotificationMessage('プレイヤーのKickに失敗しました'));
    }
}

function* createWatcherSaga() {
    yield all([
        takeEvery(actions.default.createRule, createRuleSaga),
        takeEvery(actions.default.updateRule, updateRuleSaga),
        takeEvery(actions.default.deleteRule, deleteRuleSaga),
        takeEvery(actions.default.createToken, createTokenSaga),
        takeEvery(actions.default.updateToken, updateTokenSaga),
        takeEvery(actions.default.deleteToken, deleteTokenSaga),
        takeEvery(actions.default.updateTitle, updateTitleSaga),
        takeEvery(actions.default.setGameState, setGameStateSaga),
        takeEvery(actions.default.addTokenToPlayer, addTokenToPlayerSaga),
        takeEvery(actions.default.moveRule, moveRuleSaga),
        takeEvery(actions.default.createStubPlayers, createStubPlayersSaga),
        takeEvery(actions.default.kickPlayer, kickPlayerSaga),
    ]);
}

function* pollSaga() {
    while (true) {
        const initiator = `poll-${Date.now()}`;
        yield put(actions.default.beginUpdate(initiator));
        try {
            const { fullInfo, cancel }: { fullInfo?: FullGameInfo, cancel?: boolean } = yield race({
                fullInfo: call(GameMasterRestApi.listFullInfo),
                cancel: delay(5000),
            });
            if (fullInfo) {
                yield put(actions.default.setFullGame(fullInfo));
            } else if (cancel) {
                yield put(actions.errorNotification.showNotificationMessage("サーバーが応答していません"));
            }
        } catch (e) {
            console.error("Polling failed", e);
            if (e instanceof NotFoundError) {
                yield put(actions.errorNotification.showNotificationMessage("IDが間違ってるっぽいです"));
            } else {
                yield put(actions.errorNotification.showNotificationMessage("サーバーに接続できませんでした"));
            }
        } finally {
            yield put(actions.default.endUpdate(initiator));
        }
        yield delay(5000);
    }
}

function* initSaga() {
    const key = location.hash.substring(1);
    yield call(GameMasterRestApi.configure, key);
    try {
        const fullInfo: FullGameInfo = yield call(GameMasterRestApi.listFullInfo);
        yield put(actions.default.initialize(fullInfo));
        knownGames.pushKnownGameMaster({ masterKey: key, title: fullInfo.game.title });
    } catch (e) {
        console.log("API error", e);
        if (e instanceof NotFoundError) {
            yield put(actions.errorNotification.showNotificationMessage("IDが間違っています"));
        } else {
            yield put(actions.errorNotification.showNotificationMessage("サーバーに接続できませんでした"));
        }
    }
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(retryForever, createWatcherSaga);
sagaMiddleware.run(retryForever, errorNotificationState.watcherSaga);
sagaMiddleware.run(retryForever, notificationState.watcherSaga);
sagaMiddleware.run(initSaga as any);
sagaMiddleware.run(pollSaga as any);

export type GMDispatch = typeof store.dispatch;
export const useGMDispatch = () => useDispatch<GMDispatch>();
export const useGMSelector: TypedUseSelectorHook<GameMasterState> = useSelector;
