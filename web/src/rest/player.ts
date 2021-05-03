import {get, post} from "./common";
import {ForeignPlayer, Game, Player, PlayerId, Rule, RuleId} from "../model";

interface Config {
    urlBase: string;
    playerKey: string;
}

let config: Config = {
    urlBase: '',
    playerKey: '',
};

export function reconfigure(playerKey: string, urlBase: string) {
    config = {
        urlBase,
        playerKey,
    };
}

export interface FullPlayerInfo {
    gameTitle: string;
    player: Player;
    players: ForeignPlayer[];
    rules: Rule[];
}

export async function listFullInfo(): Promise<FullPlayerInfo> {
    return get(`${config.urlBase}/players/${config.playerKey}`);
}

export async function shareRule(ruleId: RuleId, playerId: PlayerId): Promise<boolean> {
    const result = await post<{success: boolean}>(`${config.urlBase}/players/${config.playerKey}/rules/${ruleId}/share`, { playerId });
    return result.success;
}