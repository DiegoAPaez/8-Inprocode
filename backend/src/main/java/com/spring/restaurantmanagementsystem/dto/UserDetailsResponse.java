package com.spring.restaurantmanagementsystem.dto;

import java.util.List;

public record UserDetailsResponse(Long id,
                                  String username,
                                  String email,
                                  List<String> roles) {
}
