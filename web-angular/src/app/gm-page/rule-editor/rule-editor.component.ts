import {Component, Input, OnInit} from '@angular/core';
import {DBService} from "../db.service";
import {Player, Rule} from "../../model";
import {ThemePalette} from "@angular/material/core";

@Component({
  selector: 'app-rule-editor',
  templateUrl: './rule-editor.component.html',
  styleUrls: ['./rule-editor.component.scss']
})
export class RuleEditorComponent implements OnInit {
  @Input()
  rule!: Rule;

  constructor(private dbService: DBService) { }

  ngOnInit(): void {
  }

  get accessList() { return this.dbService.ruleAccessList[this.rule.id]; }
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
