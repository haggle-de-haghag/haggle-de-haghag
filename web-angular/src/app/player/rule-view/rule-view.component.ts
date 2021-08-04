import { Component, OnInit } from '@angular/core';
import {RuleListService} from "../rule-list/rule-list.service";

@Component({
  selector: 'app-rule-view',
  templateUrl: './rule-view.component.html',
  styleUrls: ['./rule-view.component.scss']
})
export class RuleViewComponent implements OnInit {

  constructor(public ruleListService: RuleListService) { }

  ngOnInit(): void {
  }
}
