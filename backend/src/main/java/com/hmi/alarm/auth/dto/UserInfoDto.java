package com.hmi.alarm.auth.dto;

import com.hmi.alarm.auth.entity.Role;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserInfoDto {
    private Long          id;
    private String        username;
    private String        email;
    private String        fullName;
    private Role          role;
    private boolean       enabled;
    private LocalDateTime createdAt;
}
