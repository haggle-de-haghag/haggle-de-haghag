package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Rule
import org.springframework.data.repository.CrudRepository

interface RuleRepository : CrudRepository<Rule, Int> {
    fun findByGameId(gameId: Int): List<Rule>
    fun findByGameIdAndIdIn(gameId: Int, ruleIds: Collection<Int>): List<Rule>
}