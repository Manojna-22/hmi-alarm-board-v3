package com.hmi.alarm.security;

import com.hmi.alarm.auth.entity.AppUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JwtTokenProvider — creates and validates JWT tokens using JJWT 0.12.6.
 * Compatible with JDK 21 and Maven 3.9.x.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey key() {
        // Pad key to at least 32 bytes for HS256
        byte[] keyBytes = jwtSecret.getBytes();
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            return Keys.hmacShaKeyFor(padded);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Generate token from Spring Security Authentication object (used after login). */
    public String generateToken(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        return generateTokenForUser(user);
    }

    /** Generate token directly from AppUser entity (used after register). */
    public String generateTokenForUser(AppUser user) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId",   user.getId())
                .claim("role",     user.getRole().name())
                .claim("email",    user.getEmail())
                .claim("fullName", user.getFullName() != null ? user.getFullName() : user.getUsername())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e)    { log.warn("JWT expired: {}", e.getMessage()); }
        catch (MalformedJwtException e)    { log.warn("JWT malformed: {}", e.getMessage()); }
        catch (SecurityException e)        { log.warn("JWT signature invalid: {}", e.getMessage()); }
        catch (IllegalArgumentException e) { log.warn("JWT empty: {}", e.getMessage()); }
        return false;
    }

    public long getExpirationMs() { return jwtExpirationMs; }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
