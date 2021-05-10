export type GameId = number;
export type PlayerId = number;
export type RuleId = number;
export type TokenId = number;

export interface Game {
    id: GameId;
    title: string;
    gameKey: string;
    masterKey: string;
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

export type AccessType = 'ASSIGNED' | 'SHARED';