package no.ostfold.bussapp.ticket.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import no.ostfold.bussapp.ticket.model.Ticket;

@Converter
public class TicketStateConverter implements AttributeConverter<Ticket.TicketState, Object> {
    
    @Override
    public Object convertToDatabaseColumn(Ticket.TicketState attribute) {
        if (attribute == null) {
            return null;
        }
        // Return the enum name as a string - PostgreSQL will cast it to ticket_state
        return attribute.name();
    }
    
    @Override
    public Ticket.TicketState convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        String value = dbData.toString();
        try {
            return Ticket.TicketState.valueOf(value);
        } catch (IllegalArgumentException e) {
            return Ticket.TicketState.NEW;
        }
    }
}

