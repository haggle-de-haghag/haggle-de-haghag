package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.PlayerToken
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.model.Token
import jp.osak.haggledehaghag.repository.GameRepository
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.repository.PlayerTokenRepository
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import jp.osak.haggledehaghag.repository.TokenRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionTemplate
import java.lang.IllegalArgumentException

@Service
class GameService(
    private val gameRepository: GameRepository,
    private val playerService: PlayerService,
    private val ruleService: RuleService,
    private val playerRepository: PlayerRepository,
    private val ruleRepository: RuleRepository,
    private val ruleAccessRepository: RuleAccessRepository,
    private val tokenRepository: TokenRepository,
    private val playerTokenRepository: PlayerTokenRepository,
) {
    fun createNewGame(title: String): Game {
        val key = generateKey(title)
        val masterKey = "gm-" + generateKey(title)
        val game = Game(0, title, key, masterKey, Game.State.PLAYING)
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

    @Transactional(rollbackFor = [Exception::class])
    fun createNewPlayer(game: Game, displayName: String): Player {
        val stubPlayer = listStubPlayers(game).firstOrNull()
        return if (stubPlayer != null) {
            playerService.activate(stubPlayer, displayName)
        } else {
            playerService.createNewPlayer(game, displayName, Player.State.ACTIVE)
        }
    }

    fun createNewStubPlayer(game: Game, displayName: String): Player {
        return playerService.createNewPlayer(game, displayName, Player.State.STUB)
    }

    fun createNewRule(game: Game, title: String, text: String): Rule {
        val ruleNumber = (ruleRepository.findMaxRuleNumberByGameId(game.id) ?: 0) + 1
        val rule = Rule(0, game.id, ruleNumber, title, text)
        return ruleRepository.save(rule)
    }

    fun createNewToken(game: Game, title: String, text: String): Token {
        val token = Token(0, game.id, title, text)
        return tokenRepository.save(token)
    }

    fun listPlayers(game: Game): List<Player> {
        return playerRepository.findByGameIdAndStateIn(game.id, setOf(Player.State.ACTIVE, Player.State.STUB))
    }

    fun listStubPlayers(game: Game): List<Player> {
        return playerRepository.findByGameIdAndStateIn(game.id, setOf(Player.State.STUB))
    }

    fun listActivePlayers(game: Game): List<Player> {
        return playerRepository.findByGameIdAndStateIn(game.id, setOf(Player.State.ACTIVE))
    }

    fun listRules(game: Game): List<Rule> {
        return ruleRepository.findByGameId(game.id)
    }

    fun listRuleAccesses(game: Game): List<RuleAccess> {
        return ruleAccessRepository.findAllByGameId(game.id)
    }

    fun listTokens(game: Game): List<Token> {
        return tokenRepository.findAllByGameId(game.id)
    }

    fun listPlayerTokens(game: Game): List<PlayerToken> {
        return playerTokenRepository.findAllByGameId(game.id)
    }

    fun findPlayer(game: Game, playerId: Int): Player? {
        return playerRepository.findByIdOrNull(playerId)?.takeIf { it.gameId == game.id }
    }

    fun findRule(game: Game, ruleId: Int): Rule? {
        return ruleRepository.findByIdOrNull(ruleId)?.takeIf { it.gameId == game.id }
    }

    @Transactional
    fun deleteRule(game: Game, ruleId: Int) {
        val rule = findRule(game, ruleId)
            ?: throw IllegalArgumentException("Rule $ruleId does not belong to the game ${game.id}")
        ruleService.deleteRule(rule)

        // Reassign ruleNumbers to "shift" the rules to fill the position of the deleted rule.
        val newRules = listRules(game).sortedBy { it.ruleNumber }
            .mapIndexed { idx, r -> r.copy(ruleNumber = idx + 1) }
        ruleService.saveAll(newRules)
    }

    @Transactional
    fun moveRuleTo(game: Game, ruleId: Int, position: Int): Rule? {
        val rules = listRules(game).sortedBy { it.ruleNumber }.toMutableList()
        var index = rules.indexOfFirst { it.id == ruleId }
        if (index == -1) {
            throw IllegalArgumentException("Rule $ruleId does not belong to the game ${game.id}")
        }

        if (rules[index].ruleNumber > position) {
            while (index > 0 && rules[index - 1].ruleNumber >= position) {
                val tmp = rules[index]
                rules[index] = rules[index - 1]
                rules[index - 1] = tmp
                --index
            }
        } else {
            while (index < rules.size - 1 && rules[index + 1].ruleNumber <= position) {
                val tmp = rules[index]
                rules[index] = rules[index + 1]
                rules[index + 1] = tmp
                ++index
            }
        }
        val newRules = rules.mapIndexed { idx, rule ->
            rule.copy(ruleNumber = idx + 1)
        }
        ruleRepository.saveAll(newRules)

        return findRule(game, ruleId)
    }

    fun findToken(game: Game, tokenId: Int): Token? {
        return tokenRepository.findByIdOrNull(tokenId)?.takeIf { it.gameId == game.id }
    }

    fun updateTitle(game: Game, title: String): Game {
        val newGame = game.copy(title = title)
        return gameRepository.save(newGame)
    }

    fun kickPlayer(game: Game, player: Player): Player {
        require(player.gameId == game.id) { "Player ${player.id} does not belong to game ${game.id}" }
        return playerService.kick(player)
    }

    fun updateState(game: Game, state: Game.State): Game {
        val newGame = game.copy(state = state)
        return gameRepository.save(newGame)
    }

    private fun generateKey(base: String): String {
        val salt = Math.random()
        val keyBase = "$base-$salt"
        return String.format("%08x", keyBase.hashCode())
    }
}
