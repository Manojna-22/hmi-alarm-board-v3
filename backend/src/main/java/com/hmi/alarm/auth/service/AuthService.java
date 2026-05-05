package com.hmi.alarm.auth.service;

import com.hmi.alarm.auth.dto.*;
import com.hmi.alarm.auth.entity.AppUser;
import com.hmi.alarm.auth.repository.AppUserRepository;
import com.hmi.alarm.exception.ResourceNotFoundException;
import com.hmi.alarm.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * AuthService — login, register, and user management logic.
 *
 * ROOT CAUSE of "invalid credentials" that was previously broken:
 *   The fix is using AuthenticationManager.authenticate() which internally
 *   calls loadUserByUsername() and BCrypt.matches() in the correct order.
 *   We never compare passwords manually — Spring Security does it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final AuthenticationManager authManager;
    private final AppUserRepository     userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtTokenProvider      jwtProvider;

    // ===========================
    // LOGIN
    // ===========================

    public AuthResponse login(LoginRequest req) {
        log.info("Login attempt: {}", req.getUsername());

        // This is the CORRECT way — Spring Security handles password check internally
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        AppUser user  = (AppUser) auth.getPrincipal();
        String  token = jwtProvider.generateToken(auth);

        log.info("Login success: {} [{}]", user.getUsername(), user.getRole());
        return buildResponse(user, token);
    }

    // ===========================
    // REGISTER
    // ===========================

    public AuthResponse register(RegisterRequest req) {
        log.info("Register: {}", req.getUsername());

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username '" + req.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email '" + req.getEmail() + "' is already registered");
        }

        AppUser user = AppUser.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))   // BCrypt encode
                .fullName(req.getFullName() != null ? req.getFullName() : req.getUsername())
                .role(req.getRole())
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Generate token immediately so user is logged in after registering
        String token = jwtProvider.generateTokenForUser(user);

        log.info("Registered: {} [{}]", user.getUsername(), user.getRole());
        return buildResponse(user, token);
    }

    // ===========================
    // GET CURRENT USER
    // ===========================

    @Transactional(readOnly = true)
    public UserInfoDto getCurrentUser(String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return toInfoDto(user);
    }

    // ===========================
    // ADMIN: LIST USERS
    // ===========================

    @Transactional(readOnly = true)
    public List<UserInfoDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toInfoDto).toList();
    }

    // ===========================
    // Helpers
    // ===========================

    private AuthResponse buildResponse(AppUser user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtProvider.getExpirationMs())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    private UserInfoDto toInfoDto(AppUser u) {
        return UserInfoDto.builder()
                .id(u.getId()).username(u.getUsername()).email(u.getEmail())
                .fullName(u.getFullName()).role(u.getRole())
                .enabled(u.isEnabled()).createdAt(u.getCreatedAt())
                .build();
    }
}
