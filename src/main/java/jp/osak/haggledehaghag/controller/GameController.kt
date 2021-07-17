package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.viewmodel.ForeignPlayerView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
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
        repeat(5) {
            return gameService.createNewPlayer(game, request.playerName)
        }
        throw ResponseStatusException(HttpStatus.CONFLICT, "Cannot join game ${game.id}")
    }

    @GetMapping("/{gameKey}/players")
    fun listPlayers(@ModelAttribute game: Game): List<ForeignPlayerView> {
        val players = gameService.listPlayers(game)
        return players.map { ForeignPlayerView(it) }
    }

    data class CreateRequest(val title: String)
    data class JoinRequest(val playerName: String)
}
