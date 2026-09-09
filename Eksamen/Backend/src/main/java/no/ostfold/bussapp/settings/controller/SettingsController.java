package no.ostfold.bussapp.settings.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        // TODO: Implement settings retrieval from database
        return ResponseEntity.ok(Map.of(
                "notifications", true,
                "theme", "light",
                "language", "no",
                "privacy", Map.of("shareLocation", false)
        ));
    }

    @PutMapping("/notifications")
    public ResponseEntity<Map<String, String>> updateNotifications(@RequestBody Map<String, Boolean> settings) {
        // TODO: Implement notification settings update
        return ResponseEntity.ok(Map.of("message", "Notification settings updated"));
    }

    @PutMapping("/theme")
    public ResponseEntity<Map<String, String>> updateTheme(@RequestBody Map<String, String> settings) {
        // TODO: Implement theme settings update
        return ResponseEntity.ok(Map.of("message", "Theme updated"));
    }

    @PutMapping("/language")
    public ResponseEntity<Map<String, String>> updateLanguage(@RequestBody Map<String, String> settings) {
        // TODO: Implement language settings update
        return ResponseEntity.ok(Map.of("message", "Language updated"));
    }

    @PutMapping("/privacy")
    public ResponseEntity<Map<String, String>> updatePrivacy(@RequestBody Map<String, Object> settings) {
        // TODO: Implement privacy settings update
        return ResponseEntity.ok(Map.of("message", "Privacy settings updated"));
    }
}

