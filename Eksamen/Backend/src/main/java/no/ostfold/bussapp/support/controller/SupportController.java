package no.ostfold.bussapp.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    @GetMapping("/contact")
    public ResponseEntity<Map<String, String>> getContactInfo() {
        return ResponseEntity.ok(Map.of(
                "email", "support@bussapp.no",
                "phone", "+47 123 45 678",
                "address", "Bussveien 1, 1234 Oslo"
        ));
    }

    @GetMapping("/faq")
    public ResponseEntity<List<Map<String, String>>> getFAQ() {
        return ResponseEntity.ok(List.of(
                Map.of("question", "Hvordan kjøper jeg billett?", "answer", "Du kan kjøpe billett gjennom appen ved å velge rute og betalingsmetode."),
                Map.of("question", "Kan jeg refunder billetten?", "answer", "Ja, du kan refunder billetten innen 24 timer før avgang."),
                Map.of("question", "Hvordan ser jeg sanntidsinformasjon?", "answer", "Gå til 'Sanntidsinfo' i appen og velg stoppested.")
        ));
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> sendSupportMessage(@RequestBody Map<String, String> message) {
        // TODO: Implement support message sending (save to database or send email)
        return ResponseEntity.ok(Map.of("message", "Support message sent successfully"));
    }
}

