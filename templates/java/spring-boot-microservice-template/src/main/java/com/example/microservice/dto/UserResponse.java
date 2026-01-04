package com.example.microservice.dto;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    boolean active,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
