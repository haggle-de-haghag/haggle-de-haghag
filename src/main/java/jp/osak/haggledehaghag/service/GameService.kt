package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.repository.GameRepository
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class GameService (
        private val gameRepository: GameRepository,
        private val playerService: PlayerService,
        private val playerRepository: PlayerRepository,
        private val ruleRepository: RuleRepository,
        private val ruleAccessRepository: RuleAccessRepository,
){
    fun createNewGame(title: String): Game {
        val key = generateKey(title)
        val masterKey = "gm-" + generateKey(title)
        val game = Game(0, title, key, masterKey)
        return gameRepository.save(game)
    }

    fun findGame(gameKey: String): Game? {
        return gameRepository.findByGameKey(gameKey)
    }

    fun findGame(gameId: Int): Game? {
        return gameRepository.findByIdOrNull(gameId)
    }

    fun findGameForMasterKey(masterKey: String): Game? {
        return gameRepository.findByMasterKey(masterKey)
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

    fun listRuleAccesses(game: Game): List<RuleAccess> {
        return ruleAccessRepository.findAllByGameId(game.id)
    }

    private fun generateKey(base: String): String {
        val salt = Math.random()
        val keyBase = "$base-$salt"
        return String.format("%08x", keyBase.hashCode())
    }
}