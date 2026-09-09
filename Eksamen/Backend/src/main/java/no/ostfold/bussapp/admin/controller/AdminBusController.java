package no.ostfold.bussapp.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/buses")
public class AdminBusController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBuses() {
        // TODO: Implement bus retrieval from database
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBusById(@PathVariable Long id) {
        // TODO: Implement bus retrieval by ID
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBus(@RequestBody Map<String, Object> bus) {
        // TODO: Implement bus creation
        return ResponseEntity.ok(Map.of("message", "Bus created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBus(@PathVariable Long id, @RequestBody Map<String, Object> bus) {
        // TODO: Implement bus update
        return ResponseEntity.ok(Map.of("message", "Bus updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBus(@PathVariable Long id) {
        // TODO: Implement bus deletion
        return ResponseEntity.ok(Map.of("message", "Bus deleted successfully"));
    }
}

