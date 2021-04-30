package jp.osak.haggledehaghag.viewmodel;

import jp.osak.haggledehaghag.model.Game;

public record GameView(
        int id,
        String title
) {
    public static GameView of(final Game game) {
        return new GameView(game.id(), game.title());
    }
}
