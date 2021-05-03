import {Game, Player, PlayerId, Rule, RuleId} from "../model";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import {all, call, put, takeEvery} from 'redux-saga/effects';
import * as GameMasterRestApi from '../rest/gameMaster';
import {FullGameInfo} from "../rest/gameMaster";

export interface GameMasterState {
    // Model state
    game: Game;
    players: Player[];
    rules: Rule[];
    ruleAccessList: { [key: number]: PlayerId[] }; // key: RuleId

    // UI state
    ruleTitleInput: string;
    ruleTextInput: string;
    selectedRuleId?: RuleId;
    ruleAccessListInput: PlayerId[];
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
    accessList?: PlayerId[];
}

export interface ChangeRuleAccess {
    playerId: PlayerId;
    ruleId: RuleId;
    assigned: boolean;
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
    ruleTitleInput: '',
    ruleTextInput: '',
    ruleAccessListInput: [],
};

const inMemoryInitialState: GameMasterState = {
    ...initialState,
    players: [
        {
            id: 1,
            displayName: "azusa",
            playerKey: "abcd1234"
        },
        {
            id: 2,
            displayName: "yui",
            playerKey: "efgh5678"
        }
    ],
    rules: [],
    ruleAccessList: [],
    ruleTitleInput: '',
    ruleTextInput: '',
    ruleAccessListInput: [],
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
            const index = state.rules.findIndex((r) => r.id = rule.id);
            if (index == -1) {
                throw Error(`Rule ${rule.id} does not exist`);
            }
            state.rules[index] = rule;
        },

        updateRule: (state, action: PayloadAction<UpdateRule>) => {
            const {ruleId, title, text, accessList} = action.payload;
            const rules = state.rules.map((r) => {
                if (r.id != ruleId) return r;
                return {
                    ...r,
                    title: title ?? r.title,
                    text: text ?? r.text,
                };
            });
            return {
                ...state,
                rules,
                ruleAccessList: {
                    ...state.ruleAccessList,
                    [ruleId]: accessList ?? state.ruleAccessList[ruleId],
                }
            };
        },

        changeRuleAccessListInput: (state, action: PayloadAction<ChangeRuleAccess>) => {
            const {ruleId, playerId, assigned} = action.payload;
            const accessList = state.ruleAccessListInput.filter((pid) => pid != playerId);
            if (assigned) {
                accessList.push(playerId);
            }
            state.ruleAccessListInput = accessList;
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

            return {
                ...state,
                selectedRuleId: ruleId,
                ruleTitleInput: rule.title,
                ruleTextInput: rule.text,
                ruleAccessListInput: state.ruleAccessList[ruleId] ?? [],
            };
        },

        initialize: (state, action: PayloadAction<FullGameInfo>) => {
            const info = action.payload;
            return {
                ...state,
                game: info.game,
                rules: info.rules,
                ruleTitleInput: '',
                ruleTextInput: '',
                selectedRuleId: undefined
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
    const updatedRule: Rule = yield call(GameMasterRestApi.updateRule, payload.ruleId, payload.title, payload.text);
    yield put(actions.replaceRule(updatedRule));
}

function* createRuleWatcherSaga() {
    yield all([
        takeEvery(actions.createRule, createRuleSaga),
        takeEvery(actions.updateRule, updateRuleSaga),
    ]);
}

function* initSaga() {
    const key = location.hash.substring(1);
    yield call(GameMasterRestApi.configure, key, 'http://localhost:8080/api')
    const fullInfo: FullGameInfo = yield call(GameMasterRestApi.listFullInfo);
    yield put(actions.initialize(fullInfo));
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(createRuleWatcherSaga);
sagaMiddleware.run(initSaga as any);

export type GMDispatch = typeof store.dispatch;
export const useGMDispatch = () => useDispatch<GMDispatch>();
export const useGMSelector: TypedUseSelectorHook<GameMasterState> = useSelector;
