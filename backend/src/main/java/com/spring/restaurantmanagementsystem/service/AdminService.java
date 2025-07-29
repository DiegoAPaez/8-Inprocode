package com.spring.restaurantmanagementsystem.service;

import com.spring.restaurantmanagementsystem.dto.CreateUserRequest;
import com.spring.restaurantmanagementsystem.dto.UpdateUserRequest;
import com.spring.restaurantmanagementsystem.dto.UserDto;
import com.spring.restaurantmanagementsystem.exception.ResourceNotFoundException;
import com.spring.restaurantmanagementsystem.model.Role;
import com.spring.restaurantmanagementsystem.model.RoleEnum;
import com.spring.restaurantmanagementsystem.model.User;
import com.spring.restaurantmanagementsystem.repository.RoleRepository;
import com.spring.restaurantmanagementsystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import static java.util.stream.Collectors.toSet;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
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
        if (request instanceof CreateUserRequest(var username, var email, var password, var role)) {
            validateUniqueUserData(username, email, null);

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRoles(Set.of(getRoleByName(role)));

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
        if (request instanceof UpdateUserRequest(var username, var email, var role)) {
            if (username != null && !username.isBlank()) {
                validateUniqueUserData(username, null, userId);
                user.setUsername(username);
            }

            if (email != null && !email.isBlank()) {
                validateUniqueUserData(null, email, userId);
                user.setEmail(email);
            }

            if (role != null && !role.isBlank()) {
                user.setRoles(Set.of(getRoleByName(role)));
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
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(toSet())
        );
    }
}
