package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.RuleAccess;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface RuleAccessRepository extends CrudRepository<RuleAccess, RuleAccess> {
    @Query("""
        SELECT ra.*
        FROM rule_access as ra
        JOIN rule as r ON ra.rule_id = r.id
        WHERE r.game_id = :gameId AND player_id = :playerId
    """)
    List<RuleAccess> findAllByGameIdAndPlayerId(int gameId, int playerId);

    Optional<RuleAccess> findByRuleIdAndPlayerId(int ruleId, int playerId);
}
