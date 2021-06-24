package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.Game
import jp.osak.haggledehaghag.model.Player
import jp.osak.haggledehaghag.model.PlayerToken
import jp.osak.haggledehaghag.model.Rule
import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.model.Token
import jp.osak.haggledehaghag.service.GameService
import jp.osak.haggledehaghag.service.PlayerService
import jp.osak.haggledehaghag.service.RuleService
import jp.osak.haggledehaghag.service.TokenService
import jp.osak.haggledehaghag.util.Either
import jp.osak.haggledehaghag.util.toMultiMap
import jp.osak.haggledehaghag.viewmodel.FullGameInfoView
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RequestMapping("/api/game_master/{masterKey}")
@RestController
class GameMasterController(
    private val gameService: GameService,
    private val ruleService: RuleService,
    private val playerService: PlayerService,
    private val tokenService: TokenService,
) {
    @ModelAttribute
    fun addGame(@PathVariable masterKey: String): Game {
        return gameService.findGameForMasterKey(masterKey)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid game master key: $masterKey")
    }

    @GetMapping
    fun listFullGameInfo(@ModelAttribute game: Game): FullGameInfoView {
        val players = gameService.listPlayers(game).sortedBy { it.id }
        val rules = gameService.listRules(game).sortedBy { it.ruleNumber }
        val ruleAccesses = gameService.listRuleAccesses(game)
        val ruleAccessMap = ruleAccesses.map { Pair(it.ruleId, FullGameInfoView.PlayerIdWithAccess(it.playerId, it.type)) }.toMultiMap()
        val tokens = gameService.listTokens(game).sortedBy { it.id }
        val tokenAllocationMap = gameService.listPlayerTokens(game)
            .map { Pair(it.tokenId, FullGameInfoView.PlayerIdWithAmount(it.playerId, it.amount)) }
            .toMultiMap()
        return FullGameInfoView(game, rules, players, ruleAccessMap, tokens, tokenAllocationMap)
    }

    @PostMapping("/title")
    fun updateTitle(@ModelAttribute game: Game, @RequestBody request: UpdateTitleRequest): Game {
        return gameService.updateTitle(game, request.title)
    }

    @GetMapping("/rules")
    fun listRules(
        @ModelAttribute game: Game
    ): List<Rule> {
        return gameService.listRules(game).sortedBy { it.ruleNumber }
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
        return ruleService.updateRule(rule, request.title, request.text, request.assignedPlayerIds)
    }

    @DeleteMapping("/rules/{ruleId}")
    fun deleteRule(
        @ModelAttribute game: Game,
        @PathVariable ruleId: Int,
    ): DeleteRuleResponse {
        gameService.deleteRule(game, ruleId)
        return DeleteRuleResponse(true)
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

    @PostMapping("/rules/{ruleId}/move")
    fun moveRule(
        @ModelAttribute game: Game,
        @PathVariable ruleId: Int,
        @RequestBody request: MoveRuleRequest
    ): List<Rule> {
        gameService.moveRuleTo(game, ruleId, request.to)
        return gameService.listRules(game).sortedBy { it.ruleNumber }
    }

    @GetMapping("/tokens")
    fun listTokens(
        @ModelAttribute game: Game
    ): List<Token> {
        return gameService.listTokens(game)
    }

    @PostMapping("/tokens")
    fun createToken(
        @ModelAttribute game: Game,
        @RequestBody request: CreateTokenRequest,
    ): Token {
        return gameService.createNewToken(game, request.title, request.text)
    }

    @PatchMapping("/tokens/{tokenId}")
    fun updateToken(
        @ModelAttribute game: Game,
        @PathVariable tokenId: Int,
        @RequestBody request: UpdateTokenRequest,
    ): UpdateTokenResponse {
        val token = tokenService.findToken(tokenId)
        if (token == null || token.gameId != game.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Token $tokenId does not belong to the game ${game.id}")
        }

        val updatedToken = tokenService.updateToken(token, request.title, request.text)
        val playerTokens = playerService.bulkSetTokenAmounts(request.allocation, updatedToken)
        return UpdateTokenResponse(updatedToken, playerTokens)
    }

    @DeleteMapping("/tokens/{tokenId}")
    fun deleteToken(
        @ModelAttribute game: Game,
        @PathVariable tokenId: Int
    ): DeleteTokenResponse {
        val token = gameService.findToken(game, tokenId)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Token $tokenId does not belong to the game ${game.id}")
        tokenService.deleteToken(token)
        return DeleteTokenResponse(true)
    }

    @GetMapping("/players")
    fun listPlayers(
        @ModelAttribute game: Game,
    ): List<Player> {
        return gameService.listPlayers(game)
    }

    @PostMapping("/players/{playerId}/tokens/{tokenId}/add")
    fun addTokenToPlayer(
        @ModelAttribute game: Game,
        @PathVariable playerId: Int,
        @PathVariable tokenId: Int,
        @RequestBody request: AddTokenToPlayerRequest,
    ): AddTokenToPlayerResponse {
        val player = gameService.findPlayer(game, playerId)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Player $playerId does not belong to the game ${game.id}")
        val token = gameService.findToken(game, tokenId)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Token $tokenId does not belong to the game ${game.id}")
        val playerToken = playerService.addToken(player, token, request.amount)
        return AddTokenToPlayerResponse(playerToken.amount)
    }

    data class UpdateTitleRequest(val title: String)
    data class CreateRuleRequest(val title: String, val text: String)
    data class UpdateRuleRequest(val title: String?, val text: String?, val assignedPlayerIds: List<Int>)
    data class DeleteRuleResponse(val success: Boolean)
    data class AssignRuleRequest(val playerId: Int)
    data class MoveRuleRequest(val to: Int)
    data class CreateTokenRequest(val title: String, val text: String)

    /**
     * @property allocation map from playerId to the number of the tokens that player will own
     */
    data class UpdateTokenRequest(val tokenId: Int, val title: String?, val text: String?, val allocation: Map<Int, Int>)
    data class UpdateTokenResponse(val token: Token, val playerTokens: List<PlayerToken>)
    data class DeleteTokenResponse(val success: Boolean)
    data class AddTokenToPlayerRequest(val amount: Int)
    data class AddTokenToPlayerResponse(val newAmount: Int)
}
