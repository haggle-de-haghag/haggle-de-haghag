package jp.osak.haggledehaghag.service;

import jp.osak.haggledehaghag.model.Game;
import jp.osak.haggledehaghag.model.Player;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class GameService {
    public Player createNewPlayer(final Game game, final String displayName) {
        final double salt = Math.random();
        final String keyBase = String.format("%d-%s-%f", game.id(), displayName, salt);
        final String playerKey = String.format("%08x", keyBase.hashCode());
        return new Player(0, game.id(), displayName, playerKey);
    }
}
