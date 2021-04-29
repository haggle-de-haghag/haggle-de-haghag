package jp.osak.haggledehaghag.viewmodel;

import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleAccess;

public record RuleView(
        int ruleNumber,
        String title,
        String text,
        RuleAccess.Type accessType
) {
    public static RuleView create(final Rule rule, final RuleAccess.Type accessType) {
        return new RuleView(rule.ruleNumber(), rule.title(), rule.text(), accessType);
    }
}
