package jp.osak.haggledehaghag.controller

import jp.osak.haggledehaghag.model.RuleAccess
import jp.osak.haggledehaghag.repository.RuleAccessRepository
import jp.osak.haggledehaghag.repository.RuleRepository
import jp.osak.haggledehaghag.model.RuleWithAccess
import jp.osak.haggledehaghag.viewmodel.RuleView
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping

@RequestMapping("/player/{playerId}")
@Controller
class PlayerPageController(
        private val ruleRepository: RuleRepository,
        private val ruleAccessRepository: RuleAccessRepository
) {
    @GetMapping(value = ["/game/{gameId}", "/game/{gameId}/rule/{ruleNumber}"])
    fun index(
            @PathVariable playerId: Int,
            @PathVariable gameId: Int,
            @PathVariable(required = false) ruleNumber: Int?,
            model: Model
    ): String {
        val ruleAccesses: List<RuleAccess> = ruleAccessRepository.findAllByPlayerId(playerId)
        val ruleAccessMap: Map<Int, RuleAccess> = ruleAccesses.map { Pair(it.ruleId, it) }.toMap()
        val ruleIds = ruleAccesses.map { it.id }
        val rules = ruleRepository.findByGameIdAndIdIn(gameId, ruleIds)
        val ruleViews = rules.map { RuleView(RuleWithAccess(it, ruleAccessMap[it.id]!!.type)) }
        model.addAttribute("rules", ruleViews)
        if (ruleNumber != null) {
            ruleViews.find { it.ruleNumber == ruleNumber }
                    ?.let { model.addAttribute("selectedRule", it) }
        }
        return "player"
    }
}