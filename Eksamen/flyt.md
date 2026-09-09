graph TD
    A([App start]) --> B[Login side]
    
    B --> C{Login handlinger}
    C -->|Logg inn| D[Login prosess]
    C -->|Registrer| E[Registreringsside]
    C -->|Support| F[Support side]
    C -->|Glemt passord| G[Passord reset]
    
    D --> D1{Login vellykket?}
    D1 -->|Ja| H[Bruker type sjekk]
    D1 -->|Nei| B
    
    H --> H1{Er admin?}
    H1 -->|Ja| I[Admin dashboard]
    H1 -->|Nei| J[Vanlig bruker hjemmeside]
    
    J --> K{Bruker meny}
    K -->|Bestill billett| L[Billett bestilling]
    K -->|Mine billetter| M[Billett oversikt]
    K -->|Bussruter| N[Rute oversikt]
    K -->|Sanntidsinfo| O[Live buss posisjoner]
    K -->|Profil| P[Profil side]
    K -->|Innstillinger| Q[Innstillinger]
    K -->|Logg ut| B
    
    I --> R{Admin meny}
    R -->|Bruker administrasjon| S[Bruker management]
    R -->|Rute administrasjon| T[Rute management]
    R -->|Buss administrasjon| U[Buss management]
    R -->|System statistikk| V[System stats]
    R -->|Logg ut| B
    
    L --> L1[Velg rute] --> L2[Velg billetttype] --> L3[Betalingsside] --> L4{Betalings OK?}
    L4 -->|Ja| L5[Billett bekreftelse] --> M
    L4 -->|Nei| L3
    
    M --> M1[Vis billetter] --> M2[Billett historikk] --> M3{Billett handlinger}
    M3 -->|Last ned billett| M4[Last ned PDF/QR]
    M3 -->|Refunder billett| M5[Refunder prosess]
    M3 -->|Tilbake til hjemmeside| J
    
    N --> N1[Søk ruter] --> N2[Vis rutedetaljer] --> N3{Rute handlinger}
    N3 -->|Lagre favoritt| N4[Lagre som favoritt] --> J
    N3 -->|Bestill billett| L2
    N3 -->|Del rute| N5[Del rute link]
    N3 -->|Tilbake til ruter| N
    
    O --> O1[Velg stopp] --> O2[Vis live data] --> O3{Sanntids handlinger}
    O3 -->|Sett notifikasjon| O4[Notifikasjon for buss]
    O3 -->|Se rute| N2
    O3 -->|Tilbake til hjemmeside| J
    
    P --> P1[Profil info] --> P2[Endre passord] --> P3[Favorittruter] --> P4{Bruker handlinger}
    P4 -->|Rediger profil| P1
    P4 -->|Se favorittruter| N
    P4 -->|Tilbake til hjemmeside| J
    
    Q --> Q1[Notifikasjoner] --> Q2[Tema] --> Q3[Språk] --> Q4[Privatliv] --> Q5{Tilbake handlinger}
    Q5 -->|Tilbake til hjemmeside| J
    Q5 -->|Tilbake til profil| P
    
    F --> F1[Kontaktinformasjon] --> F2[FAQ] --> F3[Send support melding] --> F4{Tilbake handlinger}
    F4 -->|Tilbake til login| B
    F4 -->|Tilbake til hjemmeside| J
    
    G --> G1[Skriv e-post] --> G2[Send reset link] --> G3[E-post sendt bekreftelse] --> B
    
    S --> S1[Vis brukere] --> S2[Legg til bruker] --> S3[Rediger bruker] --> S4{Tilbake handlinger}
    S4 -->|Tilbake til admin| I
    S4 -->|Tilbake til brukerliste| S1
    
    T --> T1[Vis ruter] --> T2[Legg til rute] --> T3[Rediger rute] --> T4{Tilbake handlinger}
    T4 -->|Tilbake til admin| I
    T4 -->|Tilbake til ruteoversikt| T1
    
    U --> U1[Vis busser] --> U2[Legg til buss] --> U3[Rediger buss] --> U4{Tilbake handlinger}
    U4 -->|Tilbake til admin| I
    U4 -->|Tilbake til bussoversikt| U1
    
    V --> V1[System statistikker] --> V2[Rapporter] --> V3[Tilbake til admin] --> I