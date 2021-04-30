package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.Player;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface PlayerRepository extends CrudRepository<Player, Integer> {
    Optional<Player> findByPlayerKey(String playerKey);
}
