package com.spring.restaurantmanagementsystem.service;

import com.spring.restaurantmanagementsystem.dto.CreateUserRequest;
import com.spring.restaurantmanagementsystem.dto.UpdateUserRequest;
import com.spring.restaurantmanagementsystem.dto.UserDto;
import com.spring.restaurantmanagementsystem.exception.ResourceNotFoundException;
import com.spring.restaurantmanagementsystem.model.Role;
import com.spring.restaurantmanagementsystem.model.RoleEnum;
import com.spring.restaurantmanagementsystem.model.Store;
import com.spring.restaurantmanagementsystem.model.User;
import com.spring.restaurantmanagementsystem.repository.RoleRepository;
import com.spring.restaurantmanagementsystem.repository.StoreRepository;
import com.spring.restaurantmanagementsystem.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the AdminService class.
 * This class uses JUnit 5 and Mockito to test the business logic of the AdminService.
 * It mocks repository and encoder dependencies to isolate service logic.
 */
@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    // Helper method to create a mock Role object
    private Role createRole(RoleEnum roleEnum) {
        Role role = new Role();
        role.setName(roleEnum);
        role.setId(roleEnum.ordinal() + 1L); // Assign a simple ID for testing
        return role;
    }

    // Helper method to create a mock User object
    private User createUser(Long id, String username, String email, String password, Set<Role> roles) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setRoles(roles);
        return user;
    }

    // Helper method to create a mock Store object
    private Store createStore(Long id, String name, Double latitude, Double longitude) {
        Store store = new Store();
        store.setId(id);
        store.setName(name);
        store.setLatitude(latitude);
        store.setLongitude(longitude);
        return store;
    }

    /**
     * Test case for `getAllUsers` method.
     * Verifies that the service returns a list of all users as DTOs.
     */
    @Test
    @DisplayName("Should return a list of all users")
    void getAllUsers_ShouldReturnListOfUsers() {
        // Arrange
        Role adminRole = createRole(RoleEnum.ADMIN);
        Role waiterRole = createRole(RoleEnum.WAITER);

        User user1 = createUser(1L, "adminUser", "admin@example.com", "encodedPass1", Set.of(adminRole));
        User user2 = createUser(2L, "waiterUser", "waiter@example.com", "encodedPass2", Set.of(waiterRole));

        // Mock userRepository to return a list of users
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        // Act
        List<UserDto> result = adminService.getAllUsers();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("adminUser", result.get(0).username());
        assertTrue(result.get(0).roles().contains("ADMIN"));
        assertEquals("waiterUser", result.get(1).username());
        assertTrue(result.get(1).roles().contains("WAITER"));

        // Verify that userRepository.findAll() was called
        verify(userRepository, times(1)).findAll();
    }

    /**
     * Test case for `getAllUsers` when no users exist.
     * Verifies that an empty list is returned.
     */
    @Test
    @DisplayName("Should return an empty list when no users exist")
    void getAllUsers_NoUsers_ShouldReturnEmptyList() {
        // Arrange
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<UserDto> result = adminService.getAllUsers();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        // Verify that userRepository.findAll() was called
        verify(userRepository, times(1)).findAll();
    }

    /**
     * Test case for `createUser` method (happy path).
     * Verifies that a new user is created and returned as a DTO.
     */
    @Test
    @DisplayName("Should create and return UserDto on successful user creation")
    void createUser_ShouldCreateAndReturnUserDto() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest("newUser", "new@user.com", "password123", "WAITER", 1L);
        Role userRole = createRole(RoleEnum.WAITER);
        User savedUser = createUser(1L, "newUser", "new@user.com", "encodedPassword", Set.of(userRole));

        // Mock dependencies
        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(roleRepository.findByName(RoleEnum.WAITER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(storeRepository.findById(1L)).thenReturn(Optional.of(createStore(1L, "Test Store", 40.7128, -74.0060)));

        // Act
        UserDto result = adminService.createUser(request);

        // Assert
        assertNotNull(result);
        assertEquals(savedUser.getUsername(), result.username());
        assertEquals(savedUser.getEmail(), result.email());
        assertTrue(result.roles().contains("WAITER"));

        // Verify interactions
        verify(userRepository, times(1)).existsByUsername(request.username());
        verify(userRepository, times(1)).existsByEmail(request.email());
        verify(roleRepository, times(1)).findByName(RoleEnum.WAITER);
        verify(passwordEncoder, times(1)).encode(request.password());
        verify(userRepository, times(1)).save(any(User.class));
    }

    /**
     * Test case for `createUser` when username already exists.
     * Verifies that an `IllegalArgumentException` is thrown.
     */
    @Test
    @DisplayName("Should throw IllegalArgumentException when username already exists during creation")
    void createUser_UsernameExists_ThrowsException() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest("existingUser", "new@user.com", "password123", "WAITER", 1L);

        // Mock userRepository to indicate username exists
        when(userRepository.existsByUsername(request.username())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
                adminService.createUser(request)
        );
        assertEquals("Error: Username is already taken!", thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).existsByUsername(request.username());
        verify(userRepository, never()).existsByEmail(any());
        verify(roleRepository, never()).findByName(any());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Test case for `createUser` when email already exists.
     * Verifies that an `IllegalArgumentException` is thrown.
     */
    @Test
    @DisplayName("Should throw IllegalArgumentException when email already exists during creation")
    void createUser_EmailExists_ThrowsException() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest("newUser", "existing@user.com", "password123", "WAITER", 1L);

        // Mock userRepository to indicate email exists
        when(userRepository.existsByUsername(request.username())).thenReturn(false); // Username is fine
        when(userRepository.existsByEmail(request.email())).thenReturn(true); // Email exists

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
                adminService.createUser(request)
        );
        assertEquals("Error: Email is already in use!", thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).existsByUsername(request.username());
        verify(userRepository, times(1)).existsByEmail(request.email());
        verify(roleRepository, never()).findByName(any());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Test case for `createUser` when the specified role is valid but not found in the repository.
     * Verifies that a `RuntimeException` is thrown.
     */
    @Test
    @DisplayName("Should throw RuntimeException when role is valid but not found in repository during creation")
    void createUser_RoleValidButNotFoundInRepo_ThrowsException() {
        // Arrange
        // Use a valid role name that exists in RoleEnum, but mock its absence in the repository
        CreateUserRequest request = new CreateUserRequest("newUser", "new@user.com", "password123", "WAITER", 1L);

        // Mock dependencies
        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        // Mock roleRepository to return empty Optional for the WAITER role, simulating it not being found in DB
        when(roleRepository.findByName(RoleEnum.WAITER)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException thrown = assertThrows(RuntimeException.class, () ->
                adminService.createUser(request)
        );
        assertEquals("Error: Role is not found.", thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).existsByUsername(request.username());
        verify(userRepository, times(1)).existsByEmail(request.email());
        verify(roleRepository, times(1)).findByName(RoleEnum.WAITER);
        verify(passwordEncoder, times(1)).encode(any());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Test case for `updateUser` method (happy path - update all fields).
     * Verifies that a user's username, email, and role can be updated.
     */
    @Test
    @DisplayName("Should update user and return UserDto on successful update of all fields")
    void updateUser_AllFields_ShouldUpdateAndReturnUserDto() {
        // Arrange
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest("updatedUser", "updated@user.com", "ADMIN", 1L);
        Role originalRole = createRole(RoleEnum.WAITER);
        User existingUser = createUser(userId, "originalUser", "original@user.com", "oldPass", Set.of(originalRole));
        Role newRole = createRole(RoleEnum.ADMIN);
        Store testStore = createStore(1L, "Test Store", 40.7128, -74.0060);
        User updatedUser = createUser(userId, "updatedUser", "updated@user.com", "oldPass", Set.of(newRole));
        updatedUser.setStore(testStore);

        // Mock dependencies
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByUsernameAndIdNot(request.username(), userId)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot(request.email(), userId)).thenReturn(false);
        when(roleRepository.findByName(RoleEnum.ADMIN)).thenReturn(Optional.of(newRole));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
        when(storeRepository.findById(1L)).thenReturn(Optional.of(createStore(1L, "Test Store", 40.7128, -74.0060)));

        // Act
        UserDto result = adminService.updateUser(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.id());
        assertEquals("updatedUser", result.username());
        assertEquals("updated@user.com", result.email());
        assertTrue(result.roles().contains("ADMIN"));

        // Verify interactions
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).existsByUsernameAndIdNot(request.username(), userId);
        verify(userRepository, times(1)).existsByEmailAndIdNot(request.email(), userId);
        verify(roleRepository, times(1)).findByName(RoleEnum.ADMIN);
        verify(userRepository, times(1)).save(existingUser); // Verify save was called with the modified existingUser
    }

    /**
     * Test case for `updateUser` method (partial update - only username).
     * Verifies that only the username is updated.
     */
    @Test
    @DisplayName("Should update only username when other fields are null/blank")
    void updateUser_OnlyUsername_ShouldUpdateUserDto() {
        // Arrange
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest("onlyUsernameUpdated", null, null , null); // Only username
        Role originalRole = createRole(RoleEnum.WAITER);
        User existingUser = createUser(userId, "originalUser", "original@user.com", "oldPass", Set.of(originalRole));
        User updatedUser = createUser(userId, "onlyUsernameUpdated", "original@user.com", "oldPass", Set.of(originalRole));

        // Mock dependencies
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByUsernameAndIdNot(request.username(), userId)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        // Act
        UserDto result = adminService.updateUser(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.id());
        assertEquals("onlyUsernameUpdated", result.username());
        assertEquals("original@user.com", result.email()); // Email should remain unchanged
        assertTrue(result.roles().contains("WAITER")); // Role should remain unchanged

        // Verify interactions
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).existsByUsernameAndIdNot(request.username(), userId);
        verify(userRepository, never()).existsByEmailAndIdNot(any(), any()); // Email check should not be called
        verify(roleRepository, never()).findByName(any()); // Role update should not be called
        verify(userRepository, times(1)).save(existingUser);
    }

    /**
     * Test case for `updateUser` when user is not found.
     * Verifies that a `ResourceNotFoundException` is thrown.
     */
    @Test
    @DisplayName("Should throw ResourceNotFoundException when user to update is not found")
    void updateUser_UserNotFound_ThrowsException() {
        // Arrange
        Long userId = 99L;
        UpdateUserRequest request = new UpdateUserRequest("updatedUser", "updated@user.com", "ADMIN", null);

        // Mock userRepository to return empty Optional (user not found)
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () ->
                adminService.updateUser(userId, request)
        );
        assertEquals("User not found with id: " + userId, thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, never()).existsByUsernameAndIdNot(any(), any());
        verify(userRepository, never()).existsByEmailAndIdNot(any(), any());
        verify(roleRepository, never()).findByName(any());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Test case for `updateUser` when new username conflicts with another user.
     * Verifies that an `IllegalArgumentException` is thrown.
     */
    @Test
    @DisplayName("Should throw IllegalArgumentException when updated username already exists for another user")
    void updateUser_UsernameConflict_ThrowsException() {
        // Arrange
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest("anotherExistingUser", "updated@user.com", "ADMIN", null);
        Role originalRole = createRole(RoleEnum.WAITER);
        User existingUser = createUser(userId, "originalUser", "original@user.com", "oldPass", Set.of(originalRole));

        // Mock dependencies
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        // Simulate username conflict with another user
        when(userRepository.existsByUsernameAndIdNot(request.username(), userId)).thenReturn(true);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
                adminService.updateUser(userId, request)
        );
        assertEquals("Error: Username is already taken!", thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).existsByUsernameAndIdNot(request.username(), userId);
        verify(userRepository, never()).existsByEmailAndIdNot(any(), any());
        verify(roleRepository, never()).findByName(any());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Test case for `updateUser` when new email conflicts with another user.
     * Verifies that an `IllegalArgumentException` is thrown.
     */
    @Test
    @DisplayName("Should throw IllegalArgumentException when updated email already exists for another user")
    void updateUser_EmailConflict_ThrowsException() {
        // Arrange
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest("updatedUser", "anotherExisting@user.com", "ADMIN", null);
        Role originalRole = createRole(RoleEnum.WAITER);
        User existingUser = createUser(userId, "originalUser", "original@user.com", "oldPass", Set.of(originalRole));

        // Mock dependencies
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByUsernameAndIdNot(request.username(), userId)).thenReturn(false); // Username is fine
        // Simulate email conflict with another user
        when(userRepository.existsByEmailAndIdNot(request.email(), userId)).thenReturn(true);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
                adminService.updateUser(userId, request)
        );
        assertEquals("Error: Email is already in use!", thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).existsByUsernameAndIdNot(request.username(), userId);
        verify(userRepository, times(1)).existsByEmailAndIdNot(request.email(), userId);
        verify(roleRepository, never()).findByName(any());
        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Test case for `updateUser` when the specified role for update is valid but not found in the repository.
     * Verifies that a `RuntimeException` is thrown.
     */
    @Test
    @DisplayName("Should throw RuntimeException when role for update is valid but not found in repository")
    void updateUser_RoleValidButNotFoundInRepo_ThrowsException() {
        // Arrange
        Long userId = 1L;
        // Use a valid role name that exists in RoleEnum, but mock its absence in the repository
        UpdateUserRequest request = new UpdateUserRequest("updatedUser", "updated@user.com", "ADMIN", null);
        Role originalRole = createRole(RoleEnum.WAITER);
        User existingUser = createUser(userId, "originalUser", "original@user.com", "oldPass", Set.of(originalRole));

        // Mock dependencies
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByUsernameAndIdNot(request.username(), userId)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot(request.email(), userId)).thenReturn(false);
        // Mock roleRepository to return empty Optional for the ADMIN role, simulating it not being found in DB
        when(roleRepository.findByName(RoleEnum.ADMIN)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException thrown = assertThrows(RuntimeException.class, () ->
                adminService.updateUser(userId, request)
        );
        assertEquals("Error: Role is not found.", thrown.getMessage());

        // Verify interactions: save should not be called
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).existsByUsernameAndIdNot(request.username(), userId);
        verify(userRepository, times(1)).existsByEmailAndIdNot(request.email(), userId);
        verify(roleRepository, times(1)).findByName(RoleEnum.ADMIN); // Verify call with actual enum
        verify(userRepository, never()).save(any(User.class));
    }


    /**
     * Test case for `deleteUser` method (happy path).
     * Verifies that a user is successfully deleted.
     */
    @Test
    @DisplayName("Should delete user on successful deletion")
    void deleteUser_ShouldDeleteUser() {
        // Arrange
        Long userId = 1L;

        // Mock userRepository to indicate user exists
        when(userRepository.existsById(userId)).thenReturn(true);
        // Mock deleteById to do nothing (simulate successful deletion)
        doNothing().when(userRepository).deleteById(userId);

        // Act
        adminService.deleteUser(userId);

        // Assert
        // Verify that existsById was checked and deleteById was called
        verify(userRepository, times(1)).existsById(userId);
        verify(userRepository, times(1)).deleteById(userId);
    }

    /**
     * Test case for `deleteUser` when user is not found.
     * Verifies that a `ResourceNotFoundException` is thrown.
     */
    @Test
    @DisplayName("Should throw ResourceNotFoundException when user to delete is not found")
    void deleteUser_UserNotFound_ThrowsException() {
        // Arrange
        Long userId = 99L;

        // Mock userRepository to indicate user does not exist
        when(userRepository.existsById(userId)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () ->
                adminService.deleteUser(userId)
        );
        assertEquals("User not found with id: " + userId, thrown.getMessage());

        // Verify interactions: deleteById should not be called
        verify(userRepository, times(1)).existsById(userId);
        verify(userRepository, never()).deleteById(any());
    }
}
