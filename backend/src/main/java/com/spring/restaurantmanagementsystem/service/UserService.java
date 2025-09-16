package com.spring.restaurantmanagementsystem.service;

import com.spring.restaurantmanagementsystem.model.User;
import com.spring.restaurantmanagementsystem.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}