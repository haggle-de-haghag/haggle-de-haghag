import {KnownGame, KnownGameMaster} from "../model";

export class KnownGames {
    readonly knownGames: KnownGame[] = [];
    readonly knownGameMasters: KnownGameMaster[] = [];

    constructor() {
        this.knownGames = KnownGames.loadItem('knownGames') ?? [];
        this.knownGameMasters = KnownGames.loadItem('knownGameMasters') ?? [];
    }

    pushKnownGame(knownGame: KnownGame) {
        const item = this.knownGames.find((kg) => kg.gameKey == knownGame.gameKey);
        if (item != null) {
            item.title = knownGame.title;
        } else {
            this.knownGames.push(knownGame);
            while (this.knownGames.length > 10) {
                this.knownGames.shift();
            }
        }
        localStorage.setItem('knownGames', JSON.stringify(this.knownGames));
    }

    pushKnownGameMaster(knownGameMaster: KnownGameMaster) {
        const item = this.knownGameMasters.find((kg) => kg.masterKey == knownGameMaster.masterKey);
        if (item != null) {
            item.title = knownGameMaster.title;
        } else {
            this.knownGameMasters.push(knownGameMaster);
            while (this.knownGameMasters.length > 10) {
                this.knownGameMasters.shift();
            }
        }
        localStorage.setItem('knownGameMasters', JSON.stringify(this.knownGameMasters));
    }

    private static loadItem<T>(key: string): T | null {
        const json = localStorage.getItem(key);
        if (json == null) {
            return null;
        }
        try {
            return JSON.parse(json) as T;
        } catch (e) {
            console.warn(`Invalid payload for ${key}: ${json}`, e);
            return null;
        }
    }
}

export const knownGames = new KnownGames();