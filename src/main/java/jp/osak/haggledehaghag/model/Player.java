package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;

public record Player(
        @Id int id,
        String displayName
) {
}
