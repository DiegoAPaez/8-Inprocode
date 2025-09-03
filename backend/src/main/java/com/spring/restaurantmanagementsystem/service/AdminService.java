package com.spring.restaurantmanagementsystem.service;

import com.spring.restaurantmanagementsystem.dto.ChangePasswordRequest;
import com.spring.restaurantmanagementsystem.dto.CreateUserRequest;
import com.spring.restaurantmanagementsystem.dto.StoreDto;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import static java.util.stream.Collectors.toSet;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, RoleRepository roleRepository,
                       StoreRepository storeRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.storeRepository = storeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (request instanceof CreateUserRequest(var username, var email, var password, var role, var storeId)) {
            validateUniqueUserData(username, email, null);

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRoles(Set.of(getRoleByName(role)));

            // Handle store assignment
            if (storeId != null) {
                Store store = storeRepository.findById(storeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
                user.setStore(store);
            }

            User savedUser = userRepository.save(user);
            return convertToDto(savedUser);
        }
        throw new IllegalArgumentException("Invalid request format");
    }

    @Transactional
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Using pattern matching with records
        if (request instanceof UpdateUserRequest(var username, var email, var role, var storeId)) {
            if (username != null && !username.isBlank()) {
                validateUniqueUserData(username, null, userId);
                user.setUsername(username);
            }

            if (email != null && !email.isBlank()) {
                validateUniqueUserData(null, email, userId);
                user.setEmail(email);
            }

            if (role != null && !role.isBlank()) {
                Set<Role> roles = new HashSet<>();
                roles.add(getRoleByName(role));
                user.setRoles(roles);
            }

            // Handle store assignment update
            if (storeId != null) {
                if (storeId == 0) {
                    // If storeId is 0, remove store assignment
                    user.setStore(null);
                } else {
                    Store store = storeRepository.findById(storeId)
                            .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
                    user.setStore(store);
                }
            }
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public void changeUserPassword(Long userId, ChangePasswordRequest request) {
        // Validate password confirmation
        if (!request.isNewPasswordConfirmed()) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // For admin changes, we might skip current password validation
        // Or implement current password check if required

        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private void validateUniqueUserData(String username, String email, Long excludeUserId) {
        if (username != null) {
            boolean usernameExists = excludeUserId != null
                    ? userRepository.existsByUsernameAndIdNot(username, excludeUserId)
                    : userRepository.existsByUsername(username);

            if (usernameExists) {
                throw new IllegalArgumentException("Error: Username is already taken!");
            }
        }

        if (email != null) {
            boolean emailExists = excludeUserId != null
                    ? userRepository.existsByEmailAndIdNot(email, excludeUserId)
                    : userRepository.existsByEmail(email);

            if (emailExists) {
                throw new IllegalArgumentException("Error: Email is already in use!");
            }
        }
    }

    private Role getRoleByName(String roleName) {
        RoleEnum roleEnum = RoleEnum.valueOf(roleName.toUpperCase());
        return roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
    }

    private UserDto convertToDto(User user) {
        StoreDto storeDto = null;
        if (user.getStore() != null) {
            Store store = user.getStore();
            storeDto = new StoreDto(
                    store.getId(),
                    store.getName(),
                    store.getLatitude(),
                    store.getLongitude()
            );
        }

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(toSet()),
                storeDto
        );
    }
}
