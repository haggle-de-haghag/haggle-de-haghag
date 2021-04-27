package jp.osak.haggledehaghag.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    @RequestMapping(method = RequestMethod.GET)
    public TestResponse test() {
        return new TestResponse("Hello world!");
    }

    public record TestResponse(String message) {}
}
