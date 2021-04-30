package jp.osak.haggledehaghag.service;

import jp.osak.haggledehaghag.model.Player;
import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleAccess;
import jp.osak.haggledehaghag.repository.RuleAccessRepository;
import jp.osak.haggledehaghag.repository.RuleRepository;
import org.springframework.stereotype.Service;

@Service
public class RuleService {
    private final RuleRepository ruleRepository;
    private final RuleAccessRepository ruleAccessRepository;

    public RuleService(
            final RuleRepository ruleRepository,
            final RuleAccessRepository ruleAccessRepository
    ) {
        this.ruleRepository = ruleRepository;
        this.ruleAccessRepository = ruleAccessRepository;
    }

    /**
     * Share a rule with specified player.
     *
     * @param rule the rule to be shared
     * @param from the player attempts to share the rule. The rule must be assigned to this player.
     * @param to the player who will get access to the rule
     * @return true if the rule is successfully shared. false if the rule is not assigned to the <code>from</code> player.
     */
    public boolean share(final Rule rule, final Player from, final Player to) {
        if (ruleAccessRepository.findByRuleIdAndPlayerId(rule.id(), from.id()).isEmpty()) {
            return false;
        }

        var access = new RuleAccess(0, rule.id(), to.id(), RuleAccess.Type.SHARED);
        ruleAccessRepository.save(access);
        return true;
    }
}
