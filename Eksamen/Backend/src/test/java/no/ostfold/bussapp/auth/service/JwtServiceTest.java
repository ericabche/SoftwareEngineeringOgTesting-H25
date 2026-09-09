package no.ostfold.bussapp.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private String testUsername;
    private SecretKey signingKey;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        testUsername = "test@example.com";
        signingKey = Keys.hmacShaKeyFor("mySecretKey12345678901234567890123456789012345678901234567890".getBytes());
    }

    @Test
    void testGenerateToken_Success() {
        // Act
        String token = jwtService.generateToken(testUsername);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts separated by dots
    }

    @Test
    void testGenerateToken_ContainsUsername() {
        // Act
        String token = jwtService.generateToken(testUsername);
        String extractedUsername = jwtService.extractUsername(token);

        // Assert
        assertEquals(testUsername, extractedUsername);
    }

    @Test
    void testExtractUsername_Success() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        String extractedUsername = jwtService.extractUsername(token);

        // Assert
        assertEquals(testUsername, extractedUsername);
    }

    @Test
    void testExtractExpiration_Success() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        Date expiration = jwtService.extractExpiration(token);

        // Assert
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void testIsTokenExpired_ValidToken() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        Boolean isExpired = jwtService.isTokenExpired(token);

        // Assert
        assertFalse(isExpired);
    }

    @Test
    void testIsTokenExpired_ExpiredToken() throws Exception {
        // Arrange - Create an expired token manually
        Date pastDate = new Date(System.currentTimeMillis() - TimeUnit.HOURS.toMillis(25));
        String expiredToken = Jwts.builder()
                .setSubject(testUsername)
                .setIssuedAt(new Date(System.currentTimeMillis() - TimeUnit.HOURS.toMillis(25)))
                .setExpiration(pastDate)
                .signWith(signingKey)
                .compact();

        // Act
        Boolean isExpired = jwtService.isTokenExpired(expiredToken);

        // Assert
        assertTrue(isExpired);
    }

    @Test
    void testValidateToken_ValidToken() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        Boolean isValid = jwtService.validateToken(token, testUsername);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testValidateToken_WrongUsername() {
        // Arrange
        String token = jwtService.generateToken(testUsername);
        String wrongUsername = "wrong@example.com";

        // Act
        Boolean isValid = jwtService.validateToken(token, wrongUsername);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testValidateToken_ExpiredToken() throws Exception {
        // Arrange - Create an expired token manually
        Date pastDate = new Date(System.currentTimeMillis() - TimeUnit.HOURS.toMillis(25));
        String expiredToken = Jwts.builder()
                .setSubject(testUsername)
                .setIssuedAt(new Date(System.currentTimeMillis() - TimeUnit.HOURS.toMillis(25)))
                .setExpiration(pastDate)
                .signWith(signingKey)
                .compact();

        // Act
        Boolean isValid = jwtService.validateToken(expiredToken, testUsername);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testValidateToken_NullToken() {
        // Act
        Boolean isValid = jwtService.validateToken(null, testUsername);

        // Assert - null token should be invalid
        assertFalse(isValid);
    }

    @Test
    void testValidateToken_InvalidTokenFormat() {
        // Arrange
        String invalidToken = "invalid.token.format";

        // Act
        Boolean isValid = jwtService.validateToken(invalidToken, testUsername);

        // Assert - invalid token format should be invalid
        assertFalse(isValid);
    }

    @Test
    void testTokenExpirationTime_Is24Hours() {
        // Arrange
        String token = jwtService.generateToken(testUsername);
        Date expiration = jwtService.extractExpiration(token);
        Date now = new Date();
        long diffInMillis = expiration.getTime() - now.getTime();
        long diffInHours = TimeUnit.MILLISECONDS.toHours(diffInMillis);

        // Assert - Token should expire in approximately 24 hours (allow 1 hour tolerance)
        assertTrue(diffInHours >= 23 && diffInHours <= 24, 
            "Token should expire in approximately 24 hours, but was " + diffInHours + " hours");
    }

    @Test
    void testExtractClaim_Success() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        String subject = jwtService.extractClaim(token, Claims::getSubject);

        // Assert
        assertEquals(testUsername, subject);
    }
}

