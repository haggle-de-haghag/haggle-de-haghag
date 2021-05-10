package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.PlayerToken
import org.springframework.data.repository.CrudRepository

interface PlayerTokenRepository : CrudRepository<PlayerToken, Int> {
    fun findByPlayerIdAndTokenId(playerId: Int, tokenId: Int): PlayerToken?

    fun findAllByPlayerId(playerId: Int): List<PlayerToken>

    fun findAllByPlayerIdIn(playerIds: Collection<Int>): List<PlayerToken>
}
