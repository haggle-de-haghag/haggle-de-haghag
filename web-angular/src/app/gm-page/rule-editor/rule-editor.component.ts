import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DBService} from "../db.service";
import {RuleId} from "../../model";
import {RuleListService, RuleWithPlayerAccess} from "../rule-list.service";

@Component({
  selector: 'app-rule-editor',
  templateUrl: './rule-editor.component.html',
  styleUrls: ['./rule-editor.component.scss']
})
export class RuleEditorComponent implements OnChanges {
  @Input() ruleId!: RuleId;

  data: RuleWithPlayerAccess | undefined;

  constructor(private dbService: DBService, private ruleListService: RuleListService) { }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['ruleId'];
    if (change != undefined) {
      this.ruleListService.getRule(change.currentValue)
          .subscribe((val) => this.data = val);
    }
  }

  get players() { return this.dbService.players; }
}
