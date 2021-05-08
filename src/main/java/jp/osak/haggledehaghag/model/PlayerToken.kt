package jp.osak.haggledehaghag.model

import org.springframework.data.annotation.Id

data class PlayerToken(
    @Id val id: Int,
    val playerId: Int,
    val tokenId: Int,
    val amount: Int,
)
