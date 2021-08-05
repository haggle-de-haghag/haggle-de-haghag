import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DBService} from "../db.service";
import {TokenListService, TokenWithAllocation} from "../token-list.service";

@Component({
  selector: 'app-token-editor',
  templateUrl: './token-editor.component.html',
  styleUrls: ['./token-editor.component.scss']
})
export class TokenEditorComponent implements OnChanges {
  displayedColumns = ['name', 'amount'];

  @Input() tokenId!: number;

  data: TokenWithAllocation | undefined;

  constructor(private dbService: DBService, private tokenListService: TokenListService) { }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['tokenId'];
    if (change != undefined) {
      this.tokenListService.getToken(change.currentValue)
          .subscribe((val) => this.data = val);
    }
  }

  get players() { return this.dbService.players; }
}
