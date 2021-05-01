package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import jp.osak.haggledehaghag.service.model.RuleWithAccess
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*
import java.util.function.Function
import java.util.stream.Collectors

@Service
class PlayerService(
        private val playerRepository: PlayerRepository,
        private val ruleRepository: RuleRepository,
        private val ruleAccessRepository: RuleAccessRepository,
        private val ruleService: RuleService
) {
    fun createNewPlayer(gameId: Int, displayName: String): Player {
        val playerKey = generateKey("${gameId}-${displayName}")
        val player = Player(0, gameId, displayName, playerKey)
        playerRepository.save(player)
        return player
    }

    fun findPlayer(playerId: Int): Player? {
        return playerRepository.findByIdOrNull(playerId)
    }

    fun findPlayer(playerKey: String): Player? {
        return playerRepository.findByPlayerKey(playerKey)
    }

    fun findAllAccessibleRules(player: Player): List<RuleWithAccess> {
        val ruleAccesses = ruleAccessRepository.findAllByGameIdAndPlayerId(player.gameId, player.id)
        val ruleIds = ruleAccesses.map { it.ruleId }
        val rules = ruleRepository.findByGameIdAndIdIn(player.gameId, ruleIds)
        val accessMap = ruleAccesses.map { Pair(it.ruleId, it) }.toMap()
        return rules.stream()
                .map { r: Rule -> RuleWithAccess(r, accessMap[r.id]!!.type) }
                .collect(Collectors.toList())
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

    private fun generateKey(base: String): String {
        val salt = Math.random()
        val keyBase = "$base-$salt"
        return String.format("%08x", keyBase.hashCode())
    }
}