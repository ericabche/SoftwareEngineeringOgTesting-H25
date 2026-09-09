package no.ostfold.bussapp.profile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile() {
        // TODO: Implement profile data retrieval from database
        return ResponseEntity.ok(Map.of(
                "email", "user@example.com",
                "fullName", "User Name",
                "phone", "+47 123 45 678",
                "createdAt", "2025-01-01T00:00:00+01:00"
        ));
    }

    @PostMapping("/changetel")
    public ResponseEntity<Map<String, String>> changePhone(@RequestBody Map<String, String> request) {
        // TODO: Implement phone number update
        String phone = request.get("phone");
        return ResponseEntity.ok(Map.of("message", "Phone number updated successfully"));
    }

    @PostMapping("/changeemail")
    public ResponseEntity<Map<String, String>> changeEmail(@RequestBody Map<String, String> request) {
        // TODO: Implement email update
        String email = request.get("email");
        return ResponseEntity.ok(Map.of("message", "Email updated successfully"));
    }

    @PostMapping("/changename")
    public ResponseEntity<Map<String, String>> changeName(@RequestBody Map<String, String> request) {
        // TODO: Implement name update (first name and last name)
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        return ResponseEntity.ok(Map.of("message", "Name updated successfully"));
    }

    @PostMapping("/changepassword")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        // TODO: Implement password change
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}

