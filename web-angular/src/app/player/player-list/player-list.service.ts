import {ForeignPlayer, Rule} from "../../model";
import {Injectable} from "@angular/core";
import {DBService} from "../../db.service";

@Injectable()
export class PlayerListService {

    constructor(private dbService: DBService) {
    }

    shareRule(player: ForeignPlayer, rule: Rule) {
        player;
        rule;
    }

    get players() { return this.dbService.players; }
}