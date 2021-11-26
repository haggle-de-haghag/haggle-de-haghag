package jp.osak.haggledehaghag.model

import org.springframework.data.annotation.Id

data class Game(
    @Id val id: Int,
    val title: String,
    val gameKey: String,
    val masterKey: String,
    val state: State
) {
    enum class State {
        PLAYING,
        POST_MORTEM
    }
}
