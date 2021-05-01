package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.Game;
import org.springframework.data.repository.CrudRepository;

public interface GameRepository extends CrudRepository<Game, Integer> {
}
