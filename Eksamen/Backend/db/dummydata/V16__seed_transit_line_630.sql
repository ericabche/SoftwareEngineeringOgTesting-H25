-- =====================================================================
-- V16__seed_transit_line_630.sql
-- Dummydata: Linje 630 Moss ↔ Halden (via Fredrikstad)
-- - Upsert av linje og stopp
-- - Korrekt rekkefølge OUTBOUND (Moss→Halden) / INBOUND (Halden→Moss)
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line630_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('630', 'Moss–Halden via Fredrikstad')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Moss bussterminal'),
  ('Halmstad Flyplassveien'),
  ('Karlshus'),
  ('Fredrikstad bussterminal'),
  ('Skjærviken'),
  ('Ingedal stasjon'),
  ('Svinesundsparken'),
  ('Remmen Høgskolen'),
  ('Halden bussterminal')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='630')                  AS line_id,
    (SELECT id FROM stop WHERE name='Moss bussterminal')      AS s_moss,
    (SELECT id FROM stop WHERE name='Halmstad Flyplassveien') AS s_halmstad,
    (SELECT id FROM stop WHERE name='Karlshus')               AS s_karlshus,
    (SELECT id FROM stop WHERE name='Fredrikstad bussterminal') AS s_fredrikstad,
    (SELECT id FROM stop WHERE name='Skjærviken')             AS s_skjaerviken,
    (SELECT id FROM stop WHERE name='Ingedal stasjon')        AS s_ingedal,
    (SELECT id FROM stop WHERE name='Svinesundsparken')       AS s_svinesund,
    (SELECT id FROM stop WHERE name='Remmen Høgskolen')       AS s_remmen,
    (SELECT id FROM stop WHERE name='Halden bussterminal')    AS s_halden
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Moss → Halden
  SELECT i.line_id, 'OUTBOUND'::direction, 1, i.s_moss        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            2, i.s_halmstad    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            3, i.s_karlshus    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            4, i.s_fredrikstad FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            5, i.s_skjaerviken FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            6, i.s_ingedal     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            7, i.s_svinesund   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            8, i.s_remmen      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            9, i.s_halden      FROM ids i UNION ALL

  -- INBOUND: Halden → Moss
  SELECT i.line_id, 'INBOUND'::direction,  1, i.s_halden      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             2, i.s_remmen      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             3, i.s_svinesund   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             4, i.s_ingedal     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             5, i.s_skjaerviken FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             6, i.s_fredrikstad FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             7, i.s_karlshus    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             8, i.s_halmstad    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             9, i.s_moss        FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 630
WITH l AS (SELECT id FROM line WHERE number='630')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line630_%'
);
WITH l AS (SELECT id FROM line WHERE number='630')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line630_%';

-- 3) OUTBOUND (Moss → Halden): WKD/SAT/SUN
--    Base: 06:00, 15:00, 21:00  (grove, realistiske avstander i minutter)
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:00', '0600'),
    ('WKD',               TIME '15:00', '1500'),
    ('WKD',               TIME '21:00', '2100'),
    ('SAT',               TIME '06:00', '0600'),
    ('SAT',               TIME '15:00', '1500'),
    ('SAT',               TIME '21:00', '2100'),
    ('SUN',               TIME '06:00', '0600'),
    ('SUN',               TIME '15:00', '1500'),
    ('SUN',               TIME '21:00', '2100')
  ) v(service, base_time, tag)
),
-- 9 stopp – ca. tidsbruk (min): 0,12,24,55,65,80,95,110,120
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,12),(3,24),(4,55),(5,65),(6,80),(7,95),(8,110),(9,120)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='630'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Halden',
         FORMAT('seed_line630_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line630_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line630_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Halden → Moss): WKD/SAT/SUN
--    Base: 06:00, 15:00, 21:00  (litt andre avstander i retur)
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:00', '0600'),
    ('WKD',               TIME '15:00', '1500'),
    ('WKD',               TIME '21:00', '2100'),
    ('SAT',               TIME '06:00', '0600'),
    ('SAT',               TIME '15:00', '1500'),
    ('SAT',               TIME '21:00', '2100'),
    ('SUN',               TIME '06:00', '0600'),
    ('SUN',               TIME '15:00', '1500'),
    ('SUN',               TIME '21:00', '2100')
  ) v(service, base_time, tag)
),
-- 9 stopp – ca. tidsbruk (min): 0,10,25,40,55,70,90,105,120
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,10),(3,25),(4,40),(5,55),(6,70),(7,90),(8,105),(9,120)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='630'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Moss',
         FORMAT('seed_line630_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line630_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line630_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='630' ORDER BY trip_id, seq;
