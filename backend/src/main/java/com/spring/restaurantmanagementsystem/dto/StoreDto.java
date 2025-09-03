package com.spring.restaurantmanagementsystem.dto;

public record StoreDto(
    Long id,
    String name,
    Double latitude,
    Double longitude
) {}
