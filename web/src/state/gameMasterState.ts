import {AccessType, Player, PlayerId, Rule, RuleId} from "../model";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import {put, takeEvery} from 'redux-saga/effects';

export interface GameMasterState {
    // Model state
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
    type: 'CreateRule';
    title: string;
    text: string;
    accessList: PlayerId[];
}

export interface AddRule {
    type: 'AddRule';
    rule: Rule;
}

export interface UpdateRule {
    type: 'UpdateRule';
    ruleId: RuleId;
    title?: string;
    text?: string;
    accessList?: PlayerId[];
}

export interface ChangeRuleAccess {
    type: 'ChangeRuleAccessListInput';
    playerId: PlayerId;
    ruleId: RuleId;
    assigned: boolean;
}

export interface SetRuleTitleInput {
    type: 'SetRuleTitleInput';
    value: string;
}

export interface SetRuleTextInput {
    type: 'SetRuleTextInput';
    value: string;
}

export interface ChangeSelectedRule {
    type: 'ChangeSelectedRule';
    ruleId: RuleId;
}

export type GameMasterAction = CreateRule | AddRule | UpdateRule | ChangeRuleAccess | SetRuleTitleInput | SetRuleTextInput | ChangeSelectedRule;

const initialState: GameMasterState = {
    players: [],
    rules: [],
    ruleAccessList: [],
    ruleTitleInput: '',
    ruleTextInput: '',
    ruleAccessListInput: [],
};

function gameMasterReducer(state: GameMasterState = initialState, action: GameMasterAction): GameMasterState {
    switch (action.type) {
        case 'AddRule':
            return {
                ...state,
                rules: [...state.rules, action.rule]
            };
    }
    return state;
}

const inMemoryInitialState: GameMasterState = {
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

export function inMemoryGameMasterReducer(state: GameMasterState = inMemoryInitialState, action: GameMasterAction): GameMasterState {
    switch (action.type) {
        case 'CreateRule': {
            const {title, text, accessList} = action;
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
        }
        case 'UpdateRule': {
            const {ruleId, title, text, accessList} = action;
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
        }
        case 'ChangeRuleAccessListInput': {
            const {ruleId, playerId, assigned} = action;
            const accessList = state.ruleAccessListInput.filter((pid) => pid != playerId);
            if (assigned) {
                accessList.push(playerId);
            }
            return {...state, ruleAccessListInput: accessList };
        }
        case 'SetRuleTitleInput': {
            const {value} = action;
            return {...state, ruleTitleInput: value};
        }
        case 'SetRuleTextInput': {
            const {value} = action;
            return {...state, ruleTextInput: value};
        }
        case "ChangeSelectedRule": {
            const {ruleId} = action;
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
    return gameMasterReducer(state, action);
}

function* createRuleSaga() {
    const rule: Rule = {
        id: 2,
        ruleNumber: 1,
        title: "hoge",
        text: "fuga",
        accessType: AccessType.ASSIGNED,
    }
    yield put<GameMasterAction>({type: "AddRule", rule: rule});
}

function* createRuleWatcherSaga() {
    yield takeEvery('CreateRule', createRuleSaga);
}

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: inMemoryGameMasterReducer,
    middleware: [sagaMiddleware]
});
sagaMiddleware.run(createRuleWatcherSaga);

export type GMDispatch = typeof store.dispatch;
export const useGMDispatch = () => useDispatch<GMDispatch>();
export const useGMSelector: TypedUseSelectorHook<GameMasterState> = useSelector;
