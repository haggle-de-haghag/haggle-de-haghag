import { Injectable } from '@angular/core';
import {Player, Token} from "../model";
import {DBService} from "./db.service";

@Injectable({
  providedIn: 'root'
})
export class TokenListService {
  selectedToken: Token | undefined;

  constructor(private dbService: DBService) { }

  selectToken(token: Token) {
    this.selectedToken = token;
  }

  setAllocation(token: Token, player: Player, amount: number) {
    if (amount < 0) {
      throw new Error(`amount must be non-negative integer: got ${amount}`);
    }

    const allocationList = this.dbService.tokenAllocationMap[token.id];
    if (allocationList == undefined) {
      this.dbService.tokenAllocationMap[token.id] = [{ playerId: player.id, amount: amount }];
      return;
    }

    const allocation = allocationList.find((a) => a.playerId == player.id);
    if (allocation == undefined) {
      allocationList.push({ playerId: player.id, amount: amount });
    } else {
      allocation.amount = amount;
    }
  }
}
