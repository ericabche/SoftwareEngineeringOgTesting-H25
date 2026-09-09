-- =====================================================================
-- V18__seed_transit_line_632.sql
-- Dummydata: Linje 632 Halden ↔ Sykehuset Østfold Kalnes
-- - Upsert av linje og stopp
-- - Korrekt rekkefølge OUTBOUND (Halden→Kalnes) / INBOUND (Kalnes→Halden)
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line632_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('632', 'Halden–Sykehuset Østfold Kalnes')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Halden bussterminal'),
  ('Svinesundsparken'),
  ('Quality Hotell'),
  ('Inspiria Science Center'),
  ('Sykehuset Østfold Kalnes'),
  ('Lekevollkrysset E6'),
  ('Borgergata')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='632')                        AS line_id,
    (SELECT id FROM stop WHERE name='Halden bussterminal')         AS s_halden_bt,
    (SELECT id FROM stop WHERE name='Svinesundsparken')            AS s_svinesund,
    (SELECT id FROM stop WHERE name='Quality Hotell')              AS s_quality,
    (SELECT id FROM stop WHERE name='Inspiria Science Center')     AS s_inspiria,
    (SELECT id FROM stop WHERE name='Sykehuset Østfold Kalnes')    AS s_kalnes,
    (SELECT id FROM stop WHERE name='Lekevollkrysset E6')          AS s_lekevoll,
    (SELECT id FROM stop WHERE name='Borgergata')                  AS s_borgergata
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Halden → Kalnes
  SELECT i.line_id, 'OUTBOUND'::direction, 1, i.s_halden_bt  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            2, i.s_svinesund  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            3, i.s_quality    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            4, i.s_inspiria   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            5, i.s_kalnes     FROM ids i UNION ALL

  -- INBOUND: Kalnes → Halden (via Lekevollkrysset, Svinesundsparken, Borgergata)
  SELECT i.line_id, 'INBOUND'::direction,  1, i.s_kalnes      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             2, i.s_lekevoll    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             3, i.s_svinesund   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             4, i.s_borgergata  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             5, i.s_halden_bt   FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede trips for linje 632
WITH l AS (SELECT id FROM line WHERE number='632')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line632_%'
);
WITH l AS (SELECT id FROM line WHERE number='632')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line632_%';

-- 3) OUTBOUND (Halden → Kalnes): WKD/SAT/SUN
--    Base: 06:00, 15:15, 21:00  | Offsets (min): 0,15,25,35,40
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:00', '0600'),
    ('WKD',               TIME '15:15', '1515'),
    ('WKD',               TIME '21:00', '2100'),
    ('SAT',               TIME '06:00', '0600'),
    ('SAT',               TIME '15:15', '1515'),
    ('SAT',               TIME '21:00', '2100'),
    ('SUN',               TIME '06:00', '0600'),
    ('SUN',               TIME '15:15', '1515'),
    ('SUN',               TIME '21:00', '2100')
  ) v(service, base_time, tag)
),
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,15),(3,25),(4,35),(5,40)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='632'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Kalnes',
         FORMAT('seed_line632_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line632_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line632_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Kalnes → Halden): WKD/SAT/SUN
--    Base: 06:00, 15:15, 21:00  | Offsets (min): 0,7,20,35,40
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:00', '0600'),
    ('WKD',               TIME '15:15', '1515'),
    ('WKD',               TIME '21:00', '2100'),
    ('SAT',               TIME '06:00', '0600'),
    ('SAT',               TIME '15:15', '1515'),
    ('SAT',               TIME '21:00', '2100'),
    ('SUN',               TIME '06:00', '0600'),
    ('SUN',               TIME '15:15', '1515'),
    ('SUN',               TIME '21:00', '2100')
  ) v(service, base_time, tag)
),
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,7),(3,20),(4,35),(5,40)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='632'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Halden',
         FORMAT('seed_line632_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line632_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line632_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='632' ORDER BY trip_id, seq;
