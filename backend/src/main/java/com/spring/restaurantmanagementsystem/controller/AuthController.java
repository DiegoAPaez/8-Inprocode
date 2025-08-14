package com.spring.restaurantmanagementsystem.controller;

import com.spring.restaurantmanagementsystem.dto.LoginRequest;
import com.spring.restaurantmanagementsystem.dto.LoginResponse;
import com.spring.restaurantmanagementsystem.dto.UserDetailsResponse;
import com.spring.restaurantmanagementsystem.model.User;
import com.spring.restaurantmanagementsystem.security.JwtService;
import com.spring.restaurantmanagementsystem.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response, @RequestAttribute(name = "_csrf", required = false) CsrfToken csrfToken) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.username(),
                        loginRequest.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String username = authentication.getName();
        String token = jwtService.generateToken(username);

        ResponseCookie jwtCookie = ResponseCookie.from("jwtToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(jwtService.getJwtExpiration() / 1000)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        String csrfTokenValue = (csrfToken != null) ? csrfToken.getToken() : null;
        LoginResponse loginResponse = new LoginResponse(authentication.getName(), csrfTokenValue,"Login successful");

        return ResponseEntity.ok(loginResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetailsResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Get the username correctly
        String username = authentication.getName();

        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOptional.get();

        // Extract roles from authorities
        List<String> roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .toList();

        UserDetailsResponse response = new UserDetailsResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        // Clear the JWT cookie by setting it with maxAge=0
        ResponseCookie jwtCookie = ResponseCookie.from("jwtToken", "")
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(0) // This clears the cookie
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        // Clear security context
        SecurityContextHolder.clearContext();

        Map<String, String> response_body = new HashMap<>();
        response_body.put("message", "Logout successful");
        return ResponseEntity.ok(response_body);
    }
}
