package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.service.RuleService
import jp.osak.haggledehaghag.service.model.RuleWithAccess
import jp.osak.haggledehaghag.viewmodel.RuleView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RequestMapping("/api/games/{gameKey}/game_master")
@RestController
class GameMasterController (
        private val gameService: GameService,
        private val ruleService: RuleService,
){
    @ModelAttribute
    fun addGame(@PathVariable gameKey: String): Game {
        return gameService.findGame(gameKey)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid game key: $gameKey")
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
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "$ruleId does not belong to the game ${game.id}")
        }

        return ruleService.updateRule(rule, request.title, request.text)
    }

    data class CreateRuleRequest(val title: String, val text: String)
    data class UpdateRuleRequest(val title: String?, val text: String?)
}