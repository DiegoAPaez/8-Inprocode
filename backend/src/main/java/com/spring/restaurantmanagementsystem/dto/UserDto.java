package com.spring.restaurantmanagementsystem.dto;

import java.util.Set;

public record UserDto(
        Long id,
        String username,
        String email,
        Set<String> roles
) {}