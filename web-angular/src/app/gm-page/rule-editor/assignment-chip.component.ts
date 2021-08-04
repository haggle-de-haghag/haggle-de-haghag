import {Component, Input, OnInit} from '@angular/core';
import {AccessType, Player, Rule} from "../../model";
import {ThemePalette} from "@angular/material/core";
import {DBService} from "../db.service";
import {RuleListService} from "../rule-list.service";

@Component({
  selector: 'app-assignment-chip',
  templateUrl: './assignment-chip.component.html',
  styleUrls: ['./assignment-chip.component.scss']
})
export class AssignmentChipComponent implements OnInit {
  @Input()
  player!: Player;

  @Input()
  rule!: Rule;

  constructor(private dbService: DBService, private ruleListService: RuleListService) { }

  ngOnInit(): void {
  }

  get accessType(): AccessType | undefined {
    const accessList = this.dbService.ruleAccessList[this.rule.id];
    return accessList?.find((a) => a.playerId == this.player.id)?.accessType;
  }

  get color(): ThemePalette | undefined {
    if (this.accessType == 'ASSIGNED') {
      return 'primary';
    } else if (this.accessType == 'SHARED') {
      return 'accent';
    } else {
      return undefined;
    }
  }

  emit() {
    if (this.accessType == 'ASSIGNED') {
      this.ruleListService.removeAssignment(this.rule, this.player);
    } else {
      this.ruleListService.setAssignment(this.rule, this.player, 'ASSIGNED');
    }
  }
}
