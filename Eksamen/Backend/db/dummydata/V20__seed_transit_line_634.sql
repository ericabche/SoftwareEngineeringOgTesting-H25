-- =====================================================================
-- V20__seed_transit_line_634.sql
-- Dummydata: Linje 634 Halden ↔ Rakkestad ↔ Mysen
-- - Upsert av linje og stopp
-- - Korrekt rekkefølge OUTBOUND (Halden→Mysen) / INBOUND (Mysen→Halden)
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line634_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('634', 'Halden–Rakkestad–Mysen')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Halden bussterminal'),
  ('Parken'),
  ('Brødløs nord'),
  ('Rahaugen'),
  ('Holene bru'),
  ('Vatvedt'),
  ('Degernes'),
  ('Kirkeng skole'),
  ('Bergenhuskrysset øst'),
  ('Rakkestad stasjon'),
  ('Eidsberg kirke'),
  ('Kirkefjerdingen skole'),
  ('Mysen stasjon'),
  ('Os'),
  ('Bybrua Halden')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='634')                    AS line_id,
    (SELECT id FROM stop WHERE name='Halden bussterminal')      AS s_halden_bt,
    (SELECT id FROM stop WHERE name='Parken')                   AS s_parken,
    (SELECT id FROM stop WHERE name='Brødløs nord')             AS s_brodlos,
    (SELECT id FROM stop WHERE name='Rahaugen')                 AS s_rahaugen,
    (SELECT id FROM stop WHERE name='Holene bru')               AS s_holene_bru,
    (SELECT id FROM stop WHERE name='Vatvedt')                  AS s_vatvedt,
    (SELECT id FROM stop WHERE name='Degernes')                 AS s_degernes,
    (SELECT id FROM stop WHERE name='Kirkeng skole')            AS s_kirkeng,
    (SELECT id FROM stop WHERE name='Bergenhuskrysset øst')     AS s_bergenhus_ost,
    (SELECT id FROM stop WHERE name='Rakkestad stasjon')        AS s_rakkestad,
    (SELECT id FROM stop WHERE name='Eidsberg kirke')           AS s_eidsberg,
    (SELECT id FROM stop WHERE name='Kirkefjerdingen skole')    AS s_kirkefjerdingen,
    (SELECT id FROM stop WHERE name='Mysen stasjon')            AS s_mysen,
    (SELECT id FROM stop WHERE name='Os')                       AS s_os,
    (SELECT id FROM stop WHERE name='Bybrua Halden')            AS s_bybrua
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Halden → Mysen
  SELECT i.line_id, 'OUTBOUND'::direction,  1,  i.s_halden_bt      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             2,  i.s_parken         FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             3,  i.s_brodlos        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             4,  i.s_rahaugen       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             5,  i.s_holene_bru     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             6,  i.s_vatvedt        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             7,  i.s_degernes       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             8,  i.s_kirkeng        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             9,  i.s_bergenhus_ost  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             10, i.s_rakkestad      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             11, i.s_eidsberg       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             12, i.s_kirkefjerdingen FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             13, i.s_mysen          FROM ids i UNION ALL

  -- INBOUND: Mysen → Halden
  SELECT i.line_id, 'INBOUND'::direction,   1,  i.s_mysen          FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              2,  i.s_kirkefjerdingen FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              3,  i.s_eidsberg       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              4,  i.s_os             FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              5,  i.s_rakkestad      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              6,  i.s_kirkeng        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              7,  i.s_degernes       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              8,  i.s_vatvedt        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              9,  i.s_holene_bru     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              10, i.s_rahaugen       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              11, i.s_brodlos        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              12, i.s_bybrua         FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              13, i.s_halden_bt      FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 634
WITH l AS (SELECT id FROM line WHERE number='634')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line634_%'
);
WITH l AS (SELECT id FROM line WHERE number='634')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line634_%';

-- 3) OUTBOUND (Halden → Mysen): WKD/SAT/SUN
--    Base: 06:00, 15:30, 20:00
--    Offsets (min, 13 stopp): 0,5,12,20,30,40,55,65,75,90,105,115,125
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:00', '0600'),
    ('WKD',               TIME '15:30', '1530'),
    ('WKD',               TIME '20:00', '2000'),
    ('SAT',               TIME '06:00', '0600'),
    ('SAT',               TIME '15:30', '1530'),
    ('SAT',               TIME '20:00', '2000'),
    ('SUN',               TIME '06:00', '0600'),
    ('SUN',               TIME '15:30', '1530'),
    ('SUN',               TIME '20:00', '2000')
  ) v(service, base_time, tag)
),
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,5),(3,12),(4,20),(5,30),(6,40),
    (7,55),(8,65),(9,75),(10,90),(11,105),(12,115),(13,125)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='634'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Mysen',
         FORMAT('seed_line634_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line634_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line634_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Mysen → Halden): WKD/SAT/SUN
--    Base: 06:00, 15:30, 20:00
--    Offsets (min, 13 stopp): 0,10,20,35,50,65,80,95,105,115,125,130,140
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:00', '0600'),
    ('WKD',               TIME '15:30', '1530'),
    ('WKD',               TIME '20:00', '2000'),
    ('SAT',               TIME '06:00', '0600'),
    ('SAT',               TIME '15:30', '1530'),
    ('SAT',               TIME '20:00', '2000'),
    ('SUN',               TIME '06:00', '0600'),
    ('SUN',               TIME '15:30', '1530'),
    ('SUN',               TIME '20:00', '2000')
  ) v(service, base_time, tag)
),
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,10),(3,20),(4,35),(5,50),(6,65),
    (7,80),(8,95),(9,105),(10,115),(11,125),(12,130),(13,140)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='634'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Halden',
         FORMAT('seed_line634_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line634_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line634_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='634' ORDER BY trip_id, seq;
