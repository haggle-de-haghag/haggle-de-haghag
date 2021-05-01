package jp.osak.haggledehaghag.repository;

import jp.osak.haggledehaghag.model.Rule;
import jp.osak.haggledehaghag.model.RuleId;
import org.springframework.data.repository.CrudRepository;

import java.util.Collection;
import java.util.List;

public interface RuleRepository extends CrudRepository<Rule, RuleId> {
    List<Rule> findByGameId(int gameId);

    List<Rule> findByGameIdAndIdIn(int gameId, Collection<Integer> ruleIds);
}
