package com.hmi.alarm.config;

import com.hmi.alarm.auth.service.AppUserDetailsService;
import com.hmi.alarm.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig — defines the complete JWT-based stateless security chain.
 *
 * Public endpoints (no token needed):
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   Swagger UI paths
 *
 * Protected endpoints (JWT required):
 *   Everything else
 *
 * ADMIN-only:
 *   DELETE /api/alarms/**
 *   GET    /api/auth/users
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter          jwtAuthFilter;
    private final JwtAuthEntryPoint      jwtAuthEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final AppUserDetailsService  userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})   // CORS handled by WebConfig
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(jwtAuthEntryPoint)
                    .accessDeniedHandler(jwtAccessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                    // Public — login + register
                    .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                    // Swagger — public
                    .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                     "/v3/api-docs/**", "/v3/api-docs").permitAll()
                    // ADMIN-only: delete alarms and list users
                    .requestMatchers(HttpMethod.DELETE, "/alarms/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.GET,    "/auth/users").hasAuthority("ROLE_ADMIN")
                    // Everything else needs a valid JWT
                    .anyRequest().authenticated())
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
