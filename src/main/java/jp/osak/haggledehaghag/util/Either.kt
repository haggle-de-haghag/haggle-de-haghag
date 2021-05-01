package jp.osak.haggledehaghag.util

sealed class Either<T, E> {
    class Ok<T, E>(val data: T) : Either<T, E>()
    class Err<T, E>(val error: E, val cause: Throwable? = null) : Either<T, E>()
}
