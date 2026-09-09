-- =====================================================================
-- V17__seed_transit_line_631.sql
-- Dummydata: Linje 631 Ørje ↔ Halden (via Aremark)
-- - Upsert av linje og stopp
-- - Korrekt rekkefølge OUTBOUND (Ørje→Halden) / INBOUND (Halden→Ørje)
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line631_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('631', 'Ørje–Halden via Aremark')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Ørje busstorg'),
  ('Marker skole'),
  ('Aremark kirke'),
  ('Aremark rådhus'),
  ('Fjell bru'),
  ('Turisten Aremarkveien'),
  ('Tistedalen'),
  ('Halden bussterminal'),
  ('Parken'),
  ('Tistedalveien'),
  ('Østensvik'),
  ('Aremark skole')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='631')                     AS line_id,
    (SELECT id FROM stop WHERE name='Ørje busstorg')             AS s_orje,
    (SELECT id FROM stop WHERE name='Marker skole')              AS s_marker_skole,
    (SELECT id FROM stop WHERE name='Aremark kirke')             AS s_aremark_kirke,
    (SELECT id FROM stop WHERE name='Aremark rådhus')            AS s_aremark_radhus,
    (SELECT id FROM stop WHERE name='Fjell bru')                 AS s_fjell_bru,
    (SELECT id FROM stop WHERE name='Turisten Aremarkveien')     AS s_turisten,
    (SELECT id FROM stop WHERE name='Tistedalen')                AS s_tistedalen,
    (SELECT id FROM stop WHERE name='Halden bussterminal')       AS s_halden_bt,
    (SELECT id FROM stop WHERE name='Parken')                    AS s_parken,
    (SELECT id FROM stop WHERE name='Tistedalveien')             AS s_tistedalveien,
    (SELECT id FROM stop WHERE name='Østensvik')                 AS s_ostensvik,
    (SELECT id FROM stop WHERE name='Aremark skole')             AS s_aremark_skole
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Ørje → Halden
  SELECT i.line_id, 'OUTBOUND'::direction, 1, i.s_orje            FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            2, i.s_marker_skole    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            3, i.s_aremark_kirke   FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            4, i.s_aremark_radhus  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            5, i.s_fjell_bru       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            6, i.s_turisten        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            7, i.s_tistedalen      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',            8, i.s_halden_bt       FROM ids i UNION ALL

  -- INBOUND: Halden → Ørje
  SELECT i.line_id, 'INBOUND'::direction,  1, i.s_halden_bt       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             2, i.s_parken          FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             3, i.s_tistedalveien   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             4, i.s_fjell_bru       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             5, i.s_ostensvik       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             6, i.s_aremark_radhus  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             7, i.s_aremark_skole   FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',             8, i.s_orje            FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 631
WITH l AS (SELECT id FROM line WHERE number='631')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line631_%'
);
WITH l AS (SELECT id FROM line WHERE number='631')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line631_%';

-- 3) OUTBOUND (Ørje → Halden): WKD/SAT/SUN
--    Base: 06:30, 14:30, 21:00 — lange etapper (min): 0,15,30,45,60,75,95,110
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:30', '0630'),
    ('WKD',               TIME '14:30', '1430'),
    ('WKD',               TIME '21:00', '2100'),
    ('SAT',               TIME '06:30', '0630'),
    ('SAT',               TIME '14:30', '1430'),
    ('SAT',               TIME '21:00', '2100'),
    ('SUN',               TIME '06:30', '0630'),
    ('SUN',               TIME '14:30', '1430'),
    ('SUN',               TIME '21:00', '2100')
  ) v(service, base_time, tag)
),
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,15),(3,30),(4,45),(5,60),(6,75),(7,95),(8,110)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='631'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Halden',
         FORMAT('seed_line631_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line631_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line631_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Halden → Ørje): WKD/SAT/SUN
--    Base: 06:30, 14:30, 21:00 — retur-etapper (min): 0,12,30,50,70,85,100,120
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '06:30', '0630'),
    ('WKD',               TIME '14:30', '1430'),
    ('WKD',               TIME '21:00', '2100'),
    ('SAT',               TIME '06:30', '0630'),
    ('SAT',               TIME '14:30', '1430'),
    ('SAT',               TIME '21:00', '2100'),
    ('SUN',               TIME '06:30', '0630'),
    ('SUN',               TIME '14:30', '1430'),
    ('SUN',               TIME '21:00', '2100')
  ) v(service, base_time, tag)
),
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,12),(3,30),(4,50),(5,70),(6,85),(7,100),(8,120)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='631'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Ørje',
         FORMAT('seed_line631_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line631_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line631_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='631' ORDER BY trip_id, seq;
