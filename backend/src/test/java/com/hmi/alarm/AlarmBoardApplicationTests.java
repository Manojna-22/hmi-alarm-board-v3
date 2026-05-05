package com.hmi.alarm;

import com.hmi.alarm.auth.dto.LoginRequest;
import com.hmi.alarm.auth.dto.RegisterRequest;
import com.hmi.alarm.auth.entity.Role;
import com.hmi.alarm.auth.service.AuthService;
import com.hmi.alarm.dto.AcknowledgeRequestDto;
import com.hmi.alarm.dto.AlarmRequestDto;
import com.hmi.alarm.dto.AlarmResponseDto;
import com.hmi.alarm.entity.AlarmState;
import com.hmi.alarm.entity.Severity;
import com.hmi.alarm.service.AlarmService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AlarmBoardApplicationTests {

    @Autowired private AlarmService alarmService;
    @Autowired private AuthService  authService;

    @Test void contextLoads() {
        assertThat(alarmService).isNotNull();
        assertThat(authService).isNotNull();
    }

    @Test
    void registerAndLoginFlow() {
        var reg = RegisterRequest.builder()
                .username("testuser1").email("testuser1@test.com")
                .password("Test@123").fullName("Test User")
                .role(Role.ROLE_OPERATOR).build();
        var regResp = authService.register(reg);
        assertThat(regResp.getAccessToken()).isNotBlank();
        assertThat(regResp.getRole()).isEqualTo(Role.ROLE_OPERATOR);

        var loginResp = authService.login(
                LoginRequest.builder().username("testuser1").password("Test@123").build());
        assertThat(loginResp.getAccessToken()).isNotBlank();
        assertThat(loginResp.getUsername()).isEqualTo("testuser1");
    }

    @Test
    void createAndAcknowledgeAlarm() {
        var dto = alarmService.createAlarm(
                AlarmRequestDto.builder().code("TEST-001").message("Test alarm message")
                               .severity(Severity.HIGH).build());
        assertThat(dto.getState()).isEqualTo(AlarmState.ACTIVE);

        var acked = alarmService.acknowledgeAlarm(dto.getId(),
                AcknowledgeRequestDto.builder().operatorName("Tester").note("ok").build());
        assertThat(acked.getState()).isEqualTo(AlarmState.ACKNOWLEDGED);
    }

    @Test
    void summaryWorks() {
        assertThat(alarmService.getSummary().getTotalAlarms()).isGreaterThanOrEqualTo(0);
    }
}
