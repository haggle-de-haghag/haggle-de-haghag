export interface Game {
    id: number;
    title: string;
}

export interface Player {
    id: number;
    playerKey: string;
    displayName: string;
}

export interface ForeignPlayer {
    id: number;
    displayName: string;
}

export interface Rule {
    id: number;
    ruleNumber: number;
    title: string;
    text: string;
    accessType: AccessType
}

export enum AccessType {
    ASSIGNED,
    SHARED,
}