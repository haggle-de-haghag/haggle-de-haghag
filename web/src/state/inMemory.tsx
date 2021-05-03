import React, {Dispatch, useReducer} from 'react';
import {GameAction, GameState, GameStateContext} from "./gameState";
import {AccessType} from "../model";

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
            gameKey: '',
            masterKey: '',
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

