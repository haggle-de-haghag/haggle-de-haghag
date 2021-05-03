package jp.osak.haggledehaghag.util

fun <K, V> Collection<Pair<K, V>>.toMultiMap(): Map<K, List<V>> {
    val result = mutableMapOf<K, MutableList<V>>()
    for ((k, v) in this) {
        if (k !in result) {
            result[k] = mutableListOf()
        }
        result[k]!!.add(v)
    }
    return result
}