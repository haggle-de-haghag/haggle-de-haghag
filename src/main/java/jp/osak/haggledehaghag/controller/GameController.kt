package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.repository.GameRepository
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.viewmodel.GameView
import jp.osak.haggledehaghag.viewmodel.PlayerView
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RequestMapping("/api/games")
@RestController
class GameController(
        private val gameService: GameService,
) {
    @PostMapping
    fun create(@RequestBody request: CreateRequest): GameView {
        val game = gameService.createNewGame(request.title)
        return GameView(game)
    }

    @PostMapping("{gameKey}/join")
    fun join(@PathVariable gameKey: String, @RequestBody request: JoinRequest): PlayerView {
        val game = gameService.findGame(gameKey)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid game key: " + gameKey)
        val player = gameService.createNewPlayer(game, request.playerName)
        return PlayerView(player)
    }

    data class CreateRequest(val title: String)
    data class JoinRequest(val playerName: String)
}