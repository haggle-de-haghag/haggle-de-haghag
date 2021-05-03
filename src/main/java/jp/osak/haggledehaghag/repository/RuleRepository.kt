package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Rule
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository

interface RuleRepository : CrudRepository<Rule, Int>, RuleWithAccessRepository {
    fun findByGameId(gameId: Int): List<Rule>
    fun findByGameIdAndIdIn(gameId: Int, ruleIds: Collection<Int>): List<Rule>

    @Query("SELECT MAX(rule_number) FROM rule WHERE game_id = :gameId")
    fun findMaxRuleNumberByGameId(gameId: Int): Int?
}