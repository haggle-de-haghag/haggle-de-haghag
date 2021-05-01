package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.repository.GameRepository
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import org.springframework.stereotype.Service

@Service
class GameService (
        private val gameRepository: GameRepository,
        private val playerService: PlayerService,
        private val playerRepository: PlayerRepository,
        private val ruleRepository: RuleRepository,
){
    fun createNewGame(title: String): Game {
        val key = generateKey(title)
        val game = Game(0, title, key)
        gameRepository.save(game)
        return game
    }

    fun findGame(gameKey: String): Game? {
        return gameRepository.findByGameKey(gameKey)
    }

    fun createNewPlayer(game: Game, displayName: String): Player {
        return playerService.createNewPlayer(game.id, displayName)
    }

    fun createNewRule(game: Game, title: String, text: String): Rule {
        val ruleNumber = (ruleRepository.findMaxRuleNumberByGameId(game.id) ?: 0) + 1
        val rule = Rule(0, game.id, ruleNumber, title, text)
        return ruleRepository.save(rule)
    }

    fun listPlayers(game: Game): List<Player> {
        return playerRepository.findByGameId(game.id)
    }

    fun listRules(game: Game): List<Rule> {
        return ruleRepository.findByGameId(game.id)
    }

    private fun generateKey(base: String): String {
        val salt = Math.random()
        val keyBase = "$base-$salt"
        return String.format("%08x", keyBase.hashCode())
    }
}