package jp.osak.haggledehaghag.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
open class CorsConfig : WebMvcConfigurer {
    @Value("\${cors.allowed.origins}")
    lateinit var allowedOrigins: List<String>

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
            .allowedOrigins(*allowedOrigins.toTypedArray())
    }
}
