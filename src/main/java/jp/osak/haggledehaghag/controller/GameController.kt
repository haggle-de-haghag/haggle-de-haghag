package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.repository.GameRepository
import jp.osak.haggledehaghag.repository.PlayerRepository
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.viewmodel.GameView
import jp.osak.haggledehaghag.viewmodel.PlayerView
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RequestMapping("/api/game")
@RestController
class GameController(
        private val gameRepository: GameRepository,
        private val gameService: GameService,
        private val playerRepository: PlayerRepository
) {
    @PostMapping
    fun create(@RequestBody request: CreateRequest): GameView {
        val game = Game(0, request.title)
        val createdGame = gameRepository.save(game)
        return GameView(createdGame)
    }

    @PostMapping("/join")
    fun join(@RequestBody request: JoinRequest): PlayerView {
        val game = gameRepository.findByIdOrNull(request.gameId)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid game id: " + request.gameId)
        val player = gameService.createNewPlayer(game, request.playerName)
        val createdPlayer = playerRepository.save(player)
        return PlayerView(createdPlayer)
    }

    data class CreateRequest(val title: String)
    data class JoinRequest(val gameId: Int, val playerName: String)
}