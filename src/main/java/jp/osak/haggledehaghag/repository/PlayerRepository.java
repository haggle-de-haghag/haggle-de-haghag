package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.Player;
import org.springframework.data.repository.CrudRepository;

public interface PlayerRepository extends CrudRepository<Player, Integer> {
    Player findByPlayerKey(String playerKey);
}
