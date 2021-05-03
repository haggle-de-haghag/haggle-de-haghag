import {Game, Player} from "../model";
import {post} from "./common";

interface Config {
}

let config: Config = {
};

export function configure() {
}

export async function joinGame(gameKey: string, playerName: string): Promise<Player> {
    return post(`/games/${gameKey}/join`, { playerName });
}

export async function createGame(title: string): Promise<Game> {
    return post(`/games`, { title });
}