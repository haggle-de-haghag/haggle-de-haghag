import {Rule} from "../model";

export class GameMasterRestApi {
    private gameKey: string;
    private urlBase: string;

    constructor(gameKey: string) {
        this.gameKey = gameKey;
        this.urlBase = "http://localhost:8080/api/game_master";
    }

    public async createRule(title: string, text: string): Promise<Rule> {
        const response = await fetch(`${this.urlBase}/${this.gameKey}/rules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title, text})
        });
        if (response.status != 200) {
            throw new Error("failed to create a rule");
        }
        const body = await response.json();
        return body as Rule;
    }
}
