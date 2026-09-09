-- =====================================================================
-- V12__seed_transit_line_12.sql
-- Dummydata: Linje 12 Sandbakken ↔ Sykehuset Østfold Kalnes
-- Idempotent og trygg å kjøre flere ganger.
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('12', 'Sandbakken–Sykehuset Østfold Kalnes')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Sykehuset Østfold Kalnes'),
  ('Borgbygget'),
  ('Valaskjold bru'),
  ('Sarpsborg bussterminal'),
  ('Sarpsborg torg'),
  ('Haralds plass'),
  ('Byfogdløkka'),
  ('Borgermesterløkka'),
  ('Hafslund skole'),
  ('Edonbakken'),
  ('Moensletta'),
  ('Sandbakken skole'),
  ('Rokkeveien snuplass')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='12')                     AS line_id,
    (SELECT id FROM stop WHERE name='Sykehuset Østfold Kalnes') AS s_kalnes,
    (SELECT id FROM stop WHERE name='Borgbygget')               AS s_borgbygget,
    (SELECT id FROM stop WHERE name='Valaskjold bru')           AS s_valaskjold,
    (SELECT id FROM stop WHERE name='Sarpsborg bussterminal')   AS s_sarp_bussterm,
    (SELECT id FROM stop WHERE name='Sarpsborg torg')           AS s_sarp_torg,
    (SELECT id FROM stop WHERE name='Haralds plass')            AS s_haralds,
    (SELECT id FROM stop WHERE name='Byfogdløkka')              AS s_byfogd,
    (SELECT id FROM stop WHERE name='Borgermesterløkka')        AS s_borgerm,
    (SELECT id FROM stop WHERE name='Hafslund skole')           AS s_hafslund,
    (SELECT id FROM stop WHERE name='Edonbakken')               AS s_edon,
    (SELECT id FROM stop WHERE name='Moensletta')               AS s_moen,
    (SELECT id FROM stop WHERE name='Sandbakken skole')         AS s_sand_skol,
    (SELECT id FROM stop WHERE name='Rokkeveien snuplass')      AS s_rokke
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Kalnes -> Sandbakken
  SELECT i.line_id, 'OUTBOUND'::direction,  1, i.s_kalnes        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             2, i.s_borgbygget    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             3, i.s_valaskjold    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             4, i.s_sarp_bussterm FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             5, i.s_sarp_torg     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             6, i.s_haralds       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             7, i.s_byfogd        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             8, i.s_borgerm       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             9, i.s_hafslund      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            10, i.s_edon          FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            11, i.s_moen          FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            12, i.s_sand_skol     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            13, i.s_rokke         FROM ids i UNION ALL

  -- INBOUND: Sandbakken -> Kalnes (kortere retur)
  SELECT i.line_id, 'INBOUND'::direction,   1, i.s_rokke         FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              2, i.s_sand_skol     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              3, i.s_moen          FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              4, i.s_edon          FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              5, i.s_hafslund      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              6, i.s_sarp_bussterm FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              7, i.s_borgbygget    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              8, i.s_kalnes        FROM ids i
) AS x(line_id, dir, seq, stop_id)   -- ← gir kolonnenavn!
ON CONFLICT DO NOTHING;

-- 2) Rydd bort tidligere seedede trips for linje 12
WITH l AS (SELECT id FROM line WHERE number='12')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line12_%'
);
WITH l AS (SELECT id FROM line WHERE number='12')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line12_%';

-- 3) OUTBOUND (Kalnes -> Sandbakken): WKD/SAT/SUN 09:20, 16:20, 21:20
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '09:20', '0920'),
    ('WKD',               TIME '16:20', '1620'),
    ('WKD',               TIME '21:20', '2120'),
    ('SAT',               TIME '09:20', '0920'),
    ('SAT',               TIME '16:20', '1620'),
    ('SAT',               TIME '21:20', '2120'),
    ('SUN',               TIME '09:20', '0920'),
    ('SUN',               TIME '16:20', '1620'),
    ('SUN',               TIME '21:20', '2120')
  ) v(service, base_time, tag)
),
-- 13 stopp, 4-min intervaller
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,4),(3,8),(4,12),(5,16),(6,20),(7,24),
    (8,28),(9,32),(10,36),(11,40),(12,44),(13,48)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='12'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Sandbakken',
         FORMAT('seed_line12_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line12_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line12_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Sandbakken -> Kalnes): WKD/SAT/SUN 09:30, 16:30, 21:30
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '09:30', '0930'),
    ('WKD',               TIME '16:30', '1630'),
    ('WKD',               TIME '21:30', '2130'),
    ('SAT',               TIME '09:30', '0930'),
    ('SAT',               TIME '16:30', '1630'),
    ('SAT',               TIME '21:30', '2130'),
    ('SUN',               TIME '09:30', '0930'),
    ('SUN',               TIME '16:30', '1630'),
    ('SUN',               TIME '21:30', '2130')
  ) v(service, base_time, tag)
),
-- 8 stopp – litt lengre hopp mot slutten
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,5),(3,10),(4,15),(5,20),(6,27),(7,34),(8,42)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='12'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Kalnes',
         FORMAT('seed_line12_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line12_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line12_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='12' ORDER BY trip_id, seq;
