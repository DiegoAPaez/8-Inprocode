package com.spring.restaurantmanagementsystem.controller;

import com.spring.restaurantmanagementsystem.dto.LoginRequest;
import com.spring.restaurantmanagementsystem.dto.LoginResponse;
import com.spring.restaurantmanagementsystem.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
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
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails.getUsername());

        ResponseCookie jwtCookie = ResponseCookie.from("jwtToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(jwtService.getJwtExpiration() / 1000)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        String csrfTokenValue = (csrfToken != null) ? csrfToken.getToken() : null;
        LoginResponse loginResponse = new LoginResponse(authentication.getName(), csrfTokenValue,"Login successful");

        return ResponseEntity.ok(loginResponse);
    }
}
