export type GameId = string;
export type PlayerId = string;
export type RuleId = string;
export type TokenId = string;

export interface PlayerIdWithAccess {
    playerId: PlayerId;
    accessType: AccessType;
}

export interface PlayerIdWithAmount {
    playerId: PlayerId;
    amount: number;
}

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
    state: PlayerState;
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

export interface FullGameInfo {
    game: Game;
    rules: Rule[];
    players: Player[];
    ruleAccessMap: { [key: RuleId]: PlayerIdWithAccess[] };
    tokens: Token[];
    tokenAllocationMap: { [key: TokenId]: PlayerIdWithAmount[] }; // key: tokenId
}

export interface FullPlayerInfo {
    gameTitle: string;
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];
    tokens: Token[];
}

export type GameState = 'PLAYING' | 'POST_MORTEM';
export type AccessType = 'ASSIGNED' | 'SHARED' | 'POST_MORTEM';
export type PlayerState = 'ACTIVE' | 'STUB';

export type RuleAccessMap = { [ruleId: number]: PlayerIdWithAccess[] };
export type TokenAllocationMap = { [tokenId: number]: PlayerIdWithAmount[] };