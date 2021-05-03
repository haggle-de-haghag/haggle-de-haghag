package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Game
import org.springframework.data.repository.CrudRepository

interface GameRepository : CrudRepository<Game, Int> {
    fun findByGameKey(gameKey: String): Game?
    fun findByMasterKey(masterKey: String): Game?
}
