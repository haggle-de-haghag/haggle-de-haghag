import {AbortablePromise, get, post} from "./common";
import {ForeignPlayer, Game, Player, PlayerId, Rule, RuleId, Token, TokenId} from "../model";

interface Config {
    playerKey: string;
}

let config: Config = {
    playerKey: '',
};

export function reconfigure(playerKey: string) {
    config = {
        playerKey,
    };
}

export interface FullPlayerInfo {
    gameTitle: string;
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];
    tokens: Token[];
}

export function listFullInfo(): AbortablePromise<FullPlayerInfo> {
    return get(`/players/${config.playerKey}`);
}

export async function shareRule(ruleId: RuleId, playerId: PlayerId): Promise<boolean> {
    const result = await post<{success: boolean}>(`/players/${config.playerKey}/rules/${ruleId}/share`, { playerId });
    return result.success;
}

export async function giveToken(tokenId: TokenId, playerId: PlayerId, amount: number): Promise<boolean> {
    const result = await post<{success: boolean}>(`/players/${config.playerKey}/tokens/${tokenId}/give`, { playerId, amount });
    return result.success;
}