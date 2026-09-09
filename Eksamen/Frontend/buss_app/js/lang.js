// js/lang.js
// Alle tekster for appen (norsk / engelsk)

// Legger dette på window slik at i18n.js finner det
window.LANG = {
  nb: {
    /* =====================================
       GLOBALE / FELLES
       ===================================== */
    app_title: "Østfold Kollektiv",

    menu_travel: "Reise",
    menu_ticket: "Billett",
    menu_profile: "Profil",

    "nav.travel": "Reise",
    "nav.ticket": "Billett",
    "nav.profile": "Profil",

    aria_tab_travel: "Gå til reise",
    aria_tab_ticket: "Gå til billett",
    aria_tab_profile: "Gå til profil",
    aria_swap: "Bytt om fra og til",

    "global.back": "Tilbake",
    "global.next": "Neste",
    "global.save": "Lagre",
    "global.cancel": "Avbryt",
    "global.close": "Lukk",

    /* =====================================
       REISE
       ===================================== */

    /* --- Reise – hovedfunksjon / kart / søk --- */
    map_title: "Kart",
    tab_find_journey: "Finn reise",
    tab_departures: "Se avganger",

    label_from: "Fra",
    label_to: "Til",
    ph_from_position: "Din posisjon",
    ph_to_where: "Hvor skal du?",

    heading_results: "Forslag til reise",
    heading_departures: "Avganger",
    heading_nearby: "I nærheten",
    heading_favorites: "Favoritter",
    btn_add_favorite: "+ Legg til ny favoritt",

    msg_no_departures: "Ingen avganger funnet",
    msg_no_journeys: "Ingen reiser funnet for",

    /* --- Reise – favoritter (favoritter.html) --- */
    "favorites.add_aria": "Legg til favoritt",
    "favorites.empty_title": "Ingen favoritter enda",
    "favorites.empty_text":
      "Legg til steder du reiser ofte til eller holdeplasser du bruker mye, og bruk dem som snarveier i appen.",
    "favorites.addresses_title": "Adresser",
    "favorites.stops_title": "Stoppesteder",
    "favorites.add_title": "Legg til ny favoritt",

    "favorites.search_aria": "Søk etter stoppested eller adresse",
    "favorites.search_legend": "Søk etter stoppested eller adresse",
    "favorites.search_label": "Søk",
    "favorites.search_placeholder": "Søk etter stoppested eller adresse",
    "favorites.clear_search_aria": "Tøm søk",

    "favorites.recent": "Sist brukte",
    "favorites.suggestions": "Forslag",

    "favorites.save_title": "Adresse",
    "favorites.save_question": "Lagre adressen som favoritt?",
    "favorites.save_text":
      "Favoritter gir deg reiseforslag fra forsiden, og er enkle å finne igjen når du søker på en reise eller avgang.",
    "favorites.save_as": "Lagre som",
    "favorites.home": "Hjem",
    "favorites.work": "Jobb",
    "favorites.other": "Annet",

    heading_favorites_page: "Favoritter",

    /* --- Lagrede reiser (lagrede-reiser.html) --- */
    heading_saved_trips: "Lagrede reiser",
    "saved.empty_text":
      "Nå kan du lagre reisene du søker på. Har du lagret en reise, dukker den opp her.",

    /* =====================================
       BILLETT
       ===================================== */

    /* --- Billett – hovedside (billett.html) --- */
    heading_ticket: "Billett",

    "ticket.title_tab": "Billetter",
    "ticket.active_title": "Aktive billetter",
    "ticket.active_aria": "Aktive billetter",
    "ticket.dots_aria": "Billetter",
    "ticket.empty_active_heading": "Ingen aktive billetter",
    "ticket.empty_active_text": "Du har ingen gyldige billetter",

    "ticket.pickup_heading": "Hentekoder",

    "ticket.quick_heading": "Hurtigkjøp",
    "ticket.quick_see_all": "Se alle",
    "ticket.new_cta": "NY BILLETT",

    "ticket.sheet_grab_aria": "Dra",
    "ticket.sheet_title": "Velg billett",

    /* --- Billett – typevalg / steg i sheet --- */
    "ticket.panel_type_aria": "Velg billettype",
    "ticket.type_single": "Enkeltbillett",
    "ticket.type_period": "Periodebillett",

    "ticket.buy_others_title": "Kjøp til andre",
    "ticket.buy_others_sub": "Send billetten til en annen telefon",
    "ticket.other_tickets_heading": "Andre billetter",

    "ticket.panel_single_aria": "Velg enkeltbillett",
    "ticket.single_osf_title": "Enkeltbillett",
    "ticket.single_osf_sub": "For hele Østfold",
    "ticket.single_ng_title": "Enkeltbillett Nedre Glomma",
    "ticket.single_ng_sub": "For Sarpsborg og Fredrikstad",
    "ticket.single_ng_fritid_title": "Enkeltbillett fritid Nedre Glomma",
    "ticket.single_ng_fritid_sub":
      "Gyldig hverdager fra 17 og helg – kun buss",

    "ticket.panel_travelers_aria": "Velg reisende",
    "ticket.sub_choose_ticket": "VELG BILLETT",
    "ticket.sub_choose_travelers": "VELG REISENDE",
    "ticket.chosen_single_placeholder": "Enkeltbillett",
    "ticket.total_label": "Totalpris",

    "ticket.panel_summary_aria": "Oppsummering",
    "ticket.summary_title_placeholder": "Enkeltbillett",
    "ticket.summary_travelers_label": "Reisende",
    "ticket.summary_area_label": "Gyldig i",
    "ticket.summary_start_label": "Startdato",
    "ticket.summary_start_now": "Nå",
    "ticket.summary_payment_label": "Betalingsmåte",

    "ticket.disclaimer":
      "Gyldig kun på buss. For reisen gjelder Østfold kollektiv sine billettbetingelser og reisevilkår.",
    "ticket.confirm_purchase": "Bekreft kjøp",

    "ticket.panel_time_aria": "Endre starttidspunkt",
    "ticket.time_heading": "ENDRE STARTTIDSPUNKT",
    "ticket.time_now": "Nå",
    "ticket.time_confirm": "Bekreft",

    "ticket.panel_period_traveler_aria": "Velg reisende",
    "ticket.panel_period_products_aria": "Velg billett",
    "ticket.period_chosen_trav_placeholder": "Reisende",

    "ticket.panel_detail_aria": "Billetten din",
    "ticket.detail_start_prefix": "Starter —",
    "ticket.detail_end_prefix": "Gyldig til —",
    "ticket.detail_change_start": "Endre starttidspunkt",
    "ticket.detail_receipt": "Vis kvittering",
    "ticket.detail_notifications": "Endre varslinger",
    "ticket.detail_cancel": "Kanseller billetten",
    "ticket.detail_start_now": "Start nå",

    "ticket.panel_quick_all_aria": "Hurtigkjøp",
    "ticket.quick_all_heading": "Dine siste kjøp",

    "ticket.panel_buy_others_aria": "Kjøp til andre",
    "ticket.buy_others_heading": "Kjøp til andre",
    "ticket.buy_others_suggestions": "Forslag",

    // --- Dato / tidsvelger ---
    "date.today": "I dag",
    "date.tomorrow": "I morgen",
    "ticket.time_title": "Endre starttidspunkt",
    "ticket.time_limit_prefix": "Siste startmulighet er",

    // --- Reisende (enkelt- og periodebillett) ---
    "traveler.adult_label": "Voksen",
    "traveler.adult_sub": " ",
    "traveler.child_label": "Barn",
    "traveler.child_sub": "6–17 år. Under 6 år gratis",
    "traveler.senior_label": "Honnør",
    "traveler.senior_sub": "Fra 67 år / uføretrygd",
    "traveler.youth_label": "Ungdom",
    "traveler.youth_sub": "Under 20 år",
    "traveler.student_label": "Student",
    "traveler.student_sub": "Heltidsstudenter under 30 år",

    // --- Tidshjul ---
    "ticket.time_limit_prefix": "Siste startmulighet er",

    /* --- Billett – hentekode (hent-billett.html) --- */
    heading_get_ticket: "Hent billett",

    "ticket.enter_code": "Oppgi hentekode",
    "ticket.code_part1": "Første del",
    "ticket.code_part2": "Andre del",
    "ticket.code_part3": "Tredje del",
    "ticket.clear_code": "Tøm kode",
    "ticket.example": "Eksempel: F4-R5-6O7",
    "ticket.contact_text":
      "Ved problemer ta kontakt med Østfold kollektivtrafikk kundesenter på 69 12 54 80.",

    "ticket.panel_pickup_detail_aria": "Til henting",
    "ticket.pickup_detail_title": "Til henting",
    "ticket.pickup_detail_when_prefix": "Kjøpt —",
    "ticket.pickup_share": "Del",
    "ticket.pickup_cancel": "Kanseller",

    /* --- Billett – historikk (billett-historikk.html) --- */
    heading_ticket_history: "Billett­historikk",

    "history.title_tab": "Billett­historikk",
    "history.backlink": "Profil",
    "history.tab_receipts": "Kvitteringer",
    "history.tab_tickets": "Billetter",

    /* =====================================
       PROFIL
       ===================================== */

    /* --- Profil – hovedside (profil.html) --- */
    heading_profile: "Profil",

    "profile.guest_title": "Du er ikke logget inn",
    "profile.guest_text":
      "Logg inn eller opprett profil, så tar vi alltid vare på billettene dine",
    "profile.info_subtitle": "Informasjonen din",

    "profile.section_settings": "Innstillinger",
    "profile.section_tickets": "Billetter og betaling",
    "profile.section_travel": "Dine reiser",
    "profile.section_help": "Hjelp og informasjon",

    "profile.link_settings": "Innstillinger",
    "profile.link_ticket_history": "Billett­historikk",
    "profile.link_get_ticket": "Hent billett",
    "profile.link_payments": "Betalingsmåter",
    "profile.link_saved_trips": "Lagrede reiser",
    "profile.link_favorites": "Favoritter",
    "profile.link_help": "Hjelp og kontakt",

    "profile.btn_logout": "Logg ut",

    /* --- Profil – detaljer (profil-detaljer.html) --- */
    heading_profile_details: "Profil­detaljer",

    "profile.details_title_tab": "Profil – Informasjonen din",
    "profile.details_heading": "Informasjonen din",
    "profile.details_section_fields": "Profilfelter",
    "profile.field_name": "Navn",
    "profile.field_phone": "Telefonnummer",
    "profile.field_email": "E-post",

    /* --- Profil – endre navn / e-post / telefon --- */
    heading_change_name: "Endre navn",
    "profile.edit_name_title_tab": "Endre navn",
    "profile.edit_name_legend": "Skriv inn fullt navn",
    "profile.edit_first_label": "Fornavn",
    "profile.edit_last_label": "Etternavn",
    "profile.edit_first_placeholder": "Fornavn",
    "profile.edit_last_placeholder": "Etternavn",

    heading_change_email: "Endre e-post",
    "profile.edit_email_title_tab": "Endre e-post",
    "profile.edit_email_legend": "Skriv inn den nye e-posten din",
    "profile.edit_email_label": "E-post",
    "profile.edit_email_placeholder": "navn@domene.no",
    "profile.edit_email_submit": "Bekreft",

    heading_change_phone: "Endre telefon",
    "profile.edit_phone_title_tab": "Endre telefonnummer",
    "profile.edit_phone_legend": "Skriv inn nytt telefonnummer",
    "profile.edit_phone_label": "Telefon",
    "profile.edit_phone_placeholder": "+47 99 99 99 99",
    "profile.edit_phone_submit": "Bekreft",

    /* --- Profil – opprett profil (wizard: profil-oppretting.html) --- */
    heading_register: "Opprett profil",

    "signup.steps_aria": "Steg",
    "signup.step1_aria": "Steg 1 av 3",
    "signup.step2_aria": "Steg 2 av 3",
    "signup.step3_aria": "Steg 3 av 3",

    "signup.phone_legend": "Telefon",
    "signup.phone_label": "Telefonnummer",
    "signup.phone_placeholder": "+47 99 99 99 99",
    "signup.phone_hint":
      "Skriv norsk nummer. Både +47 99999999 og 99 99 99 99 er ok.",
    "signup.phone_error": "Ugyldig telefonnummer.",

    "signup.email_legend": "E-post",
    "signup.email_label": "E-post",
    "signup.email_placeholder": "navn@domene.no",
    "signup.email_error": "Ugyldig e-postadresse.",

    "signup.name_legend": "Navn",
    "signup.first_label": "Fornavn",
    "signup.last_label": "Etternavn",
    "signup.first_placeholder": "Fornavn",
    "signup.last_placeholder": "Etternavn",
    "signup.name_error": "Fyll inn både fornavn og etternavn.",

    "signup.submit": "Opprett profil",
    "signup.done_title": "Klar!",
    "signup.done_text":
      "Profilen din er opprettet. Du kan nå gå tilbake til profilsiden.",

    /* --- Profil – registrering enkeltsider (registrer.html / -epost / -navn) --- */
    "register.phone_title": "Profiloppretting",
    "register.phone_question": "Hei! Hva er nummeret ditt?",
    "register.phone_label": "Telefonnummer",
    "register.phone_helper":
      "Når du går videre, samtykker du til at vi kan bruke telefonnummeret til å logge deg inn.",
    "register.phone_privacy": "Les mer i personvernerklæringen",

    "register.name_question": "Hva heter du?",
    "register.first_name_label": "Fornavn",
    "register.last_name_label": "Etternavn",

    "register.email_question": "Hva er e-postadressen din?",
    "register.email_label": "E-postadresse",
    "register.email_placeholder": "eksempel@hotmail.com",
    "register.email_helper":
      "Når du går videre, samtykker du til at vi kan bruke e-postadressen til å sende kvitteringer.",

    /* --- Profil – innlogging (login.html) --- */
    heading_login: "Logg inn",

    "login.title": "Logg inn på Østfold Kollektiv",
    "login.text": "Logg inn for å lagre billettene dine",
    "login.error": "Feil e-post/telefon eller passord. Prøv igjen.",
    "login.label_username": "E-post eller telefonnummer",
    "login.label_password": "Passord",
    "login.no_account": "Har du ikke bruker?",
    "login.create_button": "Opprett ny bruker",
    "login.button": "Logg inn",

    /* --- Profil – glemt passord (glemt-passord.html) --- */
    heading_forgot_password: "Glemt passord?",

    "forgot.title": "Tilbakestill passord",
    "forgot.text":
      "Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.",
    "forgot.info":
      "Hvis e-postadressen finnes hos oss, sender vi en tilbakestillingslenke.",
    "forgot.email_label": "E-post",
    "forgot.submit": "Send tilbakestillingslenke",
    "forgot.remember": "Husk passordet likevel?",

    /* --- Profil – innstillinger (innstillinger.html) --- */
    heading_settings: "Innstillinger",

    settings_intro:
      "Tilpass appen til dine behov og få en mer personlig reiseopplevelse.",

    settings_section_travelsearch: "Reisesøk",
    settings_notifications: "Varslinger",
    settings_live_updates: "Oppdateringer i sanntid",
    settings_language: "Språk",
    settings_language_nb: "Norsk Bokmål",
    settings_language_en: "English",
    settings_pace: "Ditt tempo",
    settings_extra_transfer: "Ekstra tid ved overganger",

    "settings.title_tab": "Innstillinger",
    "settings.backlink": "Profil",
    "settings.heading": "Innstillinger",
    "settings.intro":
      "Tilpass appen til dine behov og få en mer personlig reiseopplevelse.",
    "settings.group_app": "Appinnstillinger",
    "settings.notifications": "Varslinger",
    "settings.realtime_updates": "Oppdateringer i sanntid",
    "settings.language_label": "Språk",
    "settings.language_value": "Norsk Bokmål",
    "settings.group_travel_search": "Reisesøk",
    "settings.travel_pace_label": "Ditt tempo",
    "settings.travel_pace_value": "Middels",
    "settings.extra_transfer_time_label": "Ekstra tid ved overganger",
    "settings.extra_transfer_time_value": "0 min",

    /* --- Profil – hjelp og kontakt (hjelp.html) --- */
    heading_help: "Hjelp og kontakt",
    help_section_help: "Hjelp",
    help_section_contact: "Kontakt",
    help_section_terms: "Vilkår og personvern",
    help_link_site: "Besøk ostfold-kollektiv.no",
    help_link_call: "Ring kundesenter",
    help_link_terms: "Vilkår og personvern",
    help_link_privacy: "Personvern for Østfold Kollektiv",

    /* --- Profil – betalingsmåter (betalingsmater.html) --- */
    heading_payments: "Betalingsmåter",
    "payments.title_tab": "Betalingsmåter",
    "payments.empty_text": "Du har ikke lagt til betalingsmåte.",
    "payments.add_btn": "Legg til",
    "payments.list_heading": "Dine betalingsmåter",
    "payments.remove_btn": "Fjern",
  },

  en: {
    /* =====================================
       GLOBAL / SHARED
       ===================================== */
    app_title: "Østfold Kollektiv",

    menu_travel: "Travel",
    menu_ticket: "Ticket",
    menu_profile: "Profile",

    "nav.travel": "Travel",
    "nav.ticket": "Ticket",
    "nav.profile": "Profile",

    aria_tab_travel: "Go to travel",
    aria_tab_ticket: "Go to ticket",
    aria_tab_profile: "Go to profile",
    aria_swap: "Swap from and to",

    "global.back": "Back",
    "global.next": "Next",
    "global.save": "Save",
    "global.cancel": "Cancel",
    "global.close": "Close",

    /* =====================================
       TRAVEL
       ===================================== */

    /* --- Travel – main / map / search --- */
    map_title: "Map",
    tab_find_journey: "Find journey",
    tab_departures: "Departures",

    label_from: "From",
    label_to: "To",
    ph_from_position: "Your location",
    ph_to_where: "Where are you going?",

    heading_results: "Suggested journeys",
    heading_departures: "Departures",
    heading_nearby: "Nearby",
    heading_favorites: "Favourites",
    btn_add_favorite: "+ Add new favourite",

    msg_no_departures: "No departures found",
    msg_no_journeys: "No journeys found for",

    /* --- Travel – favourites (favoritter.html) --- */
    "favorites.add_aria": "Add favourite",
    "favorites.empty_title": "No favourites yet",
    "favorites.empty_text":
      "Add places you travel to often or stops you use a lot, and use them as shortcuts in the app.",
    "favorites.addresses_title": "Addresses",
    "favorites.stops_title": "Stops",
    "favorites.add_title": "Add new favourite",

    "favorites.search_aria": "Search for stop or address",
    "favorites.search_legend": "Search for stop or address",
    "favorites.search_label": "Search",
    "favorites.search_placeholder": "Search for stop or address",
    "favorites.clear_search_aria": "Clear search",

    "favorites.recent": "Recent",
    "favorites.suggestions": "Suggestions",

    "favorites.save_title": "Address",
    "favorites.save_question": "Save this address as a favourite?",
    "favorites.save_text":
      "Favourites give you journey suggestions on the home screen and are easy to find when searching for journeys or departures.",
    "favorites.save_as": "Save as",
    "favorites.home": "Home",
    "favorites.work": "Work",
    "favorites.other": "Other",

    heading_favorites_page: "Favourites",

    /* --- Saved journeys (lagrede-reiser.html) --- */
    heading_saved_trips: "Saved journeys",
    "saved.empty_text":
      "You can now save the journeys you search for. Once you save a journey, it will appear here.",

    /* =====================================
       TICKETS
       ===================================== */

    /* --- Ticket – main (billett.html) --- */
    heading_ticket: "Ticket",

    "ticket.title_tab": "Tickets",
    "ticket.active_title": "Active tickets",
    "ticket.active_aria": "Active tickets",
    "ticket.dots_aria": "Tickets",
    "ticket.empty_active_heading": "No active tickets",
    "ticket.empty_active_text": "You have no valid tickets",

    "ticket.pickup_heading": "Pickup codes",

    "ticket.quick_heading": "Quick purchase",
    "ticket.quick_see_all": "See all",
    "ticket.new_cta": "NEW TICKET",

    "ticket.sheet_grab_aria": "Drag",
    "ticket.sheet_title": "Choose ticket",

    /* --- Ticket – type selection / steps --- */
    "ticket.panel_type_aria": "Choose ticket type",
    "ticket.type_single": "Single ticket",
    "ticket.type_period": "Period ticket",

    "ticket.buy_others_title": "Buy for others",
    "ticket.buy_others_sub": "Send the ticket to another phone",
    "ticket.other_tickets_heading": "Other tickets",

    "ticket.panel_single_aria": "Choose single ticket",
    "ticket.single_osf_title": "Single ticket",
    "ticket.single_osf_sub": "For all of Østfold",
    "ticket.single_ng_title": "Single ticket Nedre Glomma",
    "ticket.single_ng_sub": "For Sarpsborg and Fredrikstad",
    "ticket.single_ng_fritid_title": "Leisure single ticket Nedre Glomma",
    "ticket.single_ng_fritid_sub":
      "Valid weekdays from 17:00 and weekends – bus only",

    "ticket.panel_travelers_aria": "Choose travellers",
    "ticket.sub_choose_ticket": "CHOOSE TICKET",
    "ticket.sub_choose_travelers": "CHOOSE TRAVELLERS",
    "ticket.chosen_single_placeholder": "Single ticket",
    "ticket.total_label": "Total price",

    "ticket.panel_summary_aria": "Summary",
    "ticket.summary_title_placeholder": "Single ticket",
    "ticket.summary_travelers_label": "Travellers",
    "ticket.summary_area_label": "Valid in",
    "ticket.summary_start_label": "Start date",
    "ticket.summary_start_now": "Now",
    "ticket.summary_payment_label": "Payment method",

    "ticket.disclaimer":
      "Valid only on bus. Østfold public transport ticket terms and travel conditions apply.",
    "ticket.confirm_purchase": "Confirm purchase",

    "ticket.panel_time_aria": "Change start time",
    "ticket.time_heading": "CHANGE START TIME",
    "ticket.time_now": "Now",
    "ticket.time_confirm": "Confirm",

    "ticket.panel_period_traveler_aria": "Choose travellers",
    "ticket.panel_period_products_aria": "Choose ticket",
    "ticket.period_chosen_trav_placeholder": "Traveller",

    "ticket.panel_detail_aria": "Your ticket",
    "ticket.detail_start_prefix": "Starts —",
    "ticket.detail_end_prefix": "Valid until —",
    "ticket.detail_change_start": "Change start time",
    "ticket.detail_receipt": "Show receipt",
    "ticket.detail_notifications": "Change notifications",
    "ticket.detail_cancel": "Cancel ticket",
    "ticket.detail_start_now": "Start now",

    "ticket.panel_quick_all_aria": "Quick purchase",
    "ticket.quick_all_heading": "Your recent purchases",

    "ticket.panel_buy_others_aria": "Buy for others",
    "ticket.buy_others_heading": "Buy for others",
    "ticket.buy_others_suggestions": "Suggestions",

    // --- Date / time picker ---
    "date.today": "Today",
    "date.tomorrow": "Tomorrow",
    "ticket.time_title": "Change start time",
    "ticket.time_limit_prefix": "Last possible start time is",

    // --- Travellers (single & period tickets) ---
    "traveler.adult_label": "Adult",
    "traveler.adult_sub": " ",
    "traveler.child_label": "Child",
    "traveler.child_sub": "Age 6–17. Under 6 free",
    "traveler.senior_label": "Senior",
    "traveler.senior_sub": "From 67 years / disability pension",
    "traveler.youth_label": "Youth",
    "traveler.youth_sub": "Under 20 years",
    "traveler.student_label": "Student",
    "traveler.student_sub": "Full-time students under 30",

    /* --- Ticket – pickup code (hent-billett.html) --- */
    heading_get_ticket: "Retrieve ticket",

    "ticket.enter_code": "Enter pickup code",
    "ticket.code_part1": "First part",
    "ticket.code_part2": "Second part",
    "ticket.code_part3": "Third part",
    "ticket.clear_code": "Clear code",
    "ticket.example": "Example: F4-R5-6O7",
    "ticket.contact_text":
      "If you experience problems, contact Østfold Kollektiv customer service at 69 12 54 80.",

    "ticket.panel_pickup_detail_aria": "Ready for pickup",
    "ticket.pickup_detail_title": "Ready for pickup",
    "ticket.pickup_detail_when_prefix": "Bought —",
    "ticket.pickup_share": "Share",
    "ticket.pickup_cancel": "Cancel",

    /* --- Ticket – history (billett-historikk.html) --- */
    heading_ticket_history: "Ticket history",

    "history.title_tab": "Ticket history",
    "history.backlink": "Profile",
    "history.tab_receipts": "Receipts",
    "history.tab_tickets": "Tickets",

    /* =====================================
       PROFILE
       ===================================== */

    /* --- Profile – main (profil.html) --- */
    heading_profile: "Profile",

    "profile.guest_title": "You are not logged in",
    "profile.guest_text":
      "Log in or create a profile to always keep your tickets safe",
    "profile.info_subtitle": "Your information",

    "profile.section_settings": "Settings",
    "profile.section_tickets": "Tickets and payment",
    "profile.section_travel": "Your journeys",
    "profile.section_help": "Help and information",

    "profile.link_settings": "Settings",
    "profile.link_ticket_history": "Ticket history",
    "profile.link_get_ticket": "Retrieve ticket",
    "profile.link_payments": "Payment methods",
    "profile.link_saved_trips": "Saved journeys",
    "profile.link_favorites": "Favourites",
    "profile.link_help": "Help and contact",

    "profile.btn_logout": "Log out",

    /* --- Profile – details (profil-detaljer.html) --- */
    heading_profile_details: "Profile details",

    "profile.details_title_tab": "Profile – Your information",
    "profile.details_heading": "Your information",
    "profile.details_section_fields": "Profile fields",
    "profile.field_name": "Name",
    "profile.field_phone": "Phone number",
    "profile.field_email": "Email",

    /* --- Profile – edit name / email / phone --- */
    heading_change_name: "Change name",
    "profile.edit_name_title_tab": "Change name",
    "profile.edit_name_legend": "Enter your full name",
    "profile.edit_first_label": "First name",
    "profile.edit_last_label": "Last name",
    "profile.edit_first_placeholder": "First name",
    "profile.edit_last_placeholder": "Last name",

    heading_change_email: "Change email",
    "profile.edit_email_title_tab": "Change email",
    "profile.edit_email_legend": "Enter your new email address",
    "profile.edit_email_label": "Email",
    "profile.edit_email_placeholder": "name@example.com",
    "profile.edit_email_submit": "Confirm",

    heading_change_phone: "Change phone number",
    "profile.edit_phone_title_tab": "Change phone number",
    "profile.edit_phone_legend": "Enter your new phone number",
    "profile.edit_phone_label": "Phone",
    "profile.edit_phone_placeholder": "+47 99 99 99 99",
    "profile.edit_phone_submit": "Confirm",

    /* --- Profile – create profile wizard (profil-oppretting.html) --- */
    heading_register: "Create profile",

    "signup.steps_aria": "Steps",
    "signup.step1_aria": "Step 1 of 3",
    "signup.step2_aria": "Step 2 of 3",
    "signup.step3_aria": "Step 3 of 3",

    "signup.phone_legend": "Phone",
    "signup.phone_label": "Phone number",
    "signup.phone_placeholder": "+47 99 99 99 99",
    "signup.phone_hint":
      "Enter a Norwegian phone number. Both +47 99999999 and 99 99 99 99 are OK.",
    "signup.phone_error": "Invalid phone number.",

    "signup.email_legend": "Email",
    "signup.email_label": "Email",
    "signup.email_placeholder": "name@example.com",
    "signup.email_error": "Invalid email address.",

    "signup.name_legend": "Name",
    "signup.first_label": "First name",
    "signup.last_label": "Last name",
    "signup.first_placeholder": "First name",
    "signup.last_placeholder": "Last name",
    "signup.name_error": "Please fill in both first and last name.",

    "signup.submit": "Create profile",
    "signup.done_title": "All set!",
    "signup.done_text":
      "Your profile has been created. You can now go back to the profile page.",

    /* --- Profile – simple register pages (registrer.html / -epost / -navn) --- */
    "register.phone_title": "Create profile",
    "register.phone_question": "Hi! What is your phone number?",
    "register.phone_label": "Phone number",
    "register.phone_helper":
      "By continuing, you agree that we may use your phone number to log you in.",
    "register.phone_privacy": "Read more in the privacy policy",

    "register.name_question": "What is your name?",
    "register.first_name_label": "First name",
    "register.last_name_label": "Last name",

    "register.email_question": "What is your email address?",
    "register.email_label": "Email address",
    "register.email_placeholder": "example@hotmail.com",
    "register.email_helper":
      "By continuing, you agree that we may use your email address to send receipts.",

    /* --- Profile – login (login.html) --- */
    heading_login: "Log in",

    "login.title": "Log in to Østfold Kollektiv",
    "login.text": "Log in to save your tickets",
    "login.error": "Incorrect email/phone or password. Please try again.",
    "login.label_username": "Email or phone number",
    "login.label_password": "Password",
    "login.no_account": "Don't have an account?",
    "login.create_button": "Create new account",
    "login.button": "Log in",

    /* --- Profile – forgot password (glemt-passord.html) --- */
    heading_forgot_password: "Forgot password?",

    "forgot.title": "Reset password",
    "forgot.text":
      "Enter your email address and we’ll send you a link to reset your password.",
    "forgot.info":
      "If the email address exists in our system, we’ll send a reset link.",
    "forgot.email_label": "Email",
    "forgot.submit": "Send reset link",
    "forgot.remember": "Remember your password after all?",

    /* --- Profile – settings (innstillinger.html) --- */
    heading_settings: "Settings",

    settings_intro:
      "Adjust the app to your needs for a more personal travel experience.",
    settings_section_travelsearch: "Journey search",
    settings_notifications: "Notifications",
    settings_live_updates: "Live updates",
    settings_language: "Language",
    settings_language_nb: "Norwegian Bokmål",
    settings_language_en: "English",
    settings_pace: "Your walking pace",
    settings_extra_transfer: "Extra time for transfers",

    "settings.title_tab": "Settings",
    "settings.backlink": "Profile",
    "settings.heading": "Settings",
    "settings.intro":
      "Adjust the app to your needs for a more personal travel experience.",
    "settings.group_app": "App settings",
    "settings.notifications": "Notifications",
    "settings.realtime_updates": "Real-time updates",
    "settings.language_label": "Language",
    "settings.language_value": "English",
    "settings.group_travel_search": "Journey search",
    "settings.travel_pace_label": "Your walking speed",
    "settings.travel_pace_value": "Medium",
    "settings.extra_transfer_time_label": "Extra time for transfers",
    "settings.extra_transfer_time_value": "0 min",

    /* --- Profile – help and contact (hjelp.html) --- */
    heading_help: "Help and contact",
    help_section_help: "Help",
    help_section_contact: "Contact",
    help_section_terms: "Terms and privacy",
    help_link_site: "Visit ostfold-kollektiv.no",
    help_link_call: "Call customer service",
    help_link_terms: "Terms and privacy",
    help_link_privacy: "Privacy for Østfold Kollektiv",

    /* --- Profile – payments (betalingsmater.html) --- */
    heading_payments: "Payment methods",
    "payments.title_tab": "Payment methods",
    "payments.empty_text": "You have not added a payment method.",
    "payments.add_btn": "Add",
    "payments.list_heading": "Your payment methods",
    "payments.remove_btn": "Remove",
  }
};

// Legacy alias (hvis noe fortsatt leser STRINGS)
window.STRINGS = window.LANG;
