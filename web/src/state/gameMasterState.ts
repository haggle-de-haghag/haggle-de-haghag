import {ForeignPlayer, Game, PlayerId, Rule, RuleId, Token, TokenId} from "../model";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import {all, call, put, takeEvery} from 'redux-saga/effects';
import * as GameMasterRestApi from '../rest/gameMaster';
import {FullGameInfo, PlayerIdWithAccess, PlayerIdWithAmount, UpdateTokenResponse} from '../rest/gameMaster';
import {retryForever} from "./sagaUtil";

export interface GameMasterState {
    // Model state
    game: Game;
    players: ForeignPlayer[];
    rules: Rule[];
    ruleAccessList: { [ruleId: number]: PlayerIdWithAccess[] };
    tokens: Token[];
    tokenAllocationMap: { [tokenId: number]: PlayerIdWithAmount[] };

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

const initialState: GameMasterState = {
    game: {
        id: 0,
        title: '',
        gameKey: '',
        masterKey: '',
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
};

const inMemoryInitialState: GameMasterState = {
    ...initialState,
    players: [
        {
            id: 1,
            displayName: "azusa",
        },
        {
            id: 2,
            displayName: "yui",
        }
    ],
    rules: [],
    ruleAccessList: [],
    ruleTitleInput: '',
    ruleTextInput: '',
    defaultAssignmentsInput: [],
};

const slice = createSlice({
    name: 'state',
    initialState: initialState,
    reducers: {
        createRule: (state, action: PayloadAction<CreateRule>) => {
            /*
            const {title, text, accessList} = action.payload;
            const ruleNumber = state.rules.length + 1;
            const rule: Rule = {
                id: ruleNumber,
                title,
                text,
                ruleNumber,
                accessType: AccessType.ASSIGNED
            };
            const ruleAccessList = {
                ...state.ruleAccessList,
                [rule.id]: accessList,
            };
            return {
                ...state,
                rules: [...state.rules, rule],
                ruleAccessList: ruleAccessList,
            };
             */
        },

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

        updateRule: (state, action: PayloadAction<UpdateRule>) => state,

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
    }
});

export const actions = slice.actions;

function* createRuleSaga(action: ReturnType<typeof actions.createRule>) {
    const payload = action.payload;
    const createdRule: Rule = yield call(GameMasterRestApi.createRule, payload.title, payload.text);
    yield put(actions.addRule(createdRule));
}

function* updateRuleSaga(action: ReturnType<typeof actions.updateRule>) {
    const payload = action.payload;
    const updatedRule: Rule = yield call(GameMasterRestApi.updateRule, payload.ruleId, payload.title, payload.text, payload.defaultAssignments);
    yield put(actions.replaceRule(updatedRule));
}

function* createTokenSaga(action: ReturnType<typeof actions.createToken>) {
    const payload = action.payload;
    const createdToken: Token = yield call(GameMasterRestApi.createToken, payload.title, payload.text);
    yield put(actions.addToken(createdToken));
}

function* updateTokenSaga(action: ReturnType<typeof actions.updateToken>) {
    const payload = action.payload;
    const response: UpdateTokenResponse = yield call(GameMasterRestApi.updateToken, payload.tokenId, payload.title, payload.text, payload.allocation);
    yield put(actions.replaceToken(response.token));
    yield put(actions.replaceAllocation({ tokenId: response.token.id, allocation: response.playerTokens } ));
}

function* createWatcherSaga() {
    yield all([
        takeEvery(actions.createRule, createRuleSaga),
        takeEvery(actions.updateRule, updateRuleSaga),
        takeEvery(actions.createToken, createTokenSaga),
        takeEvery(actions.updateToken, updateTokenSaga),
    ]);
}

function* initSaga() {
    const key = location.hash.substring(1);
    yield call(GameMasterRestApi.configure, key)
    const fullInfo: FullGameInfo = yield call(GameMasterRestApi.listFullInfo);
    yield put(actions.initialize(fullInfo));
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(retryForever, createWatcherSaga);
sagaMiddleware.run(initSaga as any);

export type GMDispatch = typeof store.dispatch;
export const useGMDispatch = () => useDispatch<GMDispatch>();
export const useGMSelector: TypedUseSelectorHook<GameMasterState> = useSelector;
