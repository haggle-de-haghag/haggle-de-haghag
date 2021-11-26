package jp.osak.haggledehaghag.model

import org.springframework.data.annotation.Id

data class RuleAccess(
    @Id val id: Int,
    val ruleId: Int,
    val playerId: Int,
    val type: Type
) {
    enum class Type {
        ASSIGNED,
        SHARED,

        // Intended to be only used in-code to flag the rules that are visible because of post-mortem mode.
        POST_MORTEM,
    }
}
