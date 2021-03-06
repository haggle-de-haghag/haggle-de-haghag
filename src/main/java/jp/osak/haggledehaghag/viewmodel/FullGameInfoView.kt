package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.model.Token

data class FullGameInfoView(
    val game: Game,
    val rules: List<Rule>,
    val players: List<Player>,
    val ruleAccessMap: Map<Int, List<PlayerIdWithAccess>>,
    val tokens: List<Token>,
    val tokenAllocationMap: Map<Int, List<PlayerIdWithAmount>>,
) {
    data class PlayerIdWithAccess(val playerId: Int, val accessType: RuleAccess.Type)
    data class PlayerIdWithAmount(val playerId: Int, val amount: Int)
}
