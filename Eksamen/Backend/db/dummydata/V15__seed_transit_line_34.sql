-- =====================================================================
-- V15__seed_transit_line_34.sql
-- Dummydata: Linje 34 Sykehuset ↔ Remmen
-- Idempotent og trygg å kjøre flere ganger.
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('34', 'Sykehuset–Remmen')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Halden bussterminal'),
  ('Fiskebrygga'),
  ('Kulturkvartalet'),
  ('Parken'),
  ('Snippen Halden'),
  ('Østre Lie'),
  ('Bjørklund'),
  ('Remmen Høgskolen'),
  ('Park Hotell'),
  ('Skofabrikken'),
  ('Stranda'),
  ('Bybrua Halden'),
  ('Borgergata'),
  ('Halden stasjon'),
  ('Halden politistasjon')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge (OUTBOUND: mot Remmen, INBOUND: mot Halden bussterminal)
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='34')                        AS line_id,
    (SELECT id FROM stop WHERE name='Halden bussterminal')         AS s_bussterm,
    (SELECT id FROM stop WHERE name='Fiskebrygga')                 AS s_fiskebrygga,
    (SELECT id FROM stop WHERE name='Kulturkvartalet')             AS s_kulturkvar,
    (SELECT id FROM stop WHERE name='Parken')                      AS s_parken,
    (SELECT id FROM stop WHERE name='Snippen Halden')              AS s_snippen,
    (SELECT id FROM stop WHERE name='Østre Lie')                   AS s_ostre_lie,
    (SELECT id FROM stop WHERE name='Bjørklund')                   AS s_bjorklund,
    (SELECT id FROM stop WHERE name='Remmen Høgskolen')            AS s_remmen,
    (SELECT id FROM stop WHERE name='Park Hotell')                 AS s_park_hotell,
    (SELECT id FROM stop WHERE name='Skofabrikken')                AS s_skofabrikken,
    (SELECT id FROM stop WHERE name='Stranda')                     AS s_stranda,
    (SELECT id FROM stop WHERE name='Bybrua Halden')               AS s_bybrua,
    (SELECT id FROM stop WHERE name='Borgergata')                  AS s_borgergata,
    (SELECT id FROM stop WHERE name='Halden stasjon')              AS s_stasjon,
    (SELECT id FROM stop WHERE name='Halden politistasjon')        AS s_politistasjon
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Halden bussterminal → Remmen Høgskolen → (rundtur tilbake via sentrum)
  SELECT i.line_id, 'OUTBOUND'::direction,  1,  i.s_bussterm      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             2,  i.s_fiskebrygga   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             3,  i.s_kulturkvar    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             4,  i.s_parken        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             5,  i.s_snippen       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             6,  i.s_ostre_lie     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             7,  i.s_bjorklund     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             8,  i.s_remmen        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             9,  i.s_park_hotell   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             10, i.s_skofabrikken  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             11, i.s_stranda       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             12, i.s_bybrua        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             13, i.s_borgergata    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             14, i.s_stasjon       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             15, i.s_bussterm      FROM ids i UNION ALL

  -- INBOUND: Remmen → Halden bussterminal (via politistasjonen)
  SELECT i.line_id, 'INBOUND'::direction,   1,  i.s_bussterm       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              2,  i.s_politistasjon  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              3,  i.s_fiskebrygga    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              4,  i.s_kulturkvar     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              5,  i.s_parken         FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              6,  i.s_snippen        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              7,  i.s_park_hotell    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              8,  i.s_remmen         FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              9,  i.s_bjorklund      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              10, i.s_ostre_lie      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              11, i.s_skofabrikken   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              12, i.s_stranda        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              13, i.s_stasjon        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              14, i.s_bussterm       FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Rydd bort tidligere seedede trips for linje 34
WITH l AS (SELECT id FROM line WHERE number='34')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line34_%'
);
WITH l AS (SELECT id FROM line WHERE number='34')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line34_%';

-- 3) OUTBOUND (mot Remmen): WKD/SAT/SUN – base 06:25, 15:25, 21:25
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:25', '0625'),
    ('WKD',               TIME '15:25', '1525'),
    ('WKD',               TIME '21:25', '2125'),
    ('SAT',               TIME '06:25', '0625'),
    ('SAT',               TIME '15:25', '1525'),
    ('SAT',               TIME '21:25', '2125'),
    ('SUN',               TIME '06:25', '0625'),
    ('SUN',               TIME '15:25', '1525'),
    ('SUN',               TIME '21:25', '2125')
  ) v(service, base_time, tag)
),
-- 15 stopp – jevne, forsiktige hopp (min): 0,2,4,6,9,12,15,18,21,24,28,31,34,37,40
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,2),(3,4),(4,6),(5,9),(6,12),(7,15),
    (8,18),(9,21),(10,24),(11,28),(12,31),(13,34),(14,37),(15,40)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='34'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Remmen',
         FORMAT('seed_line34_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line34_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line34_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (mot Halden bussterminal): WKD/SAT/SUN – base 06:25, 15:25, 21:25
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:25', '0625'),
    ('WKD',               TIME '15:25', '1525'),
    ('WKD',               TIME '21:25', '2125'),
    ('SAT',               TIME '06:25', '0625'),
    ('SAT',               TIME '15:25', '1525'),
    ('SAT',               TIME '21:25', '2125'),
    ('SUN',               TIME '06:25', '0625'),
    ('SUN',               TIME '15:25', '1525'),
    ('SUN',               TIME '21:25', '2125')
  ) v(service, base_time, tag)
),
-- 14 stopp – jevne hopp (min): 0,2,4,6,9,12,15,18,21,24,28,31,35,38
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,2),(3,4),(4,6),(5,9),(6,12),(7,15),
    (8,18),(9,21),(10,24),(11,28),(12,31),(13,35),(14,38)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='34'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Halden bussterminal',
         FORMAT('seed_line34_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line34_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line34_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='34' ORDER BY trip_id, seq;
