package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.service.PlayerService
import jp.osak.haggledehaghag.service.model.RuleWithAccess
import jp.osak.haggledehaghag.viewmodel.ForeignPlayerView
import jp.osak.haggledehaghag.viewmodel.FullPlayerInfoView
import jp.osak.haggledehaghag.viewmodel.RuleView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

/**
 * API endpoints for player actions in the game.
 */
@RequestMapping("/api/players/{playerKey}")
@RestController
class PlayerController(
        private val gameService: GameService,
        private val playerService: PlayerService
) {
    @ModelAttribute
    fun addPlayer(@PathVariable playerKey: String): Player {
        return playerService.findPlayer(playerKey)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid player key: $playerKey")
    }

    @GetMapping
    fun listFullPlayerInfo(@ModelAttribute player: Player): FullPlayerInfoView {
        val game = gameService.findGame(player.gameId)
                ?: throw IllegalStateException("Cannot find current game for player ${player.id}: DB corrupted?")
        val players = gameService.listPlayers(game).map { ForeignPlayerView(it) }
        val rules = playerService.findAllAccessibleRules(player).map { RuleView(it) }

        return FullPlayerInfoView(
                gameTitle = game.title,
                player = player,
                players = players,
                rules = rules
        )
    }

    @GetMapping("/rules")
    fun findAllAccessibleRules(@ModelAttribute player: Player): List<RuleView> {
        val rules: List<RuleWithAccess> = playerService.findAllAccessibleRules(player)
        return rules.map { RuleView(it) }
    }

    @PostMapping("/rules/{ruleId}/share")
    fun shareRule(
            @ModelAttribute player: Player,
            @PathVariable ruleId: Int,
            @RequestBody request: ShareRuleRequest
    ): ShareRuleResult {
        val rules: List<RuleWithAccess> = playerService.findAllAccessibleRules(player)
        val rule = rules.find { it.rule.id == ruleId && it.accessType == RuleAccess.Type.ASSIGNED }
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rule $ruleId is not assigned to you")
        val targetPlayer: Player = playerService.findPlayer(request.playerId)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Player " + request.playerId + " does not exist")
        val success = playerService.shareRule(player, targetPlayer, rule.rule)
        return ShareRuleResult(success)
    }

    data class ShareRuleRequest(val playerId: Int)
    data class ShareRuleResult(val success: Boolean)
}