package com.spring.restaurantmanagementsystem.controller;

import com.spring.restaurantmanagementsystem.dto.LoginRequest;
import com.spring.restaurantmanagementsystem.dto.LoginResponse;
import com.spring.restaurantmanagementsystem.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.DefaultCsrfToken;

import jakarta.servlet.http.Cookie;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthController authController;

    private MockHttpServletResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockResponse = new MockHttpServletResponse();
        // Clear the SecurityContext before each test
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should return a token in an HttpOnly cookie and a CSRF token on successful login")
    void login_SuccessfulAuthentication_ReturnsCookieAndCsrfToken() {
        // Arrange
        String username = "testuser";
        String password = "password123";
        String jwtToken = "mock.jwt.token";
        String csrfTokenValue = "mockCsrfTokenValue";
        LoginRequest loginRequest = new LoginRequest(username, password);
        UserDetails userDetails = new User(username, password, Collections.emptyList());

        // Mock Authentication object
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        // Mock dependencies
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtService.generateToken(username)).thenReturn(jwtToken);
        when(jwtService.getJwtExpiration()).thenReturn(3600000L); // 1 hour in ms

        // Create a mock CsrfToken object
        CsrfToken csrfToken = new DefaultCsrfToken("X-CSRF-TOKEN", "_csrf", csrfTokenValue);

        // Act
        ResponseEntity<LoginResponse> responseEntity = authController.login(loginRequest, mockResponse, csrfToken);

        // Assert
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(username, responseEntity.getBody().username());
        assertEquals("Login successful", responseEntity.getBody().message());
        assertEquals(csrfTokenValue, responseEntity.getBody().csrfToken());

        // Assert that the response contains an HttpOnly cookie
        Cookie cookie = mockResponse.getCookie("jwtToken");
        assertNotNull(cookie);
        assertEquals(jwtToken, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure()); // Ensure secure flag is set for production

        // Verify that authenticationManager.authenticate was called
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        // Verify that jwtService.generateToken was called
        verify(jwtService).generateToken(username);

        // Verify that SecurityContextHolder was updated
        Authentication securityContextAuth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(securityContextAuth, "SecurityContextHolder authentication should not be null");
        assertEquals(authentication, securityContextAuth, "SecurityContextHolder should contain the authenticated object");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login")
    void login_InvalidCredentials_ThrowsException() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("wronguser", "wrongpass");

        // Mock authenticationManager to throw an exception
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid username or password"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () ->
                authController.login(loginRequest, mockResponse, null)
        );

        // Verify that authenticationManager.authenticate was called
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        // SecurityContextHolder should NOT be updated in this case
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        // No cookie should be set
        assertNull(mockResponse.getCookie("jwtToken"));
    }
}
