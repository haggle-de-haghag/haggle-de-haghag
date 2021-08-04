import {Injectable} from "@angular/core";
import {Rule, RuleId} from "../../model";
import {DBService} from "../../db.service";

@Injectable()
export class RuleListService {
    selectedRule: Rule | undefined;

    constructor(private dbService: DBService) {
    }

    selectRule(ruleId: RuleId) {
        this.selectedRule = this.rules.find((r) => r.id == ruleId);
    }

    get rules() { return this.dbService.rules; }
}
