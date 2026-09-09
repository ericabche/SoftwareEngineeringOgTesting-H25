package no.ostfold.bussapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/route").permitAll()
                .requestMatchers("/api/stops/**").permitAll()
                .requestMatchers("/api/favorites/**").permitAll() // TODO: Add JWT authentication filter
                .requestMatchers("/api/tickets/**").permitAll() // TODO: Add JWT authentication filter
                .requestMatchers("/api/admin/**").permitAll() // TODO: Add admin role check with JWT authentication filter
                .requestMatchers("/api/settings/**").permitAll() // TODO: Add JWT authentication filter
                .requestMatchers("/api/profile/**").permitAll() // TODO: Add JWT authentication filter
                .requestMatchers("/api/realtime/**").permitAll() // TODO: Add JWT authentication filter
                .requestMatchers("/api/payment/**").permitAll() // TODO: Add JWT authentication filter
                .requestMatchers("/api/support/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow specific origins (cannot use * with allowCredentials)
        // For local network access, add your local IP (e.g., "http://192.168.1.100:5173")
        // Find your local IP with: ipconfig (Windows) or ifconfig (Linux/Mac)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://itstud.hiof.no"
            // Add your local network IP here, e.g.:
            // "http://192.168.1.100:5173",
            // "http://10.0.0.100:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
