import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DBService} from "../db.service";
import {Player, Rule, RuleId} from "../../model";
import {ThemePalette} from "@angular/material/core";

@Component({
  selector: 'app-rule-editor',
  templateUrl: './rule-editor.component.html',
  styleUrls: ['./rule-editor.component.scss']
})
export class RuleEditorComponent implements OnChanges {
  @Input() ruleId!: RuleId;

  rule!: Rule | undefined;

  constructor(private dbService: DBService) { }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['ruleId'];
    if (change != undefined) {
      this.rule = this.dbService.rules.find((r) => r.id == change.currentValue);
    }
  }

  get accessList() { return this.dbService.ruleAccessList[this.ruleId]; }
  get players() { return this.dbService.players; }

  chipColor(player: Player): ThemePalette | undefined {
    const accessMap = this.accessList;
    const access = accessMap?.find((am) => am.playerId == player.id);
    if (access == undefined) {
      return undefined;
    }

    if (access.accessType == 'ASSIGNED') {
      return 'primary';
    } else if (access.accessType == 'SHARED') {
      return 'accent';
    }

    return undefined;
  }
}
