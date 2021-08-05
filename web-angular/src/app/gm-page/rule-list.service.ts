import { Injectable } from '@angular/core';
import {DBService} from "./db.service";
import {AccessType, Player, Rule, RuleId} from "../model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RuleListService {

  constructor(private dbService: DBService) { }

  getRule(ruleId: RuleId) {
    return new Observable<RuleWithPlayerAccess>((subscriber => {
      const rule = this.dbService.rules.find((r) => r.id == ruleId);
      if (rule == undefined) {
        throw new Error(`Rule ${ruleId} not found`);
      }

      const playerRuleAccess: PlayerRuleAccess = {};
      this.dbService.ruleAccessList[ruleId]
          .forEach((a) => playerRuleAccess[a.playerId] = a.accessType);
      subscriber.next(new RuleWithPlayerAccess(rule, playerRuleAccess));
    }));
  }

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

export type PlayerRuleAccess = { [key: number]: AccessType | undefined }; // PlayerId -> AccessType

export class RuleWithPlayerAccess {
  constructor(public rule: Rule, public playerRuleAccess: PlayerRuleAccess) {}
}