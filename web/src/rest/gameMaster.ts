import {AccessType, ForeignPlayer, Game, PlayerId, Rule} from "../model";
import {get, patch, post} from "./common";

interface Config {
    gameMasterKey: string;
}

let config: Config;

export function configure(gameMasterKey: string) {
    config = {
        gameMasterKey,
    };
}

export interface PlayerIdWithAccess {
    playerId: PlayerId;
    accessType: AccessType;
}

export interface FullGameInfo {
    game: Game,
    rules: Rule[],
    players: ForeignPlayer[],
    ruleAccessMap: { [key: number]: PlayerIdWithAccess[] }
}

export async function listFullInfo(): Promise<FullGameInfo> {
    return get(fullApi(''));
}

export async function listRules(): Promise<Rule[]> {
    return get(fullApi('/rules'));
}

export async function createRule(title: string, text: string): Promise<Rule> {
    return post(fullApi('/rules'), {title, text});
}

export async function updateRule(ruleId: number, title?: string, text?: string, assignedPlayerIds?: PlayerId[]): Promise<Rule> {
    return patch(fullApi(`/rules/${ruleId}`), {title, text, assignedPlayerIds})
}

function fullApi(api: string): string {
    return `/game_master/${config.gameMasterKey}${api}`;
}