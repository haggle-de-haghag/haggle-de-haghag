package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.repository.GameRepository
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.viewmodel.ForeignPlayerView
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
    @ModelAttribute
    fun addGame(@PathVariable(required = false) gameKey: String?): Game? {
        return when (gameKey) {
            null -> null
            else -> gameService.findGame(gameKey) ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid game key: $gameKey")
        }
    }

    @PostMapping
    fun create(@RequestBody request: CreateRequest): Game {
        val game = gameService.createNewGame(request.title)
        return game
    }

    @PostMapping("{gameKey}/join")
    fun join(@ModelAttribute game: Game, @RequestBody request: JoinRequest): Player {
        val player = gameService.createNewPlayer(game, request.playerName)
        return player
    }

    @GetMapping("/{gameKey}/players")
    fun listPlayers(@ModelAttribute game: Game): List<ForeignPlayerView> {
        val players = gameService.listPlayers(game)
        return players.map { ForeignPlayerView(it) }
    }

    data class CreateRequest(val title: String)
    data class JoinRequest(val playerName: String)
}