-- =====================================================================
-- V10__seed_transit_line_2.sql
-- Dummydata: Linje 2 Fredrikstad ↔ Sarpsborg
-- - Upsert av linje og stopp
-- - Rekkefølge i begge retninger
-- - WKD/SAT/SUN med morgen (09:30), ettermiddag (16:30), kveld (21:30)
-- - Idempotent: sletter tidligere seedede trips (notes ~ 'seed_line2_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('2', 'Fredrikstad–Sarpsborg')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Fredrikstad bussterminal'),
  ('Brohodet øst'),
  ('Rakkestadsvingen'),
  ('Sellebakk/Begbyveien'),
  ('Moum'),
  ('Sundløkka E6'),
  ('Årum Handel'),
  ('Sarpsborg bussterminal')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger (kun hvis mangler)
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='2')                           AS line_id,
    (SELECT id FROM stop WHERE name='Fredrikstad bussterminal')     AS s_fredrikstad,
    (SELECT id FROM stop WHERE name='Brohodet øst')                 AS s_brohodet,
    (SELECT id FROM stop WHERE name='Rakkestadsvingen')             AS s_rakkestad,
    (SELECT id FROM stop WHERE name='Sellebakk/Begbyveien')         AS s_sellebakk,
    (SELECT id FROM stop WHERE name='Moum')                         AS s_moum,
    (SELECT id FROM stop WHERE name='Sundløkka E6')                 AS s_sundlokka,
    (SELECT id FROM stop WHERE name='Årum Handel')                  AS s_arum,
    (SELECT id FROM stop WHERE name='Sarpsborg bussterminal')       AS s_sarpsborg
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Fredrikstad -> Sarpsborg
  SELECT i.line_id, 'OUTBOUND'::direction AS dir, 1 AS seq, i.s_fredrikstad AS stop_id FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 2, i.s_brohodet   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 3, i.s_rakkestad  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 4, i.s_sellebakk  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 5, i.s_moum       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 6, i.s_sundlokka  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 7, i.s_arum       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 8, i.s_sarpsborg  FROM ids i UNION ALL
  -- INBOUND: Sarpsborg -> Fredrikstad
  SELECT i.line_id, 'INBOUND', 1, i.s_sarpsborg   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 2, i.s_arum        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 3, i.s_sundlokka   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 4, i.s_moum        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 5, i.s_sellebakk   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 6, i.s_rakkestad   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 7, i.s_brohodet    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 8, i.s_fredrikstad FROM ids i
) x
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 2 (kun de vi lager i dette skriptet)
WITH l AS (SELECT id FROM line WHERE number='2')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id = (SELECT id FROM l) AND notes LIKE 'seed_line2_%'
);
WITH l AS (SELECT id FROM line WHERE number='2')
DELETE FROM trip WHERE line_id = (SELECT id FROM l) AND notes LIKE 'seed_line2_%';

-- 3) Parametre for representative basetider
WITH
-- tre avganger pr service_day pr retning
base_out AS (
  -- Fredrikstad -> Sarpsborg
  SELECT 'WKD'::service_day AS service, 'OUTBOUND'::direction AS dir, TIME '09:30' AS base_time, '0930' AS tag UNION ALL
  SELECT 'WKD',              'OUTBOUND',                       TIME '16:30',      '1630' UNION ALL
  SELECT 'WKD',              'OUTBOUND',                       TIME '21:30',      '2130' UNION ALL
  SELECT 'SAT',              'OUTBOUND',                       TIME '09:30',      '0930' UNION ALL
  SELECT 'SAT',              'OUTBOUND',                       TIME '16:30',      '1630' UNION ALL
  SELECT 'SAT',              'OUTBOUND',                       TIME '21:30',      '2130' UNION ALL
  SELECT 'SUN',              'OUTBOUND',                       TIME '09:30',      '0930' UNION ALL
  SELECT 'SUN',              'OUTBOUND',                       TIME '16:30',      '1630' UNION ALL
  SELECT 'SUN',              'OUTBOUND',                       TIME '21:30',      '2130'
),
base_in AS (
  -- Sarpsborg -> Fredrikstad
  SELECT 'WKD'::service_day, 'INBOUND'::direction, TIME '09:30', '0930' UNION ALL
  SELECT 'WKD',              'INBOUND',            TIME '16:30', '1630' UNION ALL
  SELECT 'WKD',              'INBOUND',            TIME '21:30', '2130' UNION ALL
  SELECT 'SAT',              'INBOUND',            TIME '09:30', '0930' UNION ALL
  SELECT 'SAT',              'INBOUND',            TIME '16:30', '1630' UNION ALL
  SELECT 'SAT',              'INBOUND',            TIME '21:30', '2130' UNION ALL
  SELECT 'SUN',              'INBOUND',            TIME '09:30', '0930' UNION ALL
  SELECT 'SUN',              'INBOUND',            TIME '16:30', '1630' UNION ALL
  SELECT 'SUN',              'INBOUND',            TIME '21:30', '2130'
),
-- Enkle kumulative minuttforskyvninger per stopp (8 stopp, 6 min mellom)
off_out AS (SELECT * FROM (VALUES (1,0),(2,6),(3,12),(4,18),(5,24),(6,30),(7,36),(8,42)) v(seq,m)),
off_in  AS (SELECT * FROM (VALUES (1,0),(2,6),(3,12),(4,18),(5,24),(6,30),(7,36),(8,42)) v(seq,m)),
l AS (SELECT id FROM line WHERE number='2')

-- 4a) OUTBOUND-trips + stop_times (headsign: Sarpsborg)
, trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, b.dir, b.service, 'Sarpsborg',
         FORMAT('seed_line2_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo WHERE FORMAT('seed_line2_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo WHERE FORMAT('seed_line2_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4b) INBOUND-trips + stop_times (headsign: Fredrikstad)
WITH
base_in AS (
  -- Sarpsborg -> Fredrikstad (WKD, SAT, SUN; morgen/ettermiddag/kveld)
  SELECT 'WKD'::service_day AS service, 'INBOUND'::direction AS dir, TIME '09:30' AS base_time, '0930' AS tag UNION ALL
  SELECT 'WKD',              'INBOUND',                       TIME '16:30',      '1630' UNION ALL
  SELECT 'WKD',              'INBOUND',                       TIME '21:30',      '2130' UNION ALL
  SELECT 'SAT',              'INBOUND',                       TIME '09:30',      '0930' UNION ALL
  SELECT 'SAT',              'INBOUND',                       TIME '16:30',      '1630' UNION ALL
  SELECT 'SAT',              'INBOUND',                       TIME '21:30',      '2130' UNION ALL
  SELECT 'SUN',              'INBOUND',                       TIME '09:30',      '0930' UNION ALL
  SELECT 'SUN',              'INBOUND',                       TIME '16:30',      '1630' UNION ALL
  SELECT 'SUN',              'INBOUND',                       TIME '21:30',      '2130'
),
-- samme 6-minutters mønster (8 stopp)
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,6),(3,12),(4,18),(5,24),(6,30),(7,36),(8,42)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='2'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, b.dir, b.service, 'Fredrikstad',
         FORMAT('seed_line2_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
         WHERE FORMAT('seed_line2_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
         WHERE FORMAT('seed_line2_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;
