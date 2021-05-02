import {AccessType, Player, PlayerId, Rule, RuleId} from "../model";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import {call, put, takeEvery} from 'redux-saga/effects';
import {GameMasterRestApi} from "../rest/gameMaster";

export interface GameMasterState {
    // Model state
    gameMasterKey: string;
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
    gameMasterKey: 'gm-4dd98f02',
    players: [],
    rules: [],
    ruleAccessList: [],
    ruleTitleInput: '',
    ruleTextInput: '',
    ruleAccessListInput: [],
};

const inMemoryInitialState: GameMasterState = {
    gameMasterKey: '',
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
        }
    }
});

export const actions = slice.actions;

function* createRuleSaga(action: ReturnType<typeof actions.createRule>) {
    const api = new GameMasterRestApi('gm-4dd98f02');
    const createdRule: Rule = yield call(api.createRule.bind(api), action.payload.title, action.payload.text);
    yield put(actions.addRule(createdRule));
}

function* createRuleWatcherSaga() {
    yield takeEvery(actions.createRule, createRuleSaga);
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: slice.reducer,
    middleware: [sagaMiddleware],
    devTools: process.env.NODE_ENV !== 'production',
});
sagaMiddleware.run(createRuleWatcherSaga);

export type GMDispatch = typeof store.dispatch;
export const useGMDispatch = () => useDispatch<GMDispatch>();
export const useGMSelector: TypedUseSelectorHook<GameMasterState> = useSelector;
