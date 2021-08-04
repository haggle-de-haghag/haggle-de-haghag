import {Component, Input, OnInit} from '@angular/core';
import {Player, Token} from "../../model";
import {DBService} from "../db.service";
import {TokenListService} from "../token-list.service";

@Component({
  selector: 'app-allocation-table',
  templateUrl: './allocation-table.component.html',
  styleUrls: ['./allocation-table.component.scss']
})
export class AllocationTableComponent implements OnInit {
  displayedColumns = ['name', 'amount'];

  @Input()
  token!: Token;

  constructor(private dbService: DBService, private tokenListService: TokenListService) { }

  ngOnInit(): void {
  }

  get players() { return this.dbService.players; }

  get allocationMap() {
    const res: {[key: number]: number} = {};
    this.dbService.tokenAllocationMap[this.token.id]
        .forEach((a) => res[a.playerId] = a.amount);
    return res;
  }

  saveAmount(player: Player, event: FocusEvent) {
    const target = event.currentTarget;
    if (target == undefined) {
      return;
    }

    const amount = parseInt((target as HTMLInputElement).value);
    this.tokenListService.setAllocation(this.token, player, amount);
  }
}
