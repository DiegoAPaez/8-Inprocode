package com.spring.restaurantmanagementsystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.restaurantmanagementsystem.dto.CreateUserRequest;
import com.spring.restaurantmanagementsystem.dto.UpdateUserRequest;
import com.spring.restaurantmanagementsystem.dto.UserDto;
import com.spring.restaurantmanagementsystem.exception.ResourceNotFoundException; // Import your custom exception
import com.spring.restaurantmanagementsystem.security.JwtService;
import com.spring.restaurantmanagementsystem.security.UserDetailsServiceImpl;
import com.spring.restaurantmanagementsystem.service.AdminService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the AdminController.
 * Uses @WebMvcTest to focus on Spring MVC components,
 * and mocks service layer dependencies.
 */
@WebMvcTest(
        controllers = AdminController.class, // Specify the controller to test
        excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class
)
@Import(AdminControllerTest.GlobalExceptionHandler.class) // Import the static nested exception handler
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc; // Used to perform HTTP requests

    @Autowired
    private ObjectMapper objectMapper; // Used to convert objects to JSON

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private JwtService jwtService; // Mocked because it's part of the security context setup

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService; // Mocked for security context setup

    /**
     * Test case for retrieving all users.
     * Verifies that the GET /api/admin/users endpoint returns a list of users.
     */
    @Test
    @WithMockUser(roles = "ADMIN") // Simulate an authenticated user with ADMIN role
    @DisplayName("Should return a list of users when getAllUsers is called")
    void getAllUsers_ShouldReturnListOfUsers() throws Exception {
        // Arrange
        UserDto user1 = new UserDto(1L, "admin", "admin@mail.com", Set.of("ADMIN"));
        UserDto user2 = new UserDto(2L, "user", "user@mail.com", Set.of("WAITER"));
        List<UserDto> userList = List.of(user1, user2);

        // Configure mock behavior: when adminService.getAllUsers() is called, return our list
        when(adminService.getAllUsers()).thenReturn(userList);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users") // Perform a GET request to the endpoint
                        .contentType(MediaType.APPLICATION_JSON)) // Set content type
                .andExpect(status().isOk()) // Expect HTTP 200 OK status
                .andExpect(jsonPath("$.size()").value(2)) // Expect two users in the response array
                .andExpect(jsonPath("$[0].username").value("admin")) // Verify username of the first user
                .andExpect(jsonPath("$[1].username").value("user")); // Verify username of the second user

        // Verify that adminService.getAllUsers() was called exactly once
        verify(adminService, times(1)).getAllUsers();
    }

    /**
     * Test case for creating a new user.
     * Verifies that the POST /api/admin/users endpoint successfully creates a user.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should create a user and return CREATED status on valid request")
    void createUser_ShouldCreateAndReturnUserDto() throws Exception {
        // Arrange
        CreateUserRequest request = new CreateUserRequest("newUser", "new@user.com", "password123", "WAITER");
        UserDto createdUserDto = new UserDto(3L, "newUser", "new@user.com", Set.of("WAITER"));

        // Configure mock behavior: when adminService.createUser is called with any CreateUserRequest, return our DTO
        when(adminService.createUser(any(CreateUserRequest.class))).thenReturn(createdUserDto);

        // Act & Assert
        mockMvc.perform(post("/api/admin/users") // Perform a POST request
                        .contentType(MediaType.APPLICATION_JSON) // Set content type to JSON
                        .content(objectMapper.writeValueAsString(request)) // Set request body as JSON string
                        .with(csrf())) // Add CSRF token for POST request
                .andExpect(status().isCreated()) // Expect HTTP 201 Created status
                .andExpect(jsonPath("$.username").value("newUser")) // Verify username in response
                .andExpect(jsonPath("$.email").value("new@user.com")) // Verify email in response
                .andExpect(jsonPath("$.roles[0]").value("WAITER")); // Verify role in response

        // Verify that adminService.createUser was called exactly once with any CreateUserRequest
        verify(adminService, times(1)).createUser(any(CreateUserRequest.class));
    }

    /**
     * Test case for updating an existing user.
     * Verifies that the PUT /api/admin/users/{id} endpoint successfully updates a user.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should update a user and return OK status on valid request")
    void updateUser_ShouldUpdateAndReturnUserDto() throws Exception {
        // Arrange
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest("updatedUser", "updated@user.com", "ADMIN");
        UserDto updatedUserDto = new UserDto(userId, "updatedUser", "updated@user.com", Set.of("ADMIN"));

        // Configure mock behavior: when adminService.updateUser is called with specific ID and any UpdateUserRequest, return our DTO
        when(adminService.updateUser(eq(userId), any(UpdateUserRequest.class))).thenReturn(updatedUserDto);

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/{id}", userId) // Perform a PUT request to the specific ID
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf())) // Add CSRF token for PUT request
                .andExpect(status().isOk()) // Expect HTTP 200 OK status
                .andExpect(jsonPath("$.username").value("updatedUser")) // Verify updated username
                .andExpect(jsonPath("$.email").value("updated@user.com")) // Verify updated email
                .andExpect(jsonPath("$.roles[0]").value("ADMIN")); // Verify updated role

        // Verify that adminService.updateUser was called exactly once with the correct ID and any UpdateUserRequest
        verify(adminService, times(1)).updateUser(eq(userId), any(UpdateUserRequest.class));
    }

    /**
     * Test case for deleting an existing user.
     * Verifies that the DELETE /api/admin/users/{id} endpoint successfully deletes a user.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should delete a user and return No Content status on valid request")
    void deleteUser_ShouldDeleteUser() throws Exception {
        // Arrange
        Long userId = 1L;

        // Configure mock behavior: when adminService.deleteUser is called with the specific ID, do nothing (simulate success)
        doNothing().when(adminService).deleteUser(userId);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/users/{id}", userId) // Perform a DELETE request
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())) // Add CSRF token for DELETE request
                .andExpect(status().isNoContent()); // Expect HTTP 204 No Content status

        // Verify that adminService.deleteUser was called exactly once with the correct ID
        verify(adminService, times(1)).deleteUser(userId);
    }

    /**
     * Test case for deleting a non-existent user.
     * Verifies that the DELETE /api/admin/users/{id} endpoint returns a 404 Not Found
     * when the user does not exist.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should return Not Found status when deleting a non-existent user")
    void deleteUser_NotFound_ShouldReturnNotFound() throws Exception {
        // Arrange
        Long userId = 99L; // A non-existent user ID
        // Configure mock behavior to throw an exception when user is not found
        doThrow(new ResourceNotFoundException("User not found")) // Use your custom exception
                .when(adminService).deleteUser(userId);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())) // Add CSRF token for DELETE request
                .andExpect(status().isNotFound()); // Expect HTTP 404 Not Found status

        // Verify that adminService.deleteUser was called exactly once
        verify(adminService, times(1)).deleteUser(userId);
    }

    /**
     * Inner static class to simulate a global exception handler for ResourceNotFoundException.
     * This is necessary in @WebMvcTest to ensure custom exceptions are mapped to the correct
     * HTTP status codes, as the full Spring context with global @ControllerAdvice beans
     * might not be loaded.
     */
    @ControllerAdvice
    static class GlobalExceptionHandler {
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<String> handleResourceNotFoundException(ResourceNotFoundException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // --- Additional considerations for AdminControllerTest ---
    // You might want to add tests for:
    // - Validation errors (e.g., creating a user with invalid email format)
    // - Unauthorized access (e.g., trying to access admin endpoints without ADMIN role)
    // - Conflict scenarios (e.g., creating a user with an existing username/email)
}
