import {Component, OnInit} from '@angular/core';
import {DBService} from "../db.service";
import {UIService} from "../ui.service";
import {Rule, Token} from "../../model";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

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
  get selectedRule() { return this.uiService.selectedRule; }
  get selectedToken() { return this.uiService.selectedToken; }

  selectRule(rule: Rule) {
    this.uiService.selectRule(rule);
  }

  selectToken(token: Token) {
    this.uiService.selectToken(token);
  }

  dropRule(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dbService.rules, event.previousIndex, event.currentIndex);
  }

  dropToken(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dbService.tokens, event.previousIndex, event.currentIndex);
  }
}