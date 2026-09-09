package no.ostfold.bussapp.favorite.controller;

import no.ostfold.bussapp.favorite.dto.FavoriteTripResponse;
import no.ostfold.bussapp.favorite.dto.SaveTripRequest;
import no.ostfold.bussapp.favorite.dto.SavedTripResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @GetMapping("/saved-trips")
    public ResponseEntity<List<SavedTripResponse>> getSavedTrips() {
        // TODO: Implement saved bus trips retrieval
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/save-trip")
    public ResponseEntity<Map<String, String>> saveTrip(@RequestBody SaveTripRequest request) {
        // TODO: Implement trip saving to savedtrips
        return ResponseEntity.ok(Map.of("message", "Trip saved successfully"));
    }

    @GetMapping("/favorite-trips")
    public ResponseEntity<List<FavoriteTripResponse>> getFavoriteTrips() {
        // TODO: Implement favorite trip retrieval
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/favorite-trip")
    public ResponseEntity<Map<String, String>> saveFavoriteTrip(@RequestBody SaveTripRequest request) {
        // TODO: Implement favorite trip saving
        return ResponseEntity.ok(Map.of("message", "Favorite trip saved successfully"));
    }

    @DeleteMapping("/favorite-trip/{id}")
    public ResponseEntity<Map<String, String>> removeFavoriteTrip(@PathVariable Long id) {
        // TODO: Implement favorite trip removal
        return ResponseEntity.ok(Map.of("message", "Favorite trip removed successfully"));
    }
}

