package com.hmi.alarm.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI alarmBoardOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HMI Alarm Acknowledgement Board API")
                        .description("POST /api/auth/login to get JWT, then click Authorize and enter: Bearer <token>")
                        .version("2.0.0")
                        .contact(new Contact().name("HMI Team").email("hmi@company.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
