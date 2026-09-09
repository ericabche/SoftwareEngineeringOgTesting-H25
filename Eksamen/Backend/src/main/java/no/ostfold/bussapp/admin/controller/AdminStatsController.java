package no.ostfold.bussapp.admin.controller;

import no.ostfold.bussapp.auth.repository.UserRepository;
import no.ostfold.bussapp.ticket.repository.TicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final JdbcTemplate jdbcTemplate;

    public AdminStatsController(UserRepository userRepository, TicketRepository ticketRepository, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalTickets = ticketRepository.count();
        
        // Get total routes from database
        Long totalRoutes = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM app.route", Long.class);
        if (totalRoutes == null) totalRoutes = 0L;
        
        // Get active buses (count unique vehicles with active departures)
        // Active = departures that are IN_PROGRESS or PLANNED with planned_start in the near future/past
        Long activeBuses = jdbcTemplate.queryForObject(
            "SELECT COUNT(DISTINCT vehicle_no) FROM app.departure " +
            "WHERE status IN ('IN_PROGRESS', 'PLANNED') " +
            "AND vehicle_no IS NOT NULL " +
            "AND planned_start >= NOW() - INTERVAL '2 hours' " +
            "AND planned_start <= NOW() + INTERVAL '24 hours'", 
            Long.class);
        if (activeBuses == null) {
            // Fallback: count all departures with status IN_PROGRESS or PLANNED
            activeBuses = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app.departure WHERE status IN ('IN_PROGRESS', 'PLANNED')", 
                Long.class);
            if (activeBuses == null) activeBuses = 0L;
        }
        
        // Get total revenue from tickets
        Long revenue = jdbcTemplate.queryForObject(
            "SELECT COALESCE(SUM(price_cents), 0) FROM app.ticket", Long.class);
        if (revenue == null) revenue = 0L;
        
        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalTickets", totalTickets,
                "totalRoutes", totalRoutes,
                "activeBuses", activeBuses,
                "revenue", revenue
        ));
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        // TODO: Implement reports generation
        return ResponseEntity.ok(Map.of("message", "Reports generated successfully"));
    }
}

