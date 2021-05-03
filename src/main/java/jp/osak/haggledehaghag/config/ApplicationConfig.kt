package jp.osak.haggledehaghag.config

import org.springframework.context.annotation.Configuration
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories
import org.springframework.transaction.annotation.EnableTransactionManagement

@Configuration
@EnableJdbcRepositories("jp.osak.haggledehaghag.repository")
@EnableTransactionManagement
open class ApplicationConfig