package com.spring.restaurantmanagementsystem.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;

public record UpdateUserRequest(
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
        String username,

        @Email(message = "Email should be valid")
        String email,

        String role
) {
}
