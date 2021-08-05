import { Injectable } from '@angular/core';
import {Player, Token, TokenId} from "../model";
import {DBService} from "./db.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TokenListService {
  constructor(private dbService: DBService) { }

  getToken(tokenId: TokenId) {
    return new Observable<TokenWithAllocation>((subscriber) => {
      const token = this.dbService.tokens.find((t) => t.id == tokenId);
      if (token == undefined) {
        throw new Error(`Token ${tokenId} not found`);
      }

      const playerTokenAllocation: PlayerTokenAllocation = {};
      this.dbService.tokenAllocationMap[tokenId]
          .forEach((alloc) => playerTokenAllocation[alloc.playerId] = alloc.amount);
      this.dbService.players.forEach((player) => {
        if (playerTokenAllocation[player.id] == undefined) {
          playerTokenAllocation[player.id] = 0;
        }
      });

      subscriber.next(new TokenWithAllocation(token, playerTokenAllocation));
    });
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

export type PlayerTokenAllocation = { [key: number]: number }; // PlayerId -> Amount

export class TokenWithAllocation {
  constructor(public token: Token, public playerTokenAllocation: PlayerTokenAllocation) {}
}