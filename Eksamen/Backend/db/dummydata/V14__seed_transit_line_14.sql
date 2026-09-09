-- =====================================================================
-- V14__seed_transit_line_14.sql
-- Dummydata: Linje 14 Rekustad ↔ Ise stasjon
-- - Upsert av linje og stopp
-- - Korrekt rekkefølge OUTBOUND / INBOUND
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line14_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('14', 'Rekustad–Ise stasjon')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Ise stasjon'),
  ('Hevingen'),
  ('Hafslund skole'),
  ('Sarpsborg bussterminal'),
  ('Borgbygget'),
  ('Greåkerdalen'),
  ('Greåker'),
  ('Rekustad skole'),
  ('Valaskjold bru'),
  ('Sarpsborg torg'),
  ('Haralds plass'),
  ('Byfogdløkka'),
  ('Borgermesterløkka')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='14')                   AS line_id,
    (SELECT id FROM stop WHERE name='Ise stasjon')            AS s_ise,
    (SELECT id FROM stop WHERE name='Hevingen')               AS s_hevingen,
    (SELECT id FROM stop WHERE name='Hafslund skole')         AS s_hafslund,
    (SELECT id FROM stop WHERE name='Sarpsborg bussterminal') AS s_bussterm,
    (SELECT id FROM stop WHERE name='Borgbygget')             AS s_borgbygget,
    (SELECT id FROM stop WHERE name='Greåkerdalen')           AS s_greakerdalen,
    (SELECT id FROM stop WHERE name='Greåker')                AS s_greaker,
    (SELECT id FROM stop WHERE name='Rekustad skole')         AS s_rekustad,
    (SELECT id FROM stop WHERE name='Valaskjold bru')         AS s_valaskjold,
    (SELECT id FROM stop WHERE name='Sarpsborg torg')         AS s_torg,
    (SELECT id FROM stop WHERE name='Haralds plass')          AS s_haralds,
    (SELECT id FROM stop WHERE name='Byfogdløkka')            AS s_byfogd,
    (SELECT id FROM stop WHERE name='Borgermesterløkka')      AS s_borgerm
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Ise stasjon -> Rekustad skole
  SELECT i.line_id, 'OUTBOUND'::direction, 1, i.s_ise           FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            2, i.s_hevingen      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            3, i.s_hafslund      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            4, i.s_bussterm      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            5, i.s_borgbygget    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            6, i.s_greakerdalen  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            7, i.s_greaker       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            8, i.s_rekustad      FROM ids i UNION ALL

  -- INBOUND: Rekustad skole -> Ise stasjon
  SELECT i.line_id, 'INBOUND'::direction,  1,  i.s_rekustad     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             2,  i.s_greaker      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             3,  i.s_greakerdalen FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             4,  i.s_borgbygget   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             5,  i.s_valaskjold   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             6,  i.s_bussterm     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             7,  i.s_torg         FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             8,  i.s_haralds      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             9,  i.s_byfogd       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             10, i.s_borgerm      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             11, i.s_hafslund     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             12, i.s_hevingen     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             13, i.s_ise          FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Rydd bort tidligere seedede trips for linje 14
WITH l AS (SELECT id FROM line WHERE number='14')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line14_%'
);
WITH l AS (SELECT id FROM line WHERE number='14')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line14_%';

-- 3) OUTBOUND (Ise -> Rekustad): WKD/SAT/SUN (06:30, 15:30, 21:30)
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:30', '0630'),
    ('WKD',               TIME '15:30', '1530'),
    ('WKD',               TIME '21:30', '2130'),
    ('SAT',               TIME '06:30', '0630'),
    ('SAT',               TIME '15:30', '1530'),
    ('SAT',               TIME '21:30', '2130'),
    ('SUN',               TIME '06:30', '0630'),
    ('SUN',               TIME '15:30', '1530'),
    ('SUN',               TIME '21:30', '2130')
  ) v(service, base_time, tag)
),
-- 8 stopp – realistiske mellomtider (min): 0,5,10,15,22,28,32,38
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,5),(3,10),(4,15),(5,22),(6,28),(7,32),(8,38)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='14'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Rekustad',
         FORMAT('seed_line14_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line14_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line14_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Rekustad -> Ise): WKD/SAT/SUN (06:45, 15:45, 21:45)
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:45', '0645'),
    ('WKD',               TIME '15:45', '1545'),
    ('WKD',               TIME '21:45', '2145'),
    ('SAT',               TIME '06:45', '0645'),
    ('SAT',               TIME '15:45', '1545'),
    ('SAT',               TIME '21:45', '2145'),
    ('SUN',               TIME '06:45', '0645'),
    ('SUN',               TIME '15:45', '1545'),
    ('SUN',               TIME '21:45', '2145')
  ) v(service, base_time, tag)
),
-- 13 stopp – realistiske mellomtider (min): 0,3,6,12,16,22,25,27,30,33,40,45,50
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,3),(3,6),(4,12),(5,16),(6,22),(7,25),
    (8,27),(9,30),(10,33),(11,40),(12,45),(13,50)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='14'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Ise stasjon',
         FORMAT('seed_line14_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line14_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line14_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='14' ORDER BY trip_id, seq;
