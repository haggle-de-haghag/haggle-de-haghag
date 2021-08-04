import {Injectable} from "@angular/core";
import {DBService} from "../db.service";

@Injectable()
export class PlayerService {
    constructor(private dbService: DBService) {
    }

    get player() { return this.dbService.player; }
}