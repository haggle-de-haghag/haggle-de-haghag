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
        SHARED
    }
}
