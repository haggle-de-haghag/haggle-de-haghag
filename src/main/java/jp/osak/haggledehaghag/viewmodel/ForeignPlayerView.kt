package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.Player

data class ForeignPlayerView(
        val id: Int,
        val displayName: String
) {
    constructor(player: Player) : this(player.id, player.displayName)
}
