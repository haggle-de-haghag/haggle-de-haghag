package jp.osak.haggledehaghag.viewmodel;

import jp.osak.haggledehaghag.model.Player;

public record PlayerView(
        String displayName,
        String playerKey
) {
    public static PlayerView of(final Player player) {
        return new PlayerView(player.displayName(), player.playerKey());
    }
}
