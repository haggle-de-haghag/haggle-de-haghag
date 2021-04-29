package jp.osak.haggledehaghag.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Embedded;

public record Rule(
        int gameId,
        int ruleNumber,
        String title,
        String text
) {
}
