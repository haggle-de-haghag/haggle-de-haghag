package jp.osak.haggledehaghag.service.model

import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess

data class RuleWithAccess(val rule: Rule, val accessType: RuleAccess.Type)