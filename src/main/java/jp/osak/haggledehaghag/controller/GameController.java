package jp.osak.haggledehaghag.controller;

import jp.osak.haggledehaghag.model.Game;
import jp.osak.haggledehaghag.model.Player;
import jp.osak.haggledehaghag.repository.GameRepository;
import jp.osak.haggledehaghag.repository.PlayerRepository;
import jp.osak.haggledehaghag.service.GameService;
import jp.osak.haggledehaghag.viewmodel.GameView;
import jp.osak.haggledehaghag.viewmodel.PlayerView;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RequestMapping("/api/game")
@RestController
public class GameController {
    private final GameRepository gameRepository;
    private final GameService gameService;
    private final PlayerRepository playerRepository;

    public GameController(
            final GameRepository gameRepository,
            final GameService gameService,
            final PlayerRepository playerRepository
    ) {
        this.gameRepository = gameRepository;
        this.gameService = gameService;
        this.playerRepository = playerRepository;
    }

    @PostMapping
    public GameView create(@RequestBody final CreateRequest request) {
        final Game game = new Game(0, request.title());
        final Game createdGame = gameRepository.save(game);
        return GameView.of(createdGame);
    }

    @PostMapping("/join")
    public PlayerView join(@RequestBody final JoinRequest request) {
        final Game game = gameRepository.findById(request.gameId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid game id: " + request.gameId()));
        final Player player = gameService.createNewPlayer(game, request.playerName());
        final Player createdPlayer = playerRepository.save(player);
        return PlayerView.of(createdPlayer);
    }

    record CreateRequest(String title) {}
    record JoinRequest(int gameId, String playerName) {}
}
