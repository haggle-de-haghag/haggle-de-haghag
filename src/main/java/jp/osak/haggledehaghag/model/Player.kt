package jp.osak.haggledehaghag.model

import org.springframework.data.annotation.Id

data class Player(
        @Id val id: Int,
        val gameId: Int,
        val displayName: String,
        val playerKey: String,
)
