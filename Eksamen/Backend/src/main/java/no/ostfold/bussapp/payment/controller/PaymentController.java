package no.ostfold.bussapp.payment.controller;

import no.ostfold.bussapp.payment.dto.PaymentMethodResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethodResponse>> getPaymentMethods() {
        // TODO: Implement payment methods retrieval from database
        return ResponseEntity.ok(List.of());
    }
}

