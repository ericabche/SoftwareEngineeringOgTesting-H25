-- =====================================================================
-- V9__seed_transit_line_1.sql
-- Dummydata for rute 1 Fredrikstad <-> Sarpsborg (ukedager, WKD).
-- Idempotent og trygg å kjøre flere ganger.
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('1', 'Fredrikstad–Sarpsborg')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Fredrikstad bussterminal'),
  ('Østfoldhallen'),
  ('Greåker'),
  ('AMFI Borg'),
  ('Torsbekken'),
  ('Sarpsborg bussterminal')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger (kun hvis mangler)
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='1')                          AS line_id,
    (SELECT id FROM stop WHERE name='Fredrikstad bussterminal')    AS s_fredrikstad,
    (SELECT id FROM stop WHERE name='Østfoldhallen')               AS s_ostfoldhallen,
    (SELECT id FROM stop WHERE name='Greåker')                     AS s_greaker,
    (SELECT id FROM stop WHERE name='AMFI Borg')                   AS s_amfi,
    (SELECT id FROM stop WHERE name='Torsbekken')                  AS s_torsbekken,
    (SELECT id FROM stop WHERE name='Sarpsborg bussterminal')      AS s_sarpsborg
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Fredrikstad -> Sarpsborg
  SELECT i.line_id, 'OUTBOUND'::direction AS dir, 1 AS seq, i.s_fredrikstad AS stop_id FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 2, i.s_ostfoldhallen FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 3, i.s_greaker       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 4, i.s_amfi          FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 5, i.s_torsbekken    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND', 6, i.s_sarpsborg     FROM ids i UNION ALL
  -- INBOUND: Sarpsborg -> Fredrikstad
  SELECT i.line_id, 'INBOUND', 1, i.s_sarpsborg     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 2, i.s_torsbekken    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 3, i.s_amfi          FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 4, i.s_greaker       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 5, i.s_ostfoldhallen FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND', 6, i.s_fredrikstad   FROM ids i
) x
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 1 (kun de vi lager i dette skriptet)
WITH l AS (SELECT id FROM line WHERE number='1')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id = (SELECT id FROM l) AND notes LIKE 'seed_line1_%'
);
WITH l AS (SELECT id FROM line WHERE number='1')
DELETE FROM trip WHERE line_id = (SELECT id FROM l) AND notes LIKE 'seed_line1_%';

-- 3) OUTBOUND (Fredrikstad -> Sarpsborg): morgen/ettermiddag/kveld for WKD
WITH
base_out AS (
  SELECT 'WKD'::service_day AS service, TIME '09:30' AS base_time, '0930' AS tag UNION ALL
  SELECT 'WKD',                                 TIME '16:30',      '1630' UNION ALL
  SELECT 'WKD',                                 TIME '21:30',      '2130'
),
off_out AS (SELECT * FROM (VALUES (1,0),(2,8),(3,13),(4,19),(5,24),(6,25)) v(seq,m)),
l AS (SELECT id FROM line WHERE number='1'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Sarpsborg',
         FORMAT('seed_line1_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
         WHERE FORMAT('seed_line1_OUT_%s_%s', bo.service::text, bo.tag) = t.notes)
         + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
         WHERE FORMAT('seed_line1_OUT_%s_%s', bo.service::text, bo.tag) = t.notes)
         + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Sarpsborg -> Fredrikstad): morgen/ettermiddag/kveld for WKD
WITH
base_in AS (
  SELECT 'WKD'::service_day AS service, TIME '09:30' AS base_time, '0930' AS tag UNION ALL
  SELECT 'WKD',                                 TIME '16:30',      '1630' UNION ALL
  SELECT 'WKD',                                 TIME '21:30',      '2130'
),
off_in  AS (SELECT * FROM (VALUES (1,0),(2,1),(3,6),(4,12),(5,17),(6,25)) v(seq,m)),
l AS (SELECT id FROM line WHERE number='1'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Fredrikstad',
         FORMAT('seed_line1_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
         WHERE FORMAT('seed_line1_IN_%s_%s', bi.service::text, bi.tag) = t.notes)
         + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
         WHERE FORMAT('seed_line1_IN_%s_%s', bi.service::text, bi.tag) = t.notes)
         + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
-- SET search_path TO transit, public;
-- SELECT * FROM vw_rutetider ORDER BY linje_nr, trip_id, seq LIMIT 120;
