package com.hmi.alarm.auth.dto;

import com.hmi.alarm.auth.entity.Role;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * RegisterRequest — used when a new user creates an account.
 * Password must be at least 6 characters and contain at least one special character.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Pattern(
        regexp = "^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{6,}$",
        message = "Password must contain at least one special character (!@#$%^&*...)"
    )
    private String password;

    @Size(max = 100)
    private String fullName;

    @NotNull(message = "Role is required")
    private Role role;
}
