package no.ostfold.bussapp.ticket.repository;

import no.ostfold.bussapp.ticket.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserIdOrderByPurchasedAtDesc(Long userId);
    Page<Ticket> findByUserIdOrderByPurchasedAtDesc(Long userId, Pageable pageable);
}
