package no.ostfold.bussapp.admin.controller;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository, JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        // Get roles for each user
        List<Map<String, Object>> usersWithRoles = users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("fullName", user.getFullName());
            userMap.put("isActive", user.getIsActive());
            userMap.put("createdAt", user.getCreatedAt());
            
            // Get roles for this user
            List<String> roles = jdbcTemplate.queryForList(
                "SELECT r.code FROM app.user_role ur " +
                "JOIN app.role r ON ur.role_id = r.id " +
                "WHERE ur.user_id = ?", 
                String.class, 
                user.getId()
            );
            userMap.put("roles", roles);
            
            return userMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(usersWithRoles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("fullName", user.getFullName());
                    userMap.put("isActive", user.getIsActive());
                    userMap.put("createdAt", user.getCreatedAt());
                    
                    // Get roles for this user
                    List<String> roles = jdbcTemplate.queryForList(
                        "SELECT r.code FROM app.user_role ur " +
                        "JOIN app.role r ON ur.role_id = r.id " +
                        "WHERE ur.user_id = ?", 
                        String.class, 
                        user.getId()
                    );
                    userMap.put("roles", roles);
                    
                    return ResponseEntity.ok(userMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/tickets")
    public ResponseEntity<List<Map<String, Object>>> getUserTickets(@PathVariable Long id) {
        List<Map<String, Object>> tickets = jdbcTemplate.queryForList(
            "SELECT id, user_id, departure_id, qr_code_hash, purchased_at, fare, price_cents, state " +
            "FROM app.ticket WHERE user_id = ? ORDER BY purchased_at DESC",
            id
        );
        return ResponseEntity.ok(tickets);
    }
    
    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String roleCode = request.get("roleCode");
        if (roleCode == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "roleCode is required"));
        }
        
        // Get role ID
        try {
            Integer roleId = jdbcTemplate.queryForObject(
                "SELECT id FROM app.role WHERE code = ?", 
                Integer.class, 
                roleCode
            );
            
            // Remove all existing roles for this user
            jdbcTemplate.update("DELETE FROM app.user_role WHERE user_id = ?", id);
            
            // Add new role
            jdbcTemplate.update(
                "INSERT INTO app.user_role (user_id, role_id) VALUES (?, ?)",
                id, roleId
            );
            
            return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role code"));
        }
    }
    
    @PutMapping("/{id}/disable")
    public ResponseEntity<Map<String, String>> disableUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setIsActive(false);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "User disabled successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/enable")
    public ResponseEntity<Map<String, String>> enableUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setIsActive(true);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "User enabled successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/ticket")
    public ResponseEntity<Map<String, Object>> giveUserTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        // Create a ticket for the user
        Long departureId = request.get("departureId") != null ? 
            Long.valueOf(request.get("departureId").toString()) : 1L;
        String fareType = request.get("fareType") != null ? 
            request.get("fareType").toString() : "ADULT";
        Integer priceCents = request.get("priceCents") != null ? 
            Integer.valueOf(request.get("priceCents").toString()) : 4000;
        
        String qrCodeHash = "admin_gift_" + System.currentTimeMillis();
        
        String sql = """
            INSERT INTO app.ticket (user_id, departure_id, qr_code_hash, purchased_at, fare, price_cents, state)
            VALUES (?, ?, ?, NOW(), ?::fare_type, ?, 'NEW'::ticket_state)
            RETURNING id
            """;
        
        Long ticketId = jdbcTemplate.queryForObject(sql, Long.class, id, departureId, qrCodeHash, fareType, priceCents);
        
        return ResponseEntity.ok(Map.of(
            "ticketId", ticketId,
            "message", "Ticket given to user successfully"
        ));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setEmail(user.getEmail());
                    existing.setFullName(user.getFullName());
                    existing.setIsActive(user.getIsActive());
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/email")
    public ResponseEntity<Map<String, String>> updateUserEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        return userRepository.findById(id)
                .map(user -> {
                    user.setEmail(email);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Email updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> updateUserPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        }
        
        return userRepository.findById(id)
                .map(user -> {
                    user.setPasswordHash(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/fullname")
    public ResponseEntity<Map<String, String>> updateUserFullName(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        if (fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full name is required"));
        }
        
        return userRepository.findById(id)
                .map(user -> {
                    user.setFullName(fullName.trim());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Full name updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // First, delete or reassign all tickets for this user
            // Option 1: Delete all tickets (more destructive)
            // jdbcTemplate.update("DELETE FROM app.ticket WHERE user_id = ?", id);
            
            // Option 2: Reassign tickets to a default/guest user (safer)
            // Find or use a default guest user ID (e.g., user ID 1 or create a guest user)
            Long guestUserId = 1L; // Default guest user
            if (!userRepository.existsById(guestUserId) || guestUserId.equals(id)) {
                // If guest user doesn't exist or is the same user, delete tickets instead
                jdbcTemplate.update("DELETE FROM app.ticket WHERE user_id = ?", id);
            } else {
                // Reassign tickets to guest user
                jdbcTemplate.update("UPDATE app.ticket SET user_id = ? WHERE user_id = ?", guestUserId, id);
            }
            
            // Delete user roles
            jdbcTemplate.update("DELETE FROM app.user_role WHERE user_id = ?", id);
            
            // Now delete the user
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not delete user: " + e.getMessage()));
        }
    }
}

