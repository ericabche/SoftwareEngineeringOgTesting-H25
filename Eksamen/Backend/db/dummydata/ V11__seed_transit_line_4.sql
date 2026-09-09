-- =====================================================================
-- V11__seed_transit_line_4.sql
-- Dummydata: Linje 4 Fredrikstad ↔ Kalnes (Sykehuset Østfold)
-- - Upsert linje og stopp
-- - Rekkefølge i begge retninger (OUTBOUND/INBOUND)
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line4_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('4', 'Fredrikstad–Kalnes')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Fredrikstad stasjon'),
  ('St. Croixhuset'),
  ('Nygata'),
  ('Fredrikstad bussterminal'),
  ('Østfoldhallen'),
  ('Greåker'),
  ('Hannestad øst'),
  ('Grålum skole'),
  ('Inspiria Science Center'),
  ('Skogholtet'),
  ('Sykehuset Østfold Kalnes')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge (OUTBOUND har Hannestad øst; INBOUND har Skogholtet)
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='4')                      AS line_id,
    (SELECT id FROM stop WHERE name='Fredrikstad stasjon')      AS s_stasjon,
    (SELECT id FROM stop WHERE name='St. Croixhuset')           AS s_croix,
    (SELECT id FROM stop WHERE name='Nygata')                   AS s_nygata,
    (SELECT id FROM stop WHERE name='Fredrikstad bussterminal') AS s_bussterm,
    (SELECT id FROM stop WHERE name='Østfoldhallen')            AS s_hallen,
    (SELECT id FROM stop WHERE name='Greåker')                  AS s_greaker,
    (SELECT id FROM stop WHERE name='Hannestad øst')            AS s_hannestad,
    (SELECT id FROM stop WHERE name='Grålum skole')             AS s_gralum,
    (SELECT id FROM stop WHERE name='Inspiria Science Center')  AS s_inspiria,
    (SELECT id FROM stop WHERE name='Skogholtet')               AS s_skogholtet,
    (SELECT id FROM stop WHERE name='Sykehuset Østfold Kalnes') AS s_kalnes
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Fredrikstad stasjon -> Kalnes
  SELECT i.line_id, 'OUTBOUND'::direction, 1,  i.s_stasjon   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            2,  i.s_croix     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            3,  i.s_nygata    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            4,  i.s_bussterm  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            5,  i.s_hallen    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            6,  i.s_greaker   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            7,  i.s_hannestad FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            8,  i.s_gralum    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            9,  i.s_inspiria  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            10, i.s_kalnes    FROM ids i UNION ALL

  -- INBOUND: Kalnes -> Fredrikstad stasjon (Skogholtet i stedet for Hannestad)
  SELECT i.line_id, 'INBOUND'::direction,  1,  i.s_kalnes     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             2,  i.s_inspiria   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             3,  i.s_gralum     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             4,  i.s_skogholtet FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             5,  i.s_greaker    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             6,  i.s_hallen     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             7,  i.s_bussterm   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             8,  i.s_nygata     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             9,  i.s_stasjon    FROM ids i
) AS x(line_id, dir, seq, stop_id)   -- Viktig: navngi kolonnene
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 4 (kun de vi lager her)
WITH l AS (SELECT id FROM line WHERE number='4')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line4_%'
);
WITH l AS (SELECT id FROM line WHERE number='4')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line4_%';

-- 3) OUTBOUND (Fredrikstad -> Kalnes): WKD/SAT/SUN kl 09:10, 16:10, 21:10
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '09:10', '0910'),
    ('WKD',               TIME '16:10', '1610'),
    ('WKD',               TIME '21:10', '2110'),
    ('SAT',               TIME '09:10', '0910'),
    ('SAT',               TIME '16:10', '1610'),
    ('SAT',               TIME '21:10', '2110'),
    ('SUN',               TIME '09:10', '0910'),
    ('SUN',               TIME '16:10', '1610'),
    ('SUN',               TIME '21:10', '2110')
  ) v(service, base_time, tag)
),
-- Kumulative minutter fra stasjon -> Kalnes: 0,1,3,5,13,18,23,28,29,35
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,1),(3,3),(4,5),(5,13),(6,18),(7,23),(8,28),(9,29),(10,35)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='4'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Kalnes',
         FORMAT('seed_line4_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
         WHERE FORMAT('seed_line4_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
         + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
         WHERE FORMAT('seed_line4_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
         + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Kalnes -> Fredrikstad): WKD/SAT/SUN kl 09:15, 16:15, 21:15
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '09:15', '0915'),
    ('WKD',               TIME '16:15', '1615'),
    ('WKD',               TIME '21:15', '2115'),
    ('SAT',               TIME '09:15', '0915'),
    ('SAT',               TIME '16:15', '1615'),
    ('SAT',               TIME '21:15', '2115'),
    ('SUN',               TIME '09:15', '0915'),
    ('SUN',               TIME '16:15', '1615'),
    ('SUN',               TIME '21:15', '2115')
  ) v(service, base_time, tag)
),
-- Kumulative minutter fra Kalnes -> stasjon: 0,4,5,10,15,19,30,32,35
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,4),(3,5),(4,10),(5,15),(6,19),(7,30),(8,32),(9,35)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='4'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Fredrikstad',
         FORMAT('seed_line4_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
         WHERE FORMAT('seed_line4_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
         + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
         WHERE FORMAT('seed_line4_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
         + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='4' ORDER BY trip_id, seq;
