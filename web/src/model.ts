export type GameId = number;
export type PlayerId = number;
export type RuleId = number;

export interface Game {
    id: GameId;
    title: string;
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

export enum AccessType {
    ASSIGNED,
    SHARED,
}