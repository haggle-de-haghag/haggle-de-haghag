package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import jp.osak.haggledehaghag.util.Either
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class RuleService(
        private val ruleRepository: RuleRepository,
        private val ruleAccessRepository: RuleAccessRepository
) {
    fun findRule(ruleId: Int): Rule? {
        return ruleRepository.findByIdOrNull(ruleId)
    }

    fun updateRule(rule: Rule, title: String? = null, text: String? = null): Rule {
        val newRule = rule.copy(
                title = title ?: rule.title,
                text = text ?: rule.text
        )
        return ruleRepository.save(newRule)
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
        if (ruleAccessRepository.findByRuleIdAndPlayerId(rule.id, from.id) == null) {
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