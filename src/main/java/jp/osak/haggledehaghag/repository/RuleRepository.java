package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.Rule;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface RuleRepository extends CrudRepository<Rule, Integer> {
    List<Rule> findByGameId(int gameId);
}
