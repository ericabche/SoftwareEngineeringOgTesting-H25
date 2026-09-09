package no.ostfold.bussapp.ticket.controller;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import no.ostfold.bussapp.auth.service.JwtService;
import no.ostfold.bussapp.ticket.model.Ticket;
import no.ostfold.bussapp.ticket.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public TicketController(
            TicketRepository ticketRepository,
            JwtService jwtService,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAvailableTickets(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String time) {
        // TODO: Implement ticket retrieval based on location and time
        // If time/location unavailable, show random tickets
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTicketById(@PathVariable Long id) {
        // TODO: Implement specific ticket retrieval from database
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getTicketHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = null;
        
        // Extract user ID from JWT token if provided
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtService.extractUsername(token);
                if (email != null && jwtService.isTokenExpired(token) == false) {
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        userId = user.getId();
                    }
                }
            } catch (Exception e) {
                // Invalid token, treat as guest
                userId = null;
            }
        }
        
        // If no valid user ID, use default guest user ID (1)
        if (userId == null) {
            userId = 1L;
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Ticket> ticketPage = ticketRepository.findByUserIdOrderByPurchasedAtDesc(userId, pageable);
        
        List<Map<String, Object>> tickets = ticketPage.getContent().stream()
            .map(ticket -> {
                // Calculate validity times (ticket valid for 90 minutes from purchase)
                LocalDateTime validFrom = ticket.getPurchasedAt();
                LocalDateTime validTo = validFrom.plusMinutes(90);
                
                return Map.<String, Object>of(
                    "id", ticket.getId(),
                    "title", "Enkeltbillett",
                    "routeName", "Østfold",
                    "fareType", ticket.getFare() != null ? ticket.getFare().name() : "ADULT",
                    "area", "Østfold",
                    "purchasedAt", ticket.getPurchasedAt().toString(),
                    "validFrom", validFrom.toString(),
                    "validTo", validTo.toString(),
                    "state", ticket.getState() != null ? ticket.getState().name() : "NEW",
                    "priceCents", ticket.getPriceCents()
                );
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
                "tickets", tickets,
                "page", page,
                "totalPages", ticketPage.getTotalPages()
        ));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Map<String, String>> downloadTicket(@PathVariable Long id) {
        // TODO: Implement ticket download (PDF/QR code generation)
        return ResponseEntity.ok(Map.of("message", "Ticket download initiated", "url", "/tickets/" + id + "/pdf"));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<Map<String, String>> refundTicket(@PathVariable Long id) {
        // TODO: Implement ticket refund process
        return ResponseEntity.ok(Map.of("message", "Refund request processed"));
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> checkActiveTicket(
            @RequestParam(required = false) String routeCode,
            @RequestParam(required = false) String departureTime) {
        // TODO: Implement check for active ticket for a specific route/departure
        // For now, return false (no active ticket)
        return ResponseEntity.ok(Map.of(
                "hasActiveTicket", false,
                "ticketId", null,
                "message", "No active ticket found"
        ));
    }
}

