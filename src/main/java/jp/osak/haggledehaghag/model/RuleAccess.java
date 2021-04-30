package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;

/**
 * Represents the fact that a player has access to a rule.
 */
public record RuleAccess(
        @Id int id,
        int ruleId,
        int playerId,
        Type type
) {
    public enum Type {
        ASSIGNED,
        SHARED
    }
}
