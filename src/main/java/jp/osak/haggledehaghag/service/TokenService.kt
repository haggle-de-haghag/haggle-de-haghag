package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Token
import jp.osak.haggledehaghag.repository.PlayerTokenRepository
import jp.osak.haggledehaghag.repository.TokenRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TokenService(
    private val tokenRepository: TokenRepository,
    private val playerTokenRepository: PlayerTokenRepository,
) {
    fun findToken(tokenId: Int): Token? {
        return tokenRepository.findByIdOrNull(tokenId)
    }

    fun updateToken(token: Token, title: String? = null, text: String? = null): Token {
        val updatedToken = token.copy(
            title = title ?: token.title,
            text = text ?: token.text
        )
        return tokenRepository.save(updatedToken)
    }

    @Transactional
    fun deleteToken(token: Token) {
        tokenRepository.delete(token)
        playerTokenRepository.deleteAllByTokenId(token.id)
    }
}
