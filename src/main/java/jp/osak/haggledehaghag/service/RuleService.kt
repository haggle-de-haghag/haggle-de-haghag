package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import jp.osak.haggledehaghag.util.Either
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
open class RuleService(
    private val playerRepository: PlayerRepository,
    private val ruleRepository: RuleRepository,
    private val ruleAccessRepository: RuleAccessRepository
) {
    fun findRule(ruleId: Int): Rule? {
        return ruleRepository.findByIdOrNull(ruleId)
    }

    fun saveAll(rules: Collection<Rule>) {
        ruleRepository.saveAll(rules)
    }

    @Transactional
    open fun updateRule(rule: Rule, title: String? = null, text: String? = null, assignedPlayerIds: List<Int>): Rule {
        // Pre-flight check: assignedPlayerIds are all in the same game as rule
        val players = playerRepository.findAllByIdIn(assignedPlayerIds)
        if (players.any { it.gameId != rule.gameId }) {
            throw IllegalArgumentException("Some playerIds don't exist in the same game as the given rule")
        }

        // Pre-flight check passed. Go forward with the actual updates.
        val newRule = rule.copy(
            title = title ?: rule.title,
            text = text ?: rule.text
        )
        val newDefaultRuleAccesses = assignedPlayerIds.map {
            RuleAccess(0, rule.id, it, RuleAccess.Type.ASSIGNED)
        }
        val savedRule = ruleRepository.save(newRule)
        ruleAccessRepository.deleteAllByRuleIdAndType(rule.id, RuleAccess.Type.ASSIGNED)
        ruleAccessRepository.saveAll(newDefaultRuleAccesses)

        return savedRule
    }

    @Transactional
    open fun deleteRule(rule: Rule) {
        ruleRepository.delete(rule)
        ruleAccessRepository.deleteAllByRuleId(rule.id)
    }

    fun assign(rule: Rule, player: Player): Either<RuleAccess, AssignError> {
        val existingAccess = ruleAccessRepository.findByRuleIdAndPlayerId(rule.id, player.id)
        if (existingAccess != null) {
            return Either.Err(AssignError.ALREADY_ASSIGNED)
        }

        val access = RuleAccess(0, rule.id, player.id, RuleAccess.Type.ASSIGNED)
        val result = ruleAccessRepository.save(access)
        return Either.Ok(result)
    }

    /**
     * Share a rule with specified player.
     *
     * @param rule the rule to be shared
     * @param from the player attempts to share the rule. The rule must be assigned to this player.
     * @param to the player who will get access to the rule
     * @return true if the rule is successfully shared. false if the rule is not assigned to the `from` player.
     */
    fun share(rule: Rule, from: Player, to: Player): Boolean {
        // Failure case: the `from` player doesn't actually own the rule
        val fromPlayerAccess = ruleAccessRepository.findByRuleIdAndPlayerId(rule.id, from.id)
        if (fromPlayerAccess?.type != RuleAccess.Type.ASSIGNED) {
            return false
        }

        // Failure case: the `to` player already knows the rule
        val currentAccess = ruleAccessRepository.findByRuleIdAndPlayerId(rule.id, to.id)
        if (currentAccess != null) {
            return false
        }

        val access = RuleAccess(0, rule.id, to.id, RuleAccess.Type.SHARED)
        ruleAccessRepository.save(access)
        return true
    }
}

enum class AssignError {
    ALREADY_ASSIGNED
}
