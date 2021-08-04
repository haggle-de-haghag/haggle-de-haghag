import {Game, Player, Rule, RuleAccessMap, Token, TokenAllocationMap} from "../../../../web/src/model";

export class DBService {
    game!: Game;
    players!: Player[];
    rules!: Rule[];
    ruleAccessList!: RuleAccessMap;
    tokens!: Token[];
    tokenAllocationMap!: TokenAllocationMap;
}