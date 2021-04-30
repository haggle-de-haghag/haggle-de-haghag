package jp.osak.haggledehaghag.service;

import jp.osak.haggledehaghag.model.Player;
import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleAccess;
import jp.osak.haggledehaghag.repository.PlayerRepository;
import jp.osak.haggledehaghag.repository.RuleAccessRepository;
import jp.osak.haggledehaghag.repository.RuleRepository;
import jp.osak.haggledehaghag.service.model.RuleWithAccess;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final RuleRepository ruleRepository;
    private final RuleAccessRepository ruleAccessRepository;
    private final RuleService ruleService;

    public PlayerService(
            final PlayerRepository playerRepository,
            final RuleRepository ruleRepository,
            final RuleAccessRepository ruleAccessRepository,
            final RuleService ruleService
    ) {
        this.playerRepository = playerRepository;
        this.ruleRepository = ruleRepository;
        this.ruleAccessRepository = ruleAccessRepository;
        this.ruleService = ruleService;
    }

    public Optional<Player> findPlayer(final String playerKey) {
        return playerRepository.findByPlayerKey(playerKey);
    }

    public List<RuleWithAccess> findAllAccessibleRules(final Player player) {
        final List<RuleAccess> ruleAccesses = ruleAccessRepository.findAllByGameIdAndPlayerId(player.gameId(), player.id());
        final List<Integer> ruleIds = ruleAccesses.stream().map(RuleAccess::ruleId).collect(Collectors.toList());
        final List<Rule> rules = ruleRepository.findByGameIdAndIdIn(player.gameId(), ruleIds);

        final Map<Integer, RuleAccess> accessMap = ruleAccesses.stream()
                .collect(Collectors.toMap(RuleAccess::ruleId, Function.identity()));
        return rules.stream()
                .map((r) -> new RuleWithAccess(r, accessMap.get(r.id()).type()))
                .collect(Collectors.toList());
    }

    /**
     * Share a rule with specified player.
     *
     * @param player the player attempts to share the rule. The rule must be assigned to this player.
     * @param to the player who will get access to the rule
     * @param rule the rule to be shared
     * @return true if the rule is successfully shared. false if the rule is not assigned to the <code>from</code> player.
     */
    public boolean shareRule(final Player player, final Player to, final Rule rule) {
        return ruleService.share(rule, player, to);
    }
}
