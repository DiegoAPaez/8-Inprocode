package com.spring.restaurantmanagementsystem.config;

import com.spring.restaurantmanagementsystem.model.Role;
import com.spring.restaurantmanagementsystem.model.RoleEnum;
import com.spring.restaurantmanagementsystem.model.User;
import com.spring.restaurantmanagementsystem.repository.RoleRepository;
import com.spring.restaurantmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEF_USER}")
    private String defaultUser;
    @Value("${DEF_PASS}")
    private String defaultPassword;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Create roles if they don't exist
        createRoleIfNotFound(RoleEnum.ADMIN);
        createRoleIfNotFound(RoleEnum.CASHIER);
        createRoleIfNotFound(RoleEnum.WAITER);

        // Check if an admin user already exists
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals(RoleEnum.ADMIN)));

        if (!adminExists) {
            Role adminRole = roleRepository.findByName(RoleEnum.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin role is not found."));
            User adminUser = new User();
            adminUser.setUsername(defaultUser);
            adminUser.setEmail("admin@restaurant.com");
            adminUser.setPassword(passwordEncoder.encode(defaultPassword));
            adminUser.setRoles(Set.of(adminRole));

            userRepository.save(adminUser);
        }
    }

    private void createRoleIfNotFound(RoleEnum roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
        }
    }
}