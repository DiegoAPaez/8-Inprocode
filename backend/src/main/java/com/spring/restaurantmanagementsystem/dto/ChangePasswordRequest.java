package com.spring.restaurantmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
//        @NotBlank(message = "Current password is required")
//        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String newPassword,

        @NotBlank(message = "Password confirmation is required")
        String confirmPassword) {
    public boolean isNewPasswordConfirmed() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
