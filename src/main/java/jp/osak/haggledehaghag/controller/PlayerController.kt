package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.model.RuleWithAccess
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.service.PlayerService
import jp.osak.haggledehaghag.service.TokenService
import jp.osak.haggledehaghag.viewmodel.ForeignPlayerView
import jp.osak.haggledehaghag.viewmodel.FullPlayerInfoView
import jp.osak.haggledehaghag.viewmodel.RuleView
import jp.osak.haggledehaghag.viewmodel.TokenView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

/**
 * API endpoints for player actions in the game.
 */
@RequestMapping("/api/players/{playerKey}")
@RestController
class PlayerController(
    private val gameService: GameService,
    private val playerService: PlayerService,
    private val tokenService: TokenService,
) {
    @ModelAttribute
    fun addPlayer(@PathVariable playerKey: String): Player {
        return playerService.findPlayer(playerKey)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid player key: $playerKey")
    }

    @GetMapping
    fun listFullPlayerInfo(@ModelAttribute player: Player): FullPlayerInfoView {
        val game = gameService.findGame(player.gameId)
            ?: throw IllegalStateException("Cannot find current game for player ${player.id}: DB corrupted?")
        val players = gameService.listPlayers(game)
            .filter { it.id != player.id }
            .map { ForeignPlayerView(it) }
        val rules = playerService.findAllAccessibleRules(player)
            .sortedBy { it.rule.ruleNumber }
            .map { RuleView(it) }
        val tokens = playerService.findAllTokens(player)
            .sortedBy { it.token.id }
            .map { TokenView(it) }

        return FullPlayerInfoView(
            gameTitle = game.title,
            player = player,
            players = players,
            rules = rules,
            tokens = tokens,
        )
    }

    @GetMapping("/rules")
    fun findAllAccessibleRules(@ModelAttribute player: Player): List<RuleView> {
        val rules: List<RuleWithAccess> = playerService.findAllAccessibleRules(player)
        return rules.map { RuleView(it) }
    }

    @GetMapping("/tokens")
    fun listTokens(@ModelAttribute player: Player): List<TokenView> {
        return playerService.findAllTokens(player).map { TokenView(it) }
    }

    @PostMapping("/tokens/{tokenId}/give")
    fun giveToken(
        @ModelAttribute player: Player,
        @PathVariable tokenId: Int,
        @RequestBody request: GiveTokenRequest
    ): GiveTokenResponse {
        val targetPlayer = playerService.findPlayer(request.playerId)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Player ${request.playerId} doesn't belong to the same game")
        val token = playerService.findToken(player, tokenId)?.token
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Token $tokenId does not belong to the player")
        playerService.giveToken(player, targetPlayer, token, request.amount)
        return GiveTokenResponse(true)
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
    data class GiveTokenRequest(val playerId: Int, val amount: Int)
    data class GiveTokenResponse(val success: Boolean)
}
