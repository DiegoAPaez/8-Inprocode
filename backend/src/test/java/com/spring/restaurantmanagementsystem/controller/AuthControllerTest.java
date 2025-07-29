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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class) // Enables Mockito annotations for JUnit 5
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Test case for a successful user login.
     * Verifies that:
     * 1. The AuthenticationManager is called with the correct credentials.
     * 2. The SecurityContextHolder is updated with the authenticated Authentication object.
     * 3. The JwtService generates a token for the authenticated user.
     * 4. The returned ResponseEntity contains the correct LoginResponse (token, username, message)
     * and an HTTP 200 OK status.
     */
    @Test
    @DisplayName("Should successfully authenticate and return JWT token on valid login")
    void login_ValidCredentials_ReturnsToken() {
        // GIVEN: Prepare test data and mock behavior
        String username = "testuser";
        String password = "testpassword";
        String jwtToken = "mocked_jwt_token_12345";

        // Create a LoginRequest object for the test
        LoginRequest loginRequest = new LoginRequest(username, password);

        // Create a mock UserDetails object representing the authenticated user
        // The third argument is authorities, which can be an empty list for this test.
        UserDetails userDetails = new User(username, password, Collections.emptyList());

        // Create a mock Authentication object that will be returned by the AuthenticationManager
        // The principal is the UserDetails, and credentials are null after successful authentication.
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, Collections.emptyList());

        // Configure the mock behavior for authenticationManager.authenticate()
        // When authenticate is called with any UsernamePasswordAuthenticationToken, return our mock authentication.
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);

        // Configure the mock behavior for jwtService.generateToken()
        // When generateToken is called with the specific username, return our mock JWT token.
        when(jwtService.generateToken(username)).thenReturn(jwtToken);

        // WHEN: Call the method under test
        ResponseEntity<LoginResponse> responseEntity = authController.login(loginRequest);

        // THEN: Assert the outcomes
        // Verify that the response entity is not null
        assertNotNull(responseEntity, "Response entity should not be null");

        // Verify the HTTP status code is OK (200)
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode(), "HTTP status should be OK");

        // Verify that the response body is not null
        assertNotNull(responseEntity.getBody(), "Response body should not be null");

        // Verify the token in the response body
        assertEquals(jwtToken, responseEntity.getBody().token(), "The returned token should match the mocked JWT token");

        // Verify the username in the response body
        assertEquals(username, responseEntity.getBody().username(), "The returned username should match the test username");

        // Verify the message in the response body
        assertEquals("Login successful", responseEntity.getBody().message(), "The login message should be 'Login successful'");

        // Verify that authenticationManager.authenticate was called exactly once with any UsernamePasswordAuthenticationToken
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        // Verify that jwtService.generateToken was called exactly once with the correct username
        verify(jwtService).generateToken(username);

        // Verify that SecurityContextHolder was updated with the correct Authentication object
        Authentication securityContextAuth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(securityContextAuth, "SecurityContextHolder authentication should not be null");
        assertEquals(authentication, securityContextAuth, "SecurityContextHolder should contain the authenticated object");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login")
    void login_InvalidCredentials_ThrowsException() {
        LoginRequest loginRequest = new LoginRequest("wronguser", "wrongpass");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid username or password"));

        assertThrows(BadCredentialsException.class, () -> authController.login(loginRequest));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        // SecurityContextHolder should NOT be updated in this case
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
