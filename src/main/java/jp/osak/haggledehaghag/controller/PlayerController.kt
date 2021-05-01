package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.service.PlayerService
import jp.osak.haggledehaghag.service.model.RuleWithAccess
import jp.osak.haggledehaghag.viewmodel.RuleView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.function.Function
import java.util.function.Predicate
import java.util.stream.Collectors

/**
 * API endpoints for player actions in the game.
 */
@RequestMapping("/api/players/{playerKey}")
@RestController
class PlayerController(private val playerService: PlayerService) {
    @ModelAttribute
    fun addPlayer(@PathVariable playerKey: String): Player {
        return playerService.findPlayer(playerKey)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid player key: $playerKey")
    }

    @GetMapping("/rules")
    fun findAllAccessibleRules(@ModelAttribute player: Player): List<RuleView> {
        val rules: List<RuleWithAccess> = playerService.findAllAccessibleRules(player)
        return rules.map { RuleView(it) }
    }

    @PostMapping("/rules/{ruleNumber}/share")
    fun shareRule(
            @ModelAttribute player: Player,
            @PathVariable ruleNumber: Int,
            @RequestBody request: ShareRuleRequest
    ): ShareRuleResult {
        val rules: List<RuleWithAccess> = playerService.findAllAccessibleRules(player)
        val rule = rules.find { it.rule.ruleNumber == ruleNumber && it.accessType == RuleAccess.Type.ASSIGNED}
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rule $ruleNumber is not assigned to you")
        val targetPlayer: Player = playerService.findPlayer(request.playerKey)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Player " + request.playerKey + " does not exist")
        val success = playerService.shareRule(player, targetPlayer, rule.rule)
        return ShareRuleResult(success)
    }

    data class ShareRuleRequest(val playerKey: String)
    data class ShareRuleResult(val success: Boolean)
}