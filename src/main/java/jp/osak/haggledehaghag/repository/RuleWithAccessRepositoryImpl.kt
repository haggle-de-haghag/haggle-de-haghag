package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.model.RuleWithAccess
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component
import java.sql.ResultSet

@Component
class RuleWithAccessRepositoryImpl (
        private val jdbcTemplate: NamedParameterJdbcTemplate
): RuleWithAccessRepository {
    override fun findAllWithAccessByPlayerIdsIn(playerIds: Collection<Int>): List<RuleWithAccess> {
        val rowMapper = RowMapper<RuleWithAccess> { rs, _ ->
            val rule = Rule(
                    id = rs.getInt(1),
                    gameId = rs.getInt(2),
                    ruleNumber = rs.getInt(3),
                    title = rs.getString(4),
                    text = rs.getString(5),
            )
            val accessType = RuleAccess.Type.valueOf(rs.getString(6))
            RuleWithAccess(rule, accessType)
        }
        return jdbcTemplate.query("""
            SELECT r.id, r.game_id, r.rule_number, r.title, r.text, ra.type
            FROM rule AS r 
            JOIN rule_access AS ra ON r.id = ra.rule_id
            WHERE ra.player_id IN (:playerIds)
        """, mapOf("playerIds" to playerIds), rowMapper)
    }
}