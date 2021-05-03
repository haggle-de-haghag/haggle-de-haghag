package jp.osak.haggledehaghag.model

import org.springframework.data.annotation.Id

data class Rule(
    @Id val id: Int,
    val gameId: Int,
    val ruleNumber: Int,
    val title: String,
    val text: String,
)
