package jp.osak.haggledehaghag.controller;

import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {
    private final RuleRepository ruleRepository;

    @Autowired
    public TestController(final RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @RequestMapping(method = RequestMethod.GET)
    public TestResponse test() {
        return new TestResponse("Hello world!");
    }

    @GetMapping("rules")
    public List<Rule> getRules() {
        final ArrayList<Rule> result = new ArrayList<>();
        for (var rule : ruleRepository.findAll()) {
            result.add(rule);
        }
        return result;
    }


    public record TestResponse(String message) {}
}
