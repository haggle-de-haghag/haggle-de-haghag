import { Firebase } from "../firebase/firebase";
import {Game, Player} from "../model";
import {post} from "./common";

interface Config {
}

let config: Config = {
};

let firebase: Firebase;

export function configure() {
    firebase = new Firebase();
}

export async function joinGame(gameKey: string, playerName: string): Promise<Player> {
    return post(`/games/${gameKey}/join`, { playerName });
}

export async function createGame(title: string): Promise<Game> {
    const func = firebase.getCallable<any, Game>('createGame')
    const res = await func({ title });
    return res.data;
}