package com.spring.restaurantmanagementsystem.dto;

public record LoginResponse(String username, String csrfToken, String message) {
}
