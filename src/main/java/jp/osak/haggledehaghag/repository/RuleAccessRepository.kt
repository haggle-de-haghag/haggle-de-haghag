package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.RuleAccess
import org.springframework.data.jdbc.repository.query.Modifying
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository

interface RuleAccessRepository : CrudRepository<RuleAccess, Int> {
    @Query(
        """
        SELECT ra.*
        FROM rule_access as ra
        JOIN rule as r ON ra.rule_id = r.id
        WHERE r.game_id = :gameId
    """
    )
    fun findAllByGameId(gameId: Int): List<RuleAccess>

    fun findAllByPlayerId(playerId: Int): List<RuleAccess>

    fun findByRuleIdAndPlayerId(ruleId: Int, playerId: Int): RuleAccess?

    @Modifying
    @Query("DELETE FROM rule_access WHERE rule_id = :ruleId")
    fun deleteAllByRuleId(ruleId: Int)

    @Modifying
    @Query("DELETE FROM rule_access WHERE rule_id = :ruleId AND type = :accessType")
    fun deleteAllByRuleIdAndType(ruleId: Int, accessType: RuleAccess.Type)
}
