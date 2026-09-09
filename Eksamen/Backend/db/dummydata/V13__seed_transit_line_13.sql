-- =====================================================================
-- V13__seed_transit_line_13.sql
-- Dummydata: Linje 13 Blessom ↔ Sykehuset Østfold Kalnes
-- Idempotent og trygg å kjøre flere ganger.
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('13', 'Blessom–Sykehuset Østfold Kalnes')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Blessom snuplass'),
  ('Borg Bryggeri'),
  ('Sarpsborg stasjon'),
  ('Sarpsborg bussterminal'),
  ('Borgbygget'),
  ('Inspiria Science Center'),
  ('Sykehuset Østfold Kalnes')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge (OUTBOUND: Blessom -> Kalnes, INBOUND: Kalnes -> Blessom)
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='13')                     AS line_id,
    (SELECT id FROM stop WHERE name='Blessom snuplass')         AS s_blessom,
    (SELECT id FROM stop WHERE name='Borg Bryggeri')            AS s_borgbryg,
    (SELECT id FROM stop WHERE name='Sarpsborg stasjon')        AS s_stasjon,
    (SELECT id FROM stop WHERE name='Sarpsborg bussterminal')   AS s_bussterm,
    (SELECT id FROM stop WHERE name='Borgbygget')               AS s_borgbygget,
    (SELECT id FROM stop WHERE name='Inspiria Science Center')  AS s_inspiria,
    (SELECT id FROM stop WHERE name='Sykehuset Østfold Kalnes') AS s_kalnes
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Blessom → Kalnes
  SELECT i.line_id, 'OUTBOUND'::direction, 1, i.s_blessom   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            2, i.s_borgbryg  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            3, i.s_stasjon   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            4, i.s_bussterm  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            5, i.s_borgbygget FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            6, i.s_inspiria  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            7, i.s_kalnes    FROM ids i UNION ALL

  -- INBOUND: Kalnes → Blessom
  SELECT i.line_id, 'INBOUND'::direction,  1, i.s_kalnes    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             2, i.s_inspiria  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             3, i.s_borgbygget FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             4, i.s_bussterm  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             5, i.s_stasjon   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             6, i.s_borgbryg  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             7, i.s_blessom   FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Rydd bort tidligere seedede trips for linje 13
WITH l AS (SELECT id FROM line WHERE number='13')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line13_%'
);
WITH l AS (SELECT id FROM line WHERE number='13')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line13_%';

-- 3) OUTBOUND (Blessom → Kalnes): WKD/SAT/SUN
-- Base: 09:25, 16:25, 21:25 (3-min intervaller mellom 7 stopp)
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '09:25', '0925'),
    ('WKD',               TIME '16:25', '1625'),
    ('WKD',               TIME '21:25', '2125'),
    ('SAT',               TIME '09:25', '0925'),
    ('SAT',               TIME '16:25', '1625'),
    ('SAT',               TIME '21:25', '2125'),
    ('SUN',               TIME '09:25', '0925'),
    ('SUN',               TIME '16:25', '1625'),
    ('SUN',               TIME '21:25', '2125')
  ) v(service, base_time, tag)
),
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,3),(3,5),(4,10),(5,15),(6,16),(7,25)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='13'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Kalnes',
         FORMAT('seed_line13_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line13_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line13_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Kalnes → Blessom): WKD/SAT/SUN
-- Base: 09:55, 16:55, 21:55 (3-min intervaller)
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '09:55', '0955'),
    ('WKD',               TIME '16:55', '1655'),
    ('WKD',               TIME '21:55', '2155'),
    ('SAT',               TIME '09:55', '0955'),
    ('SAT',               TIME '16:55', '1655'),
    ('SAT',               TIME '21:55', '2155'),
    ('SUN',               TIME '09:55', '0955'),
    ('SUN',               TIME '16:55', '1655'),
    ('SUN',               TIME '21:55', '2155')
  ) v(service, base_time, tag)
),
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,3),(3,4),(4,14),(5,16),(6,20),(7,25)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='13'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Blessom',
         FORMAT('seed_line13_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line13_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line13_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='13' ORDER BY trip_id, seq;
