package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.RuleAccess;
import jp.osak.haggledehaghag.model.RuleId;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface RuleAccessRepository extends CrudRepository<RuleAccess, RuleAccess> {
    @Query("SELECT * FROM rule_access WHERE game_id = :gameId AND player_id = :playerId")
    List<RuleAccess> findAllByGameIdAndPlayerId(final int gameId, final int playerId);
}
