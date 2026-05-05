package com.hmi.alarm.auth.controller;

import com.hmi.alarm.auth.dto.*;
import com.hmi.alarm.auth.service.AuthService;
import com.hmi.alarm.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AuthController — /api/auth/**
 * Public:      POST /api/auth/login
 * Public:      POST /api/auth/register
 * Protected:   GET  /api/auth/me
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, Register, User Info")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login — returns JWT access token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(request)));
    }

    @PostMapping("/register")
    @Operation(summary = "Create new account (Admin or Operator)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse resp = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(resp));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<UserInfoDto>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(authentication.getName())));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserInfoDto>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getAllUsers()));
    }
}
