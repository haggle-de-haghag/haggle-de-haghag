package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.RuleAccess
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository

interface RuleAccessRepository : CrudRepository<RuleAccess, Int> {
    @Query("""
        SELECT ra.*
        FROM rule_access as ra
        JOIN rule as r ON ra.rule_id = r.id
        WHERE r.game_id = :gameId AND player_id = :playerId
    """)
    fun findAllByGameIdAndPlayerId(gameId: Int, playerId: Int): List<RuleAccess>

    fun findByRuleIdAndPlayerId(ruleId: Int, playerId: Int): RuleAccess?

    fun deleteByRuleId(ruleId: Int)
}