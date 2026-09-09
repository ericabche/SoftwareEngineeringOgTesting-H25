package no.ostfold.bussapp.auth.controller;

import no.ostfold.bussapp.auth.dto.AuthResponse;
import no.ostfold.bussapp.auth.dto.LoginRequest;
import no.ostfold.bussapp.auth.dto.RegisterRequest;
import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.service.AuthService;
import no.ostfold.bussapp.auth.service.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Name is required"));
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Password is required"));
        }
        
        // Generate email from name (lowercase, replace spaces with dots, add @example.com)
        String email = req.getName().toLowerCase().replaceAll("\\s+", ".") + "@example.com";
        String fullName = req.getName().trim();
        
        log.info("Registration attempt: name={}, email={}", fullName, email);
        
        boolean ok = authService.register(email, req.getPassword(), fullName);
        if (ok) {
            User user = authService.findByEmail(email);
            String token = jwtService.generateToken(email);
            log.info("User registered successfully: email={}", email);
            return ResponseEntity.ok(new AuthResponse(token, email, "User registered successfully!"));
        } else {
            log.warn("Registration failed: email already exists: {}", email);
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Email already exists"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        // Treat username as email for now (can be changed later)
        String email = req.getUsername().contains("@") ? req.getUsername() : req.getUsername() + "@example.com";
        
        log.info("Login attempt: email={}", email);
        
        try {
            boolean ok = authService.login(email, req.getPassword());
            if (ok) {
                User user = authService.findByEmail(email);
                String token = jwtService.generateToken(email);
                return ResponseEntity.ok(new AuthResponse(token, email, "Login successful"));
            } else {
                log.warn("Login failed for email={}: user not found or password mismatch", email);
                return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Invalid credentials"));
            }
        } catch (Exception e) {
            log.error("Login error for email={}", email, e);
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        // For JWT, logout is handled client-side by removing the token
        // In a more sophisticated setup, you might maintain a blacklist of tokens
        return ResponseEntity.ok(new AuthResponse(null, null, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        // TODO: Implement password reset email sending
        // Generate reset token, send email with reset link
        log.info("Password reset requested for email={}", email);
        return ResponseEntity.ok(Map.of("message", "If email exists, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }
        
        // TODO: Implement password reset with token validation
        log.info("Password reset attempted with token");
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}

