package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Rule

data class FullGameInfoView(
        val game: Game,
        val rules: List<Rule>
)
