package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Player
import org.springframework.data.repository.CrudRepository

interface PlayerRepository : CrudRepository<Player, Int> {
    fun findByPlayerKey(playerKey: String): Player?
    fun findByGameIdAndStateIn(gameId: Int, states: Collection<Player.State>): List<Player>
    fun findAllByIdIn(playerIds: Collection<Int>): List<Player>
}
