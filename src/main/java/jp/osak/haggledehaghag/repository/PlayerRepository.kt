package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Player
import org.springframework.data.repository.CrudRepository
import java.util.*

interface PlayerRepository : CrudRepository<Player, Int> {
    fun findByPlayerKey(playerKey: String): Player?
    fun findByGameId(gameId: Int): List<Player>
    fun findAllByIdIn(playerIds: Collection<Int>): List<Player>
}