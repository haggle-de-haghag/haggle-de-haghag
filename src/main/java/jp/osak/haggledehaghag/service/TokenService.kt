package jp.osak.haggledehaghag.service

import jp.osak.haggledehaghag.model.Token
import jp.osak.haggledehaghag.repository.TokenRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class TokenService (
    private val tokenRepository: TokenRepository,
){
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
}