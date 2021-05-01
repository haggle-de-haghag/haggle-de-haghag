package jp.osak.haggledehaghag.config

import org.springframework.context.annotation.Configuration
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories

@Configuration
@EnableJdbcRepositories("jp.osak.haggledehaghag.repository")
open class ApplicationConfig