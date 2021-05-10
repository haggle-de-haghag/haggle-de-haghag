package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.PlayerToken
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository

interface PlayerTokenRepository : CrudRepository<PlayerToken, Int> {
    fun findByPlayerIdAndTokenId(playerId: Int, tokenId: Int): PlayerToken?

    fun findAllByPlayerId(playerId: Int): List<PlayerToken>

    fun findAllByPlayerIdInAndTokenId(playerIds: Collection<Int>, tokenId: Int): List<PlayerToken>

    @Query(
        """
        SELECT *
        FROM player_token
        JOIN player ON player_token.player_id = player.id
        WHERE player.game_id = :gameId
    """
    )
    fun findAllByGameId(gameId: Int): List<PlayerToken>
}
