package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.service.PlayerService
import jp.osak.haggledehaghag.service.RuleService
import jp.osak.haggledehaghag.util.Either
import jp.osak.haggledehaghag.viewmodel.ForeignPlayerView
import jp.osak.haggledehaghag.viewmodel.FullGameInfoView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RequestMapping("/api/game_master/{masterKey}")
@RestController
class GameMasterController (
        private val gameService: GameService,
        private val ruleService: RuleService,
        private val playerService: PlayerService,
){
    @ModelAttribute
    fun addGame(@PathVariable masterKey: String): Game {
        return gameService.findGameForMasterKey(masterKey)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid game master key: $masterKey")
    }

    @GetMapping
    fun listFullGameInfo(@ModelAttribute game: Game): FullGameInfoView {
        val rules = gameService.listRules(game)
        val players = gameService.listPlayers(game).map { ForeignPlayerView(it) }
        return FullGameInfoView(game, rules, players)
    }


    @GetMapping("/rules")
    fun listRules(
            @ModelAttribute game: Game
    ): List<Rule> {
        return gameService.listRules(game)
    }

    @PostMapping("/rules")
    fun createRule(
            @ModelAttribute game: Game,
            @RequestBody request: CreateRuleRequest
    ): Rule {
        return gameService.createNewRule(game, request.title, request.text)
    }

    @PatchMapping("/rules/{ruleId}")
    fun updateRule(
            @ModelAttribute game: Game,
            @PathVariable ruleId: Int,
            @RequestBody request: UpdateRuleRequest
    ): Rule {
        val rule = ruleService.findRule(ruleId)
        if (rule == null || rule.gameId != game.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rule $ruleId does not belong to the game ${game.id}")
        }

        return ruleService.updateRule(rule, request.title, request.text)
    }

    @PostMapping("/rules/{ruleId}/assign")
    fun assignRule(
            @ModelAttribute game: Game,
            @PathVariable ruleId: Int,
            @RequestBody request: AssignRuleRequest
    ): RuleAccess {
        val rule = ruleService.findRule(ruleId)
        if (rule == null || rule.gameId != game.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rule $ruleId does not belong to the game ${game.id}")
        }

        val player = playerService.findPlayer(request.playerId)
        if (player == null || player.gameId != game.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Player ${request.playerId} does not belong to the game ${game.id}")
        }

        return when (val result = ruleService.assign(rule, player)) {
            is Either.Ok -> result.data
            is Either.Err -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rule $ruleId is already assigned to player ${player.id}")
        }
    }

    @GetMapping("/players")
    fun listPlayers(
            @ModelAttribute game: Game,
    ): List<Player> {
        return gameService.listPlayers(game)
    }

    data class CreateRuleRequest(val title: String, val text: String)
    data class UpdateRuleRequest(val title: String?, val text: String?)
    data class AssignRuleRequest(val playerId: Int)
}