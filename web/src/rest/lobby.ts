import {Game, Player} from "../model";
import {post} from "./common";

interface Config {
    urlBase: string;
}

let config: Config = {
    urlBase: '',
};

export function configure(urlBase: string) {
    config = {
        urlBase,
    };
}

export async function joinGame(gameKey: string, playerName: string): Promise<Player> {
    return post(`${config.urlBase}/games/${gameKey}/join`, { playerName });
}

export async function createGame(title: string): Promise<Game> {
    return post(`${config.urlBase}/games`, { title });
}