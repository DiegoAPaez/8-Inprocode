package com.spring.restaurantmanagementsystem.repository;

import com.spring.restaurantmanagementsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsernameAndIdNot(String username, Long id);
    Boolean existsByEmailAndIdNot(String email, Long id);
}
