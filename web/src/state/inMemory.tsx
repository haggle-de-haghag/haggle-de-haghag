import React, {Dispatch, useReducer} from 'react';
import {GameAction, GameState, GameStateContext} from "./gameState";
import {AccessType, Rule} from "../model";
import {GameMasterAction, GameMasterState, GameMasterStateContext} from "./gameMasterState";
import {Simulate} from "react-dom/test-utils";
import play = Simulate.play;

function reducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'ShareRule':
            const { rule, player } = action;
            console.log(`Share rule ${rule.ruleNumber} with ${player.id} (${player.displayName})`);
            break;
    }
    return state;
}

export function ProvideInMemoryGameState(props: any) {
    const initialState: GameState = {
        game: {
            id: 1,
            title: "Test game",
        },
        player: {
            id: 1,
            displayName: "azusa",
            playerKey: "abcd1234",
        },
        players: [
            {
                id: 2,
                displayName: "yui",
            },
            {
                id: 3,
                displayName: "mio"
            }
        ],
        rules: [{
            id: 1,
            ruleNumber: 1,
            title: "azusa",
            text: "azusa de azuazu",
            accessType: AccessType.ASSIGNED
        }],
    };

    //@ts-ignore
    const [state, dispatch] = useReducer(reducer, initialState) as [GameState, Dispatch<GameAction>];

    return <GameStateContext.Provider value={[state, dispatch]}>
        {props.children}
    </GameStateContext.Provider>
}

export function gameMasterReducer(state: GameMasterState, action: GameMasterAction): GameMasterState {
    console.log(action);
    console.log(state);
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
    return state;
}

export function ProvideInMemoryGameMasterState(props: any) {
    const initialState: GameMasterState = {
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

    //@ts-ignore
    const [state, dispatch] = useReducer(gameMasterReducer, initialState) as [GameMasterState, Dispatch<GameMasterAction>];

    return <GameMasterStateContext.Provider value={[state, dispatch]}>
        {props.children}
    </GameMasterStateContext.Provider>
}