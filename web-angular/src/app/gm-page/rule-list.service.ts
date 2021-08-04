import { Injectable } from '@angular/core';
import {DBService} from "./db.service";
import {AccessType, Player, Rule} from "../model";

@Injectable({
  providedIn: 'root'
})
export class RuleListService {

  constructor(private dbService: DBService) { }

  setAssignment(rule: Rule, player: Player, accessType: AccessType) {
    const accessList = this.dbService.ruleAccessList[rule.id];
    if (accessList == undefined) {
      this.dbService.ruleAccessList[rule.id] = [{ playerId: player.id, accessType: accessType }];
      return;
    }

    const access = accessList.find((a) => a.playerId == player.id);
    if (access == undefined) {
      accessList.push({ playerId: player.id, accessType: accessType });
    } else {
      access.accessType = accessType;
    }
  }

  removeAssignment(rule: Rule, player: Player) {
    this.dbService.ruleAccessList[rule.id] = this.dbService.ruleAccessList[rule.id]?.filter((a) => a.playerId != player.id);
  }
}
