package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;

/**
 * Represents a player in a game.
 */
public record Player(
        @Id int id,
        int gameId,
        String displayName,
        String playerKey
) {
}
