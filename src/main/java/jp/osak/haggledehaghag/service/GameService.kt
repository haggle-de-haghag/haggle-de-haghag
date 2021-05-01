package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import org.springframework.stereotype.Service

@Service
class GameService {
    fun createNewPlayer(game: Game, displayName: String): Player {
        val salt = Math.random()
        val keyBase = String.format("%d-%s-%f", game.id, displayName, salt)
        val playerKey = String.format("%08x", keyBase.hashCode())
        return Player(0, game.id, displayName, playerKey)
    }
}