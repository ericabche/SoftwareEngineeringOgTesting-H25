package no.ostfold.bussapp.ticket.controller;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import no.ostfold.bussapp.auth.service.JwtService;
import no.ostfold.bussapp.ticket.dto.BuyRequest;
import no.ostfold.bussapp.ticket.model.Ticket;
import no.ostfold.bussapp.ticket.service.TicketPurchaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketPurchaseController {

    private final TicketPurchaseService ticketPurchaseService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public TicketPurchaseController(
            TicketPurchaseService ticketPurchaseService,
            JwtService jwtService,
            UserRepository userRepository) {
        this.ticketPurchaseService = ticketPurchaseService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> buyTicket(
            @RequestBody BuyRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
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
            
            Ticket ticket = ticketPurchaseService.purchaseTicket(request, userId);
            if (ticket == null || ticket.getId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "ticketId", null,
                        "message", "Ticket purchase failed: Could not save ticket",
                        "success", false
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "ticketId", ticket.getId(),
                    "qrCodeHash", ticket.getQrCodeHash() != null ? ticket.getQrCodeHash() : "",
                    "message", "Ticket purchase successful",
                    "success", true
            ));
        } catch (Exception e) {
            e.printStackTrace(); // Log the full exception
            return ResponseEntity.badRequest().body(Map.of(
                    "ticketId", null,
                    "message", "Ticket purchase failed: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()),
                    "success", false
            ));
        }
    }
}

