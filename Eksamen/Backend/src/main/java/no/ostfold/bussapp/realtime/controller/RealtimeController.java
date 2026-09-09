package no.ostfold.bussapp.realtime.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/realtime")
public class RealtimeController {

    @GetMapping("/stop/{stopId}")
    public ResponseEntity<Map<String, Object>> getLiveDataForStop(@PathVariable Long stopId) {
        // TODO: Implement live bus position retrieval for a specific stop
        return ResponseEntity.ok(Map.of(
                "stopId", stopId,
                "departures", List.of(),
                "delays", List.of()
        ));
    }

    @GetMapping("/bus/{busId}")
    public ResponseEntity<Map<String, Object>> getLiveBusPosition(@PathVariable Long busId) {
        // TODO: Implement live bus position retrieval
        return ResponseEntity.ok(Map.of(
                "busId", busId,
                "latitude", 0.0,
                "longitude", 0.0,
                "route", "",
                "status", "IN_PROGRESS"
        ));
    }

    @PostMapping("/notification")
    public ResponseEntity<Map<String, String>> setNotification(@RequestBody Map<String, Object> request) {
        // TODO: Implement notification setting for bus arrival
        return ResponseEntity.ok(Map.of("message", "Notification set successfully"));
    }
}

