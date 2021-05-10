package jp.osak.haggledehaghag.viewmodel

import jp.osak.haggledehaghag.model.TokenWithAmount

data class TokenView(
    val id: Int, // token id
    val title: String,
    val text: String,
    val amount: Int,
) {
    constructor(t: TokenWithAmount) : this(t.token.id, t.token.title, t.token.text, t.amount)
}
