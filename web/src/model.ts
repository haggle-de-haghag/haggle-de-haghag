import {PlayerIdWithAccess, PlayerIdWithAmount} from "./rest/gameMaster";

export type GameId = number;
export type PlayerId = number;
export type RuleId = number;
export type TokenId = number;

export interface Game {
    id: GameId;
    title: string;
    gameKey: string;
    masterKey: string;
    state: GameState;
}

export interface Player {
    id: PlayerId;
    playerKey: string;
    displayName: string;
}

export interface ForeignPlayer {
    id: PlayerId;
    displayName: string;
}

export interface Rule {
    id: RuleId;
    ruleNumber: number;
    title: string;
    text: string;
    accessType: AccessType
}

export interface Token {
    id: TokenId;
    title: string;
    text: string;
    amount: number;
}

export interface KnownGame {
    gameKey: string;
    title: string;
}

export interface KnownGameMaster {
    masterKey: string;
    title: string;
}

export type GameState = 'PLAYING' | 'POST_MORTEM';
export type AccessType = 'ASSIGNED' | 'SHARED' | 'POST_MORTEM';

export type RuleAccessMap = { [ruleId: number]: PlayerIdWithAccess[] };
export type TokenAllocationMap = { [tokenId: number]: PlayerIdWithAmount[] };