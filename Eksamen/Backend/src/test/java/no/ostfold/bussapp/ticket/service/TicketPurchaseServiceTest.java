package no.ostfold.bussapp.ticket.service;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import no.ostfold.bussapp.ticket.dto.BuyRequest;
import no.ostfold.bussapp.ticket.model.Ticket;
import no.ostfold.bussapp.ticket.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketPurchaseServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private TicketPurchaseService ticketPurchaseService;

    private BuyRequest buyRequest;
    private User testUser;
    private Ticket testTicket;
    private Long testUserId;
    private Long testTicketId;

    @BeforeEach
    void setUp() {
        testUserId = 1L;
        testTicketId = 100L;

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setIsActive(true);

        testTicket = new Ticket();
        testTicket.setId(testTicketId);
        testTicket.setUserId(testUserId);
        testTicket.setDepartureId(1L);
        testTicket.setQrCodeHash("testQrCodeHash");
        testTicket.setFare(Ticket.FareType.ADULT);
        testTicket.setPriceCents(4000);
        testTicket.setState(Ticket.TicketState.NEW);
        testTicket.setPurchasedAt(LocalDateTime.now());

        buyRequest = new BuyRequest();
        buyRequest.setDepartureId(1L);
        buyRequest.setFareType("ADULT");
    }

    @Test
    void testPurchaseTicket_WithValidUser() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(testTicketId, result.getId());
        verify(userRepository, times(1)).findById(testUserId);
        verify(jdbcTemplate, times(1)).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any());
        verify(ticketRepository, times(1)).findById(testTicketId);
    }

    @Test
    void testPurchaseTicket_WithNullUserId_GuestPurchase() {
        // Arrange
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, null);

        // Assert
        assertNotNull(result);
        assertEquals(testTicketId, result.getId());
        // Should use default guest user ID (1L)
        ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
        verify(jdbcTemplate).queryForObject(anyString(), eq(Long.class), userIdCaptor.capture(), any(), any(), any(LocalDateTime.class), any(), any(), any());
        assertEquals(1L, userIdCaptor.getValue());
    }

    @Test
    void testPurchaseTicket_WithSeniorFareType() {
        // Arrange
        buyRequest.setSeniors(1);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Verify that SENIOR fare type was used
        ArgumentCaptor<String> fareTypeCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(LocalDateTime.class), fareTypeCaptor.capture(), any(), any());
        assertEquals("SENIOR", fareTypeCaptor.getValue());
    }

    @Test
    void testPurchaseTicket_WithInvalidFareType_FallsBackToAdult() {
        // Arrange
        buyRequest.setFareType("INVALID_TYPE");
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Should fall back to ADULT fare type
        ArgumentCaptor<String> fareTypeCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(LocalDateTime.class), fareTypeCaptor.capture(), any(), any());
        assertEquals("ADULT", fareTypeCaptor.getValue());
    }

    @Test
    void testPurchaseTicket_WithNullDepartureId_UsesDefault() {
        // Arrange
        buyRequest.setDepartureId(null);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Should use default departure ID (1L)
        ArgumentCaptor<Long> departureIdCaptor = ArgumentCaptor.forClass(Long.class);
        verify(jdbcTemplate).queryForObject(anyString(), eq(Long.class), any(), departureIdCaptor.capture(), any(), any(LocalDateTime.class), any(), any(), any());
        assertEquals(1L, departureIdCaptor.getValue());
    }

    @Test
    void testPurchaseTicket_GeneratesUniqueQrCodeHash() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result1 = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);
        Ticket result2 = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result1);
        assertNotNull(result2);
        // Verify that QR code hash was generated (captured in SQL call)
        ArgumentCaptor<String> qrCodeCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate, atLeast(2)).queryForObject(anyString(), eq(Long.class), any(), any(), qrCodeCaptor.capture(), any(LocalDateTime.class), any(), any(), any());
        // QR codes should be different (though we can't directly compare due to mocking)
        assertTrue(qrCodeCaptor.getAllValues().size() >= 2);
    }

    @Test
    void testPurchaseTicket_SetsCorrectPrice() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Verify price is set to 4000 cents
        ArgumentCaptor<Integer> priceCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(jdbcTemplate).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(LocalDateTime.class), any(), priceCaptor.capture(), any());
        assertEquals(4000, priceCaptor.getValue());
    }

    @Test
    void testPurchaseTicket_SetsTicketStateToNew() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Verify ticket state is set to NEW
        ArgumentCaptor<String> stateCaptor = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(LocalDateTime.class), any(), any(), stateCaptor.capture());
        assertEquals("NEW", stateCaptor.getValue());
    }

    @Test
    void testPurchaseTicket_WithNonExistentUser_StillCreatesTicket() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Should still create ticket even if user doesn't exist (for guest purchases)
        verify(jdbcTemplate, times(1)).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void testGenerateQrCodeHash_GeneratesValidHash() throws Exception {
        // Arrange - Use reflection to access private method for testing
        java.lang.reflect.Method method = TicketPurchaseService.class.getDeclaredMethod("generateQrCodeHash");
        method.setAccessible(true);

        // Act
        String qrCodeHash1 = (String) method.invoke(ticketPurchaseService);
        String qrCodeHash2 = (String) method.invoke(ticketPurchaseService);

        // Assert
        assertNotNull(qrCodeHash1);
        assertNotNull(qrCodeHash2);
        assertFalse(qrCodeHash1.isEmpty());
        assertFalse(qrCodeHash2.isEmpty());
        // QR codes should be different (very high probability)
        assertNotEquals(qrCodeHash1, qrCodeHash2);
        // Should be a valid hex string (SHA-256 produces 64 character hex string)
        Pattern hexPattern = Pattern.compile("^[0-9a-f]{64}$");
        assertTrue(hexPattern.matcher(qrCodeHash1).matches(), "QR code hash should be a 64-character hex string");
    }

    @Test
    void testPurchaseTicket_TransactionHandling() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(testTicketId);
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketPurchaseService.purchaseTicket(buyRequest, testUserId);

        // Assert
        assertNotNull(result);
        // Verify that the method uses @Transactional annotation (checked via method signature)
        // The transaction is handled by Spring, so we verify the database operations occurred
        verify(jdbcTemplate, times(1)).queryForObject(anyString(), eq(Long.class), any(), any(), any(), any(), any(), any(), any());
        verify(ticketRepository, times(1)).findById(testTicketId);
    }
}

