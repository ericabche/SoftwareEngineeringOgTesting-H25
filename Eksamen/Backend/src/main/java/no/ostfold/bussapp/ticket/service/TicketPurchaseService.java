package no.ostfold.bussapp.ticket.service;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import no.ostfold.bussapp.ticket.dto.BuyRequest;
import no.ostfold.bussapp.ticket.model.Ticket;
import no.ostfold.bussapp.ticket.repository.TicketRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TicketPurchaseService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public TicketPurchaseService(TicketRepository ticketRepository, UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Ticket purchaseTicket(BuyRequest request, Long userId) {
        // userId can be null for guest purchases
        // For guest purchases, use a default guest user ID
        if (userId == null) {
            // Use a default guest user ID (1) for guest purchases
            // In production, you might want to create a dedicated guest user
            userId = 1L;
        }
        
        // Try to get the user if available
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            // If no user exists, still allow ticket creation for guest purchases
            // In production, you might want to create a guest user or handle this differently
        }

        // Determine fare type
        Ticket.FareType fareType = Ticket.FareType.ADULT;
        if (request.getSeniors() != null && request.getSeniors() > 0) {
            fareType = Ticket.FareType.SENIOR;
        } else if (request.getFareType() != null) {
            try {
                fareType = Ticket.FareType.valueOf(request.getFareType());
            } catch (IllegalArgumentException e) {
                fareType = Ticket.FareType.ADULT;
            }
        }
        
        Long departureId = request.getDepartureId() != null ? request.getDepartureId() : 1L;
        String qrCodeHash = generateQrCodeHash();
        Integer priceCents = 4000;
        LocalDateTime purchasedAt = LocalDateTime.now();
        
        // Use native SQL to insert with proper enum casting
        String sql = """
            INSERT INTO app.ticket (user_id, departure_id, qr_code_hash, purchased_at, fare, price_cents, state)
            VALUES (?, ?, ?, ?, ?::fare_type, ?, ?::ticket_state)
            RETURNING id
            """;
        
        Long ticketId = jdbcTemplate.queryForObject(
            sql,
            Long.class,
            userId,
            departureId,
            qrCodeHash,
            purchasedAt,
            fareType.name(),
            priceCents,
            Ticket.TicketState.NEW.name()
        );
        
        // Load and return the saved ticket
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        return ticket;
    }

    private String generateQrCodeHash() {
        // Generate a unique QR code hash
        String uuid = UUID.randomUUID().toString();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(uuid.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            // Fallback to UUID if hashing fails
            return uuid.replace("-", "");
        }
    }
}
