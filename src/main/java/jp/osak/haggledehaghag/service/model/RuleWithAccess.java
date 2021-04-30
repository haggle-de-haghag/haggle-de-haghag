package jp.osak.haggledehaghag.service.model;

import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleAccess;

public record RuleWithAccess(
        Rule rule,
        RuleAccess.Type accessType
) {
}
