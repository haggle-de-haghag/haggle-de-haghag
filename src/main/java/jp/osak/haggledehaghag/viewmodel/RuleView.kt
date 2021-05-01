package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.service.model.RuleWithAccess

data class RuleView(
        val ruleNumber: Int,
        val title: String,
        val text: String,
        val accessType: RuleAccess.Type,
) {
    constructor(r: RuleWithAccess) : this(r.rule.ruleNumber, r.rule.title, r.rule.text, r.accessType)
}
