package no.ostfold.bussapp.auth.service;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private String testEmail;
    private String testPassword;
    private String testFullName;
    private String encodedPassword;

    @BeforeEach
    void setUp() {
        testEmail = "test@example.com";
        testPassword = "password123";
        testFullName = "Test User";
        encodedPassword = "$2a$10$encodedPasswordHash";

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail(testEmail);
        testUser.setPasswordHash(encodedPassword);
        testUser.setFullName(testFullName);
        testUser.setIsActive(true);
    }

    @Test
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByEmail(testEmail)).thenReturn(false);
        when(passwordEncoder.encode(testPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        // Act
        boolean result = authService.register(testEmail, testPassword, testFullName);

        // Assert
        assertTrue(result);
        verify(userRepository, times(1)).existsByEmail(testEmail);
        verify(passwordEncoder, times(1)).encode(testPassword);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        // Arrange
        when(userRepository.existsByEmail(testEmail)).thenReturn(true);

        // Act
        boolean result = authService.register(testEmail, testPassword, testFullName);

        // Assert
        assertFalse(result);
        verify(userRepository, times(1)).existsByEmail(testEmail);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, encodedPassword)).thenReturn(true);

        // Act
        boolean result = authService.login(testEmail, testPassword);

        // Assert
        assertTrue(result);
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(passwordEncoder, times(1)).matches(testPassword, encodedPassword);
    }

    @Test
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // Act
        boolean result = authService.login(testEmail, testPassword);

        // Assert
        assertFalse(result);
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testLogin_InactiveUser() {
        // Arrange
        testUser.setIsActive(false);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // Act
        boolean result = authService.login(testEmail, testPassword);

        // Assert
        assertFalse(result);
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testLogin_WrongPassword() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, encodedPassword)).thenReturn(false);

        // Act
        boolean result = authService.login(testEmail, testPassword);

        // Assert
        assertFalse(result);
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(passwordEncoder, times(1)).matches(testPassword, encodedPassword);
    }

    @Test
    void testFindByEmail_Success() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // Act
        User result = authService.findByEmail(testEmail);

        // Assert
        assertNotNull(result);
        assertEquals(testEmail, result.getEmail());
        assertEquals(testFullName, result.getFullName());
        verify(userRepository, times(1)).findByEmail(testEmail);
    }

    @Test
    void testFindByEmail_NotFound() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // Act
        User result = authService.findByEmail(testEmail);

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findByEmail(testEmail);
    }
}

