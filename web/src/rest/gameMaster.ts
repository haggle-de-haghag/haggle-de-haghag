import { firebaseConfig } from "../env/development";
import { Firebase } from "../firebase/firebase";
import {AccessType, ForeignPlayer, Game, GameState, Player, PlayerId, Rule, Token} from "../model";
import {AbortablePromise, del, get, patch, post, put} from "./common";

interface Config {
    gameMasterKey: string;
    firebase: Firebase;
}

let config: Config;

export function configure(gameMasterKey: string) {
    config = {
        gameMasterKey,
        firebase: new Firebase(firebaseConfig)
    }
}

export interface PlayerIdWithAccess {
    playerId: PlayerId;
    accessType: AccessType;
}

export interface PlayerIdWithAmount {
    playerId: PlayerId;
    amount: number;
}

export interface FullGameInfo {
    game: Game;
    rules: Rule[];
    players: Player[];
    ruleAccessMap: { [key: number]: PlayerIdWithAccess[] };
    tokens: Token[];
    tokenAllocationMap: { [key: number]: PlayerIdWithAmount[] }; // key: tokenId
}

export interface UpdateTokenResponse {
    token: Token;
    playerTokens: PlayerIdWithAmount[];
}

export async function listFullInfo(): Promise<FullGameInfo> {
    return callApi('fullGameInfo', {});
}

export function updateTitle(title: string): Promise<Game> {
    return callApi('updateTitle', { title });
}

export function setGameState(gameState: GameState): Promise<Game> {
    return callApi('setGameState', { state: gameState });
}

export async function createRule(title: string, text: string): Promise<Rule> {
    return callApi('createRule', { title, text });
}

export async function updateRule(ruleId: number, title?: string, text?: string, assignedPlayerIds?: PlayerId[]): Promise<Rule> {
    return callApi('updateRule', { rule: { id: ruleId, title, text }, assignedPlayerIds});
}

export async function deleteRule(ruleId: number): Promise<void> {
    return callApi('deleteRule', { rule: { id: ruleId }});
}

export async function moveRule(ruleId: number, to: number): Promise<Rule[]> {
    return callApi('moveRule', { ruleId, to });
}

export async function listTokens(): Promise<Token[]> {
    return get(fullApi('/tokens'));
}

export async function createToken(title: string, text: string): Promise<Token> {
    return post(fullApi('/tokens'), {title, text});
}

export async function updateToken(tokenId: number, title?: string, text?: string, allocation?: {[playerId: number]: number}): Promise<UpdateTokenResponse> {
    return await patch(fullApi(`/tokens/${tokenId}`), {title, text, allocation});
}

export async function deleteToken(tokenId: number): Promise<void> {
    return await del(fullApi(`/tokens/${tokenId}`));
}

export async function addTokenToPlayer(playerId: number, tokenId: number, amount: number): Promise<number> {
    const response = await post<{newAmount: number}>(fullApi(`/players/${playerId}/tokens/${tokenId}/add`), { amount });
    return response.newAmount;
}

export function createStubPlayers(amount: number): AbortablePromise<Player[]> {
    return post(fullApi(`/players/stub`), { amount });
}

export function kickPlayer(playerId: number): AbortablePromise<Player> {
    return del(fullApi(`/players/${playerId}`));
}

function fullApi(api: string): string {
    return `/game_master/${config.gameMasterKey}${api}`;
}

async function callApi<T, R>(api: string, payload: T): Promise<R> {
    const func = config.firebase.getCallable<T, R>(api);
    const fullPayload = {
        ...payload,
        masterKey: config.gameMasterKey,
    };
    const res = await func(fullPayload);
    return res.data;
}