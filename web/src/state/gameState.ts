import React, {Dispatch} from "react";
import {ForeignPlayer, Player, Rule} from "../model";

export interface GameState {
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];
}

export interface ShareRule {
    type: 'ShareRule';
    rule: Rule;
    player: ForeignPlayer;
}

export type GameAction = ShareRule;

const fallback: GameState = {
    player: {
        id: 0,
        displayName: "",
        playerKey: "",
    },
    players: [],
    rules: [],
};

export const GameStateContext: React.Context<[GameState, Dispatch<GameAction>]> = React.createContext([fallback, (_: GameAction) => {}]);