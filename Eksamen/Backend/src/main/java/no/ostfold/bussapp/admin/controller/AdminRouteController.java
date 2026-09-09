package no.ostfold.bussapp.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/routes")
public class AdminRouteController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRoutes() {
        // TODO: Implement route retrieval from database
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRouteById(@PathVariable Long id) {
        // TODO: Implement route retrieval by ID
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRoute(@RequestBody Map<String, Object> route) {
        // TODO: Implement route creation
        return ResponseEntity.ok(Map.of("message", "Route created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRoute(@PathVariable Long id, @RequestBody Map<String, Object> route) {
        // TODO: Implement route update
        return ResponseEntity.ok(Map.of("message", "Route updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRoute(@PathVariable Long id) {
        // TODO: Implement route deletion
        return ResponseEntity.ok(Map.of("message", "Route deleted successfully"));
    }
}

