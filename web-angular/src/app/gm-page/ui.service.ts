import { Injectable } from '@angular/core';
import {Rule, Token} from "../model";

@Injectable({
  providedIn: 'root'
})
export class UIService {
  selectedRule: Rule | undefined;
  selectedToken: Token | undefined;

  constructor() { }

  selectRule(rule: Rule) {
    this.selectedRule = rule;
    this.selectedToken = undefined;
  }

  selectToken(token: Token) {
    this.selectedRule = undefined;
    this.selectedToken = token;
  }
}
