package jp.osak.haggledehaghag.controller;

import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleAccess;
import jp.osak.haggledehaghag.model.RuleId;
import jp.osak.haggledehaghag.repository.RuleAccessRepository;
import jp.osak.haggledehaghag.repository.RuleRepository;
import jp.osak.haggledehaghag.viewmodel.RuleView;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@RequestMapping("/player/{playerId}")
@Controller
public class PlayerController {
    private final RuleRepository ruleRepository;
    private final RuleAccessRepository ruleAccessRepository;

    public PlayerController(
            final RuleRepository ruleRepository,
            RuleAccessRepository ruleAccessRepository
    ) {
        this.ruleRepository = ruleRepository;
        this.ruleAccessRepository = ruleAccessRepository;
    }

    @GetMapping({"/game/{gameId}", "/game/{gameId}/rule/{ruleNumber}"})
    public String index(
            @PathVariable final int playerId,
            @PathVariable final int gameId,
            @PathVariable(required = false) final Integer ruleNumber,
            final Model model
    ) {
        final List<RuleAccess> ruleAccesses = ruleAccessRepository.findAllByGameIdAndPlayerId(gameId, playerId);
        Map<Integer, RuleAccess> ruleAccessMap = ruleAccesses.stream()
                .collect(Collectors.toMap(RuleAccess::ruleNumber, Function.identity()));
        final List<Integer> ruleNumbers = ruleAccesses.stream().map(RuleAccess::ruleNumber).collect(Collectors.toList());

        final List<Rule> rules = ruleRepository.findByGameIdAndRuleNumberIn(gameId, ruleNumbers);
        final List<RuleView> ruleViews = rules.stream()
                .map((rule) -> RuleView.create(rule, ruleAccessMap.get(rule.ruleNumber()).type()))
                .collect(Collectors.toList());
        model.addAttribute("rules", ruleViews);
        if (ruleNumber != null) {
            final Optional<RuleView> maybeRuleView = ruleViews.stream()
                    .filter((r) -> r.ruleNumber() == ruleNumber)
                    .findFirst();
            maybeRuleView.ifPresent((ruleView) -> model.addAttribute("selectedRule", ruleView));
        }
        return "player";
    }
}