# Bussapp

Reise- og billettapp for kollektivtransport. Gruppeprosjekt i emnet Software Engineering og
testing ved Høgskolen i Østfold, høsten 2025. Team på fem, organisert etter Scrum.

<!-- TODO: én setning om hva appen faktisk lar brukeren gjøre. Søke opp avganger?
     Kjøpe og vise billett? Planlegge reise? Skriv det fra brukerens perspektiv. -->

## Min rolle: Product Owner

- Ansvarlig for kravprioritering og brukerhistorier gjennom sprintene
- Skrev og vedlikeholdt prosjektdokumentasjonen
- Definerte ikke-funksjonelle krav til sikkerhet og personvern, blant annet GDPR-samsvar,
  passordhashing med bcrypt, JWT-autentisering og kryptert kommunikasjon over TLS
- Fulgte opp backlog og sprintplanlegging i Jira

## Arkitektur

Appen består av en React Native-klient som snakker med et Spring Boot-API over REST, med
PostgreSQL som database. Autentisering skjer med JWT, og all kommunikasjon går over TLS.

| | |
|---|---|
| Frontend | React Native |
| Backend | Java, Spring Boot |
| Database | PostgreSQL |
| Autentisering | JWT, passordhashing med bcrypt |
| CI/CD | GitHub Actions |
| Prosjektstyring | Jira, GitHub |

<!-- TODO: hvis dere har et arkitekturdiagram fra dokumentasjonen, legg det inn her.
     Et bilde sier mer enn tabellen. Lagre det som docs/arkitektur.png og bruk:
     ![Arkitektur](docs/arkitektur.png) -->

## Kjøre lokalt

<!-- TODO: fyll inn de faktiske kommandoene. Skissen under er utgangspunktet,
     tilpass mappenavn og portnumre til slik repoet faktisk er satt opp. -->

Krever Java 17+, Node.js og en kjørende PostgreSQL-instans.

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm start
```

Databasetilkobling, JWT-hemmelighet og øvrige hemmeligheter settes som miljøvariabler.
Se `.env.example` for hvilke variabler som kreves.

<!-- TODO: opprett en .env.example med tomme verdier hvis den ikke finnes,
     og kontroller at ingen faktiske hemmeligheter ligger i commit-historikken. -->

## Testing

<!-- TODO: kort om hva som testes og hvordan testene kjøres, for eksempel
     `./mvnw test` for backend. Nevn testtyper hvis dere har flere nivåer
     (enhetstester, integrasjonstester, ende-til-ende). -->

## Sikkerhet og personvern

Prosjektet behandler reisedata, som er personopplysninger. Følgende tiltak ble bygget inn
fra kravfasen:

- Passord lagres kun som bcrypt-hasher, aldri i klartekst
- Sesjoner håndteres med JWT med utløpstid
- All trafikk mellom klient og API går over TLS
- Datainnsamlingen ble begrenset til det appen faktisk trenger, i tråd med
  dataminimeringsprinsippet i GDPR

## Status

Studentprosjekt levert høsten 2025. Ikke i produksjon og ikke vedlikeholdt.
