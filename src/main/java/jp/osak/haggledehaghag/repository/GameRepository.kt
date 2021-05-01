package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Game
import org.springframework.data.repository.CrudRepository

interface GameRepository : CrudRepository<Game, Int>