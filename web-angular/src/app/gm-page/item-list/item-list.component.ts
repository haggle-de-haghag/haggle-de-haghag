import { Component, OnInit } from '@angular/core';
import {DBService} from "../db.service";
import {UIService} from "../ui.service";
import {MatSelectionListChange} from "@angular/material/list";
import {Rule, Token} from "../../model";

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {

  constructor(private dbService: DBService, public uiService: UIService) { }

  ngOnInit(): void {
  }

  get rules() { return this.dbService.rules; }
  get tokens() { return this.dbService.tokens; }

  select(event: MatSelectionListChange) {
    if (event.options.length == 0) {
      return;
    }

    const option = (event.options[0].value as OptionValue);
    switch (option.type) {
      case 'rule':
        this.uiService.selectRule(option.rule);
        break;
      case 'token':
        this.uiService.selectToken(option.token);
        break;
    }
  }
}

export type OptionValue =
      { type: 'rule', rule: Rule }
    | { type: 'token', token: Token };
