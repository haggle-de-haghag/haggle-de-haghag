import {AbortablePromise, get, patch, post} from "./common";
import {ForeignPlayer, Game, Player, PlayerId, Rule, RuleId, Token, TokenId} from "../model";
import { Firebase } from "../firebase/firebase";
import { firebaseConfig } from "../env/development";

interface Config {
    playerKey: string;
    firebase: Firebase;
}

let config: Config;

export function reconfigure(playerKey: string) {
    config = {
        playerKey,
        firebase: new Firebase(firebaseConfig),
    };
}

export interface FullPlayerInfo {
    gameTitle: string;
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];
    tokens: Token[];
}

export function updateName(name: string): AbortablePromise<Player> {
    return patch(`/players/${config.playerKey}/name`, { name });
}

export function listFullInfo(): Promise<FullPlayerInfo> {
    return callApi('fullPlayerInfo', {});
}

export async function shareRule(ruleId: RuleId, playerId: PlayerId): Promise<boolean> {
    const result = await post<{success: boolean}>(`/players/${config.playerKey}/rules/${ruleId}/share`, { playerId });
    return result.success;
}

export async function giveToken(tokenId: TokenId, playerId: PlayerId, amount: number): Promise<boolean> {
    const result = await post<{success: boolean}>(`/players/${config.playerKey}/tokens/${tokenId}/give`, { playerId, amount });
    return result.success;
}

async function callApi<T, R>(api: string, payload: T): Promise<R> {
    const func = config.firebase.getCallable<T, R>(api);
    const fullPayload = {
        ...payload,
        playerKey: config.playerKey,
    };
    const res = await func(fullPayload);
    return res.data;
}