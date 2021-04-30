package jp.osak.haggledehaghag.model;

/**
 * Represents the fact that a player has access to a rule.
 */
public record RuleAccess(
        int ruleId,
        int playerId,
        Type type
) {
    public enum Type {
        ASSIGNED,
        SHARED
    }
}
