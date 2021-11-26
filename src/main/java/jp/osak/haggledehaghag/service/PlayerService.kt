package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.PlayerToken
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.model.RuleWithAccess
import jp.osak.haggledehaghag.model.Token
import jp.osak.haggledehaghag.model.TokenWithAmount
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.repository.PlayerTokenRepository
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import jp.osak.haggledehaghag.repository.TokenRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.stream.Collectors

@Service
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val ruleRepository: RuleRepository,
    private val ruleAccessRepository: RuleAccessRepository,
    private val ruleService: RuleService,
    private val tokenRepository: TokenRepository,
    private val playerTokenRepository: PlayerTokenRepository,
) {
    fun createNewPlayer(game: Game, displayName: String, state: Player.State): Player {
        val playerKey = "pl-${game.gameKey}-${generateKey("${game.id}-$displayName")}"
        val player = Player(0, game.id, displayName, playerKey, state)
        playerRepository.save(player)
        return player
    }

    fun findPlayer(playerId: Int): Player? {
        return playerRepository.findByIdOrNull(playerId)
    }

    fun findPlayer(playerKey: String): Player? {
        return playerRepository.findByPlayerKey(playerKey)
    }

    fun activate(player: Player, name: String): Player {
        require(player.state == Player.State.STUB) { "Player ${player.id} is not a stub player" }
        val newPlayer = player.copy(displayName = name, state = Player.State.ACTIVE)
        return playerRepository.save(newPlayer)
    }

    fun updateName(player: Player, name: String): Player {
        val newPlayer = player.copy(displayName = name)
        return playerRepository.save(newPlayer)
    }

    fun findAllAccessibleRules(player: Player, game: Game): List<RuleWithAccess> {
        val ruleAccesses = ruleAccessRepository.findAllByPlayerId(player.id)
        val ruleIds = ruleAccesses.map { it.ruleId }
        val rules = when (game.state) {
            Game.State.POST_MORTEM -> ruleRepository.findByGameId(player.gameId)
            else -> ruleRepository.findByGameIdAndIdIn(player.gameId, ruleIds)
        }
        val accessMap = ruleAccesses.map { Pair(it.ruleId, it) }.toMap()
        return rules.mapNotNull { r: Rule ->
            val access = accessMap[r.id]
            val accessType = when {
                access != null -> access.type
                game.state == Game.State.POST_MORTEM -> RuleAccess.Type.POST_MORTEM
                else -> null
            }
            accessType?.let { RuleWithAccess(r, it) }
        }
    }

    fun findAllTokens(player: Player, game: Game): List<TokenWithAmount> {
        val playerTokens = playerTokenRepository.findAllByPlayerId(player.id)
        val tokenIds = playerTokens.map { it.tokenId }
        val tokens = when (game.state) {
            Game.State.POST_MORTEM -> tokenRepository.findAllByGameId(player.gameId)
            else -> tokenRepository.findAllByIdIn(tokenIds)
        }
        val amountMap = playerTokens.map { Pair(it.tokenId, it.amount) }.toMap()
        return tokens.mapNotNull {
            val amount = amountMap[it.id]
            when {
                amount != null && amount > 0 -> TokenWithAmount(it, amount)
                game.state == Game.State.POST_MORTEM -> TokenWithAmount(it, 0)
                else -> null
            }
        }
    }

    fun findToken(player: Player, tokenId: Int): TokenWithAmount? {
        val playerToken = playerTokenRepository.findByPlayerIdAndTokenId(player.id, tokenId)
            ?: return null
        val token = tokenRepository.findByIdOrNull(tokenId)
            ?: return null
        return TokenWithAmount(token, playerToken.amount)
    }

    @Transactional(rollbackFor = [Exception::class])
    fun setToken(player: Player, token: Token, amount: Int): PlayerToken {
        require(player.gameId == token.gameId) { "Game ID of player ${player.id} and token ${token.id} doesn't match" }
        require(amount >= 0) { "Token amount must be nonnegative, but got $amount" }

        var playerToken = playerTokenRepository.findByPlayerIdAndTokenId(player.id, token.id)
        if (playerToken == null) {
            playerToken = PlayerToken(0, player.id, token.id, 0)
        }
        playerToken = playerToken.copy(amount = amount)
        return playerTokenRepository.save(playerToken)
    }

    @Transactional(rollbackFor = [Exception::class])
    fun addToken(player: Player, token: Token, amount: Int): PlayerToken {
        require(player.gameId == token.gameId) { "Game ID of player ${player.id} and token ${token.id} doesn't match" }

        var playerToken = playerTokenRepository.findByPlayerIdAndTokenId(player.id, token.id)
        if (playerToken == null) {
            playerToken = PlayerToken(0, player.id, token.id, 0)
        }
        val newAmount = playerToken.amount + amount
        if (newAmount < 0) {
            throw IllegalArgumentException("New amount must not be negative. Current amount: ${playerToken.amount}")
        }
        playerToken = playerToken.copy(amount = newAmount)
        return playerTokenRepository.save(playerToken)
    }

    @Transactional(rollbackFor = [Exception::class])
    fun bulkSetTokenAmounts(allocation: Map<Int, Int>, token: Token): List<PlayerToken> {
        val players = playerRepository.findAllByIdIn(allocation.keys)
        if (players.any { it.gameId != token.gameId }) {
            throw IllegalArgumentException("Some playerIds don't belong to the same game as the given token")
        }

        val playerTokens = playerTokenRepository.findAllByPlayerIdInAndTokenId(players.map { it.id }, token.id).toMutableList()
        for ((playerId, amount) in allocation) {
            val index = playerTokens.indexOfFirst { it.playerId == playerId }
            if (index == -1) {
                playerTokens.add(PlayerToken(0, playerId, token.id, amount))
            } else {
                playerTokens[index] = playerTokens[index].copy(amount = amount)
            }
        }
        require(playerTokens.size == allocation.size) { "playerTokens.size (${playerTokens.size}) should have matched to allocations.size (${allocation.size})" }
        return playerTokenRepository.saveAll(playerTokens).toList()
    }

    @Transactional(rollbackFor = [Exception::class])
    fun giveToken(player: Player, targetPlayer: Player, token: Token, amount: Int) {
        require(player.gameId == targetPlayer.gameId) { "Player ${player.id} and target player ${targetPlayer.id} must belong to the same game" }
        require(player.gameId == token.gameId) { "Player ${player.id} and token ${token.id} must belong to the same game" }
        require(amount > 0) { "Cannot give non-positive number of tokens: $amount" }

        val playerToken = playerTokenRepository.findByPlayerIdAndTokenId(player.id, token.id)
            ?: throw IllegalArgumentException("Player ${player.id} doesn't have ${token.id}")
        if (playerToken.amount < amount) {
            throw IllegalArgumentException("Player ${player.id} does not have enough token ${token.id}: has ${playerToken.amount} but attempted to give $amount")
        }

        addToken(player, token, -amount)
        addToken(targetPlayer, token, amount)
    }

    /**
     * Share a rule with specified player.
     *
     * @param player the player attempts to share the rule. The rule must be assigned to this player.
     * @param to the player who will get access to the rule
     * @param rule the rule to be shared
     * @return true if the rule is successfully shared. false if the rule is not assigned to the `from` player.
     */
    fun shareRule(player: Player, to: Player, rule: Rule): Boolean {
        return ruleService.share(rule, player, to)
    }

    fun kick(player: Player): Player {
        val newPlayer = player.copy(state = Player.State.DELETED)
        return playerRepository.save(newPlayer)
    }

    private fun generateKey(base: String): String {
        val salt = Math.random()
        val keyBase = "$base-$salt"
        return String.format("%08x", keyBase.hashCode())
    }
}
