package jp.osak.haggledehaghag.controller;

import jp.osak.haggledehaghag.model.Player;
import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.service.PlayerService;
import jp.osak.haggledehaghag.service.model.RuleWithAccess;
import jp.osak.haggledehaghag.viewmodel.RuleView;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/player/{playerKey}")
@RestController
public class PlayerController {
    private final PlayerService playerService;

    public PlayerController(final PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping("/rules")
    public List<RuleView> findAllAccessibleRules(@PathVariable final String playerKey) {
        final Player player = playerService.findPlayer(playerKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid player key: " + playerKey));
        final List<RuleWithAccess> rules = playerService.findAllAccessibleRules(player);
        return rules.stream().map(RuleView::of).collect(Collectors.toList());
    }
}
