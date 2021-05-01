package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.Player

data class PlayerView(
        val displayName: String,
        val playerKey: String
) {
    constructor(player: Player) : this(player.displayName, player.playerKey)
}
