package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.RuleWithAccess

interface RuleWithAccessRepository {
    fun findAllWithAccessByPlayerIdsIn(playerIds: Collection<Int>): List<RuleWithAccess>
}
