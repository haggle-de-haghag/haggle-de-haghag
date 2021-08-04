import { Injectable } from '@angular/core';
import {ForeignPlayer, Player, Rule, Token} from "./model";

@Injectable({
  providedIn: 'root'
})
export class DBService {
  gameTitle: string = '';
  player!: Player;
  players: ForeignPlayer[] = [];
  rules: Rule[] = [];
  tokens: Token[] = [];
}
