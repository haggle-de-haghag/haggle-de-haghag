package jp.osak.haggledehaghag.repository

import jp.osak.haggledehaghag.model.Token
import org.springframework.data.repository.CrudRepository

interface TokenRepository : CrudRepository<Token, Int> {
    fun findAllByGameId(gameId: Int): List<Token>

    fun findAllByIdIn(tokenIds: Collection<Int>): List<Token>
}
