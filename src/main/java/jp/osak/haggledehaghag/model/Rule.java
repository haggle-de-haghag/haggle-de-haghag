package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;

public record Rule(
        @Id int id,
        int gameId,
        int ordinal,
        String text
) {
}
