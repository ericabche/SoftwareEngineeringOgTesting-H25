package no.ostfold.bussapp.route.controller;

import no.ostfold.bussapp.route.model.Route;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "https://itstud.hiof.no"})
public class RouteController {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    @GetMapping("/api/route")
    public Map<String, Object> getRoutes(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "0") int delay
    ) {
        if (from.equalsIgnoreCase(to)) {
            return Map.of("error", "Avgang og destinasjon kan ikke være like.");
        }

        ZonedDateTime base = ZonedDateTime.now().plusMinutes(delay);

        ZonedDateTime d1 = base.plusMinutes(5).truncatedTo(ChronoUnit.SECONDS);
        ZonedDateTime a1 = base.plusMinutes(40).truncatedTo(ChronoUnit.SECONDS);
        ZonedDateTime d2 = base.plusMinutes(20).truncatedTo(ChronoUnit.SECONDS);
        ZonedDateTime a2 = base.plusMinutes(65).truncatedTo(ChronoUnit.SECONDS);
        ZonedDateTime d3 = base.plusMinutes(45).truncatedTo(ChronoUnit.SECONDS);
        ZonedDateTime a3 = base.plusMinutes(100).truncatedTo(ChronoUnit.SECONDS);

        List<Route> items = List.of(
                new Route(from, to, 35, d1.format(ISO), a1.format(ISO), "633", "Skjeberg–Halden"),
                new Route(from, to, 45, d2.format(ISO), a2.format(ISO), "630", "Sarpsborg–Halden"),
                new Route(from, to, 55, d3.format(ISO), a3.format(ISO), "6X", "Ekspress Sarpsborg–Halden")
        );

        return Map.of("itineraries", items);
    }

    @GetMapping("/api/stops/search")
    public List<Map<String, String>> searchStops(@RequestParam(required = false, defaultValue = "") String query) {
        // Common stops in Østfold region
        List<Map<String, String>> allStops = List.of(
                Map.of("name", "Sarpsborg Bussterminal", "municipality", "Sarpsborg"),
                Map.of("name", "Sarpsborg Stasjon", "municipality", "Sarpsborg"),
                Map.of("name", "Sarpsborg Sentrum", "municipality", "Sarpsborg"),
                Map.of("name", "Halden Bussterminal", "municipality", "Halden"),
                Map.of("name", "Halden Stasjon", "municipality", "Halden"),
                Map.of("name", "Halden Sentrum", "municipality", "Halden"),
                Map.of("name", "Fredrikstad Bussterminal", "municipality", "Fredrikstad"),
                Map.of("name", "Fredrikstad Stasjon", "municipality", "Fredrikstad"),
                Map.of("name", "Fredrikstad Sentrum", "municipality", "Fredrikstad"),
                Map.of("name", "Moss Bussterminal", "municipality", "Moss"),
                Map.of("name", "Moss Stasjon", "municipality", "Moss"),
                Map.of("name", "Moss Sentrum", "municipality", "Moss"),
                Map.of("name", "Remmen Høgskole", "municipality", "Halden"),
                Map.of("name", "Skjeberg", "municipality", "Sarpsborg"),
                Map.of("name", "Tune", "municipality", "Sarpsborg"),
                Map.of("name", "Greåker", "municipality", "Sarpsborg"),
                Map.of("name", "Varteig", "municipality", "Sarpsborg"),
                Map.of("name", "Tistedal", "municipality", "Halden"),
                Map.of("name", "Berg", "municipality", "Halden"),
                Map.of("name", "Idd", "municipality", "Halden"),
                Map.of("name", "Rød", "municipality", "Halden"),
                Map.of("name", "Rokke", "municipality", "Halden"),
                Map.of("name", "Gressvik", "municipality", "Fredrikstad"),
                Map.of("name", "Onsøy", "municipality", "Fredrikstad"),
                Map.of("name", "Kråkerøy", "municipality", "Fredrikstad"),
                Map.of("name", "Rygge", "municipality", "Moss"),
                Map.of("name", "Rygge Stasjon", "municipality", "Moss"),
                Map.of("name", "Råde", "municipality", "Moss"),
                Map.of("name", "Rygge Flyplass", "municipality", "Moss")
        );

        if (query == null || query.trim().isEmpty()) {
            return allStops;
        }

        String lowerQuery = query.toLowerCase();
        return allStops.stream()
                .filter(stop -> stop.get("name").toLowerCase().contains(lowerQuery) ||
                               stop.get("municipality").toLowerCase().contains(lowerQuery))
                .toList();
    }
}

