package jp.osak.haggledehaghag.controller;

import jp.osak.haggledehaghag.model.Player;
import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleAccess;
import jp.osak.haggledehaghag.service.PlayerService;
import jp.osak.haggledehaghag.service.model.RuleWithAccess;
import jp.osak.haggledehaghag.viewmodel.RuleView;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * API endpoints for player actions in the game.
 */
@RequestMapping("/api/player/{playerKey}")
@RestController
public class PlayerController {
    private final PlayerService playerService;

    public PlayerController(final PlayerService playerService) {
        this.playerService = playerService;
    }

    @ModelAttribute
    public Player addPlayer(@PathVariable final String playerKey) {
        return playerService.findPlayer(playerKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid player key: " + playerKey));
    }

    @GetMapping("/rules")
    public List<RuleView> findAllAccessibleRules(@ModelAttribute final Player player) {
        final List<RuleWithAccess> rules = playerService.findAllAccessibleRules(player);
        return rules.stream().map(RuleView::of).collect(Collectors.toList());
    }

    @PostMapping("/rules/{ruleNumber}/share")
    public ShareRuleResult shareRule(
            @ModelAttribute final Player player,
            @PathVariable final int ruleNumber,
            @RequestBody final ShareRuleRequest request
    ) {
        final List<RuleWithAccess> rules = playerService.findAllAccessibleRules(player);
        final RuleWithAccess rule = rules.stream()
                .filter((r) -> r.rule().ruleNumber() == ruleNumber && r.accessType() == RuleAccess.Type.ASSIGNED)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rule " + ruleNumber + " is not assigned to you"));
        final Player targetPlayer = playerService.findPlayer(request.playerKey())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Player " + request.playerKey() + " does not exist"));
        final boolean success = playerService.shareRule(player, targetPlayer, rule.rule());
        return new ShareRuleResult(success);
    }

    record ShareRuleRequest(String playerKey) {}
    record ShareRuleResult(boolean success) {}
}
