package jp.osak.haggledehaghag.model;

import org.springframework.data.relational.core.mapping.Embedded;

public record RuleAccess(
        int gameId,
        int ruleNumber,
        int playerId,
        Type type
) {
    public enum Type {
        ASSIGNED,
        SHARED
    }
}
