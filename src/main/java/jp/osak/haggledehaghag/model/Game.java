package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;

/**
 * Represents a session of Haggle game.
 */
public record Game(
        @Id int id,
        String title
) {
}
