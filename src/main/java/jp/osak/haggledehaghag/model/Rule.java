package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;

/**
 * Represents a rule used in a game.
 */
public record Rule(
        @Id int id,
        int gameId,
        int ruleNumber,
        String title,
        String text
) {
}
