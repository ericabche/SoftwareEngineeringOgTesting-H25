package no.ostfold.bussapp.ticket.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import no.ostfold.bussapp.ticket.model.Ticket;

@Converter
public class FareTypeConverter implements AttributeConverter<Ticket.FareType, Object> {
    
    @Override
    public Object convertToDatabaseColumn(Ticket.FareType attribute) {
        if (attribute == null) {
            return null;
        }
        // Return the enum name as a string - PostgreSQL will cast it to fare_type
        return attribute.name();
    }
    
    @Override
    public Ticket.FareType convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        String value = dbData.toString();
        try {
            return Ticket.FareType.valueOf(value);
        } catch (IllegalArgumentException e) {
            return Ticket.FareType.ADULT;
        }
    }
}

