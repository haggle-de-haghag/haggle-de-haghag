package jp.osak.haggledehaghag

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
open class HaggleDeHaghagApplication {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            SpringApplication.run(HaggleDeHaghagApplication::class.java, *args)
        }
    }
}
