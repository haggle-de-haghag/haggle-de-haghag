import {ForeignPlayer, Game, PlayerId, Rule} from "../model";
import {get, patch, post} from "./common";

interface Config {
    gameMasterKey: string;
    urlBase: string;
}

let config: Config;

export function configure(gameMasterKey: string, urlBase: string) {
    config = {
        gameMasterKey,
        urlBase
    };
}

export interface FullGameInfo {
    game: Game,
    rules: Rule[],
    players: ForeignPlayer[],
}

export async function listFullInfo(): Promise<FullGameInfo> {
    return get(fullUrl(''));
}

export async function listRules(): Promise<Rule[]> {
    return get(fullUrl('/rules'));
}

export async function createRule(title: string, text: string): Promise<Rule> {
    return post(fullUrl('/rules'), {title, text});
}

export async function updateRule(ruleId: number, title?: string, text?: string, assignedPlayerIds?: PlayerId[]): Promise<Rule> {
    return patch(fullUrl(`/rules/${ruleId}`), {title, text, assignedPlayerIds})
}

function fullUrl(api: string): string {
    return `${config.urlBase}/game_master/${config.gameMasterKey}${api}`;
}