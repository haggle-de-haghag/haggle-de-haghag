package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import org.springframework.stereotype.Service

@Service
class RuleService(
        private val ruleRepository: RuleRepository,
        private val ruleAccessRepository: RuleAccessRepository
) {
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