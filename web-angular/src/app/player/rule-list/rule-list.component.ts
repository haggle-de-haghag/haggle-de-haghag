import { Component, OnInit } from '@angular/core';
import {RuleListService} from "./rule-list.service";
import {DBService} from "../../db.service";

@Component({
  selector: 'app-rule-list',
  templateUrl: './rule-list.component.html',
  styleUrls: ['./rule-list.component.scss']
})
export class RuleListComponent implements OnInit {

  constructor(public ruleListService: RuleListService, public dbService: DBService) { }

  ngOnInit(): void {
  }

  get rules() { return this.ruleListService.rules; }
}
