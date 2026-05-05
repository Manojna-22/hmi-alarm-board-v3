package com.hmi.alarm.auth.dto;

import com.hmi.alarm.auth.entity.Role;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Long   expiresIn;
    private Long   userId;
    private String username;
    private String email;
    private String fullName;
    private Role   role;
}
