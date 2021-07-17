package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Player
import org.springframework.data.repository.CrudRepository

interface PlayerRepository : CrudRepository<Player, Int> {
    fun findByPlayerKey(playerKey: String): Player?
    fun findByGameIdAndDeleted(gameId: Int, deleted: Boolean): List<Player>
    fun findAllByIdIn(playerIds: Collection<Int>): List<Player>
}
