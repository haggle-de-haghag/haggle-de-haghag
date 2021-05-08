package jp.osak.haggledehaghag.model

import org.springframework.data.annotation.Id

data class Token (
    @Id val id: Int,
    val gameId: Int,
    val title: String,
    val text: String,
)
