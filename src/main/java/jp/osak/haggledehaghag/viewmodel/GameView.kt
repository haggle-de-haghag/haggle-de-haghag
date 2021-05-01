package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.Game

data class GameView(
        val id: Int,
        val title: String,
) {
    constructor(game: Game) : this(game.id, game.title)
}
