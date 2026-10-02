package es.rdm.Dimofy.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import es.rdm.Dimofy.security.JwtRequestFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authProvider,
            JwtRequestFilter jwtRequestFilter
    ) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
            	    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    .requestMatchers("/assets/**", "/uploads/**").permitAll()

            	    .requestMatchers(HttpMethod.POST, "/app/login", "/app/usuarios").permitAll()

            	    .requestMatchers(HttpMethod.GET,
            	        "/app/album/buscar",
            	        "/app/albums/buscar/paginado",
            	        "/app/albums/total",
            	        "/app/albums/genero/**",
            	        "/app/generos",
            	        "/app/generos/total",
            	        "/app/generos/nombre/**",
            	        "/app/listas/canciones",
            	        "/app/listas/cancionesE",
            	        "/app/canciones/buscar",
            	        "/app/artistas/buscar",
            	        "/app/artistas/**",
            	        "/uploads/**"         	        
            	    ).permitAll()

            	    .requestMatchers(HttpMethod.POST,
            	        "/app/albums/crear",
            	        "/app/albums/editar/**",
            	        "/app/canciones/crear",
            	        "/app/artistas/crear",
            	        "/app/artistas/editar/**",
            	        "/app/generos/crear",
            	        "/app/usuarios/admin/editar/**",
            	        "/app/usuarios/editar/**"
            	    ).authenticated()

            	    .requestMatchers(HttpMethod.PUT,
            	        "/app/listas/Editar/**",
            	        "/app/generos/editar/**"
            	    ).authenticated()

            	    .requestMatchers(HttpMethod.DELETE,
            	        "/app/albums/eliminar/**",
            	        "/app/albums/borradoMasivo"
            	    ).authenticated()

            	    .requestMatchers(HttpMethod.GET,
            	        "/app/albums/**",
            	        "/app/usuarios/admin/consultar/**",
            	        "/app/usuarios/consultar/**"
            	    ).authenticated()

            	    .requestMatchers("/app/listas/**").authenticated()
            	    .requestMatchers("/app/playlists/**").authenticated()

            	    .anyRequest().authenticated()
            	)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authProvider)
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:5173")); // o "*"
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}



