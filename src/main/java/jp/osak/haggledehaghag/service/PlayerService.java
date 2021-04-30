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

    public PlayerService(
            final PlayerRepository playerRepository,
            final RuleRepository ruleRepository,
            final RuleAccessRepository ruleAccessRepository
    ) {
        this.playerRepository = playerRepository;
        this.ruleRepository = ruleRepository;
        this.ruleAccessRepository = ruleAccessRepository;
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
}
