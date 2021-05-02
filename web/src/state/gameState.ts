import React, {Dispatch} from "react";
import {ForeignPlayer, Game, Player, Rule} from "../model";

export interface GameState {
    game: Game;
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
    game: {
        id: 0,
        title: "",
    },
    player: {
        id: 0,
        displayName: "",
        playerKey: "",
    },
    players: [],
    rules: [],
};

export const GameStateContext: React.Context<[GameState, Dispatch<GameAction>]> = React.createContext([fallback, (_: GameAction) => {}]);