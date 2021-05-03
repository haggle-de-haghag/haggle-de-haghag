package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.Player

data class FullPlayerInfoView(
        val gameTitle: String,
        val player: Player,
        val players: List<ForeignPlayerView>,
        val rules: List<RuleView>,
)
