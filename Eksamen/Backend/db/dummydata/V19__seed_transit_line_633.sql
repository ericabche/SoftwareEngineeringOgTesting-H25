-- =====================================================================
-- V19__seed_transit_line_633.sql
-- Dummydata: Linje 633 Moss ↔ Sarpsborg ↔ Halden
-- - Upsert av linje og stopp
-- - Korrekt rekkefølge OUTBOUND (Moss→Halden) / INBOUND (Halden→Moss)
-- - WKD/SAT/SUN med morgen/ettermiddag/kveld
-- - Idempotent: fjerner kun tidligere seedede trips (notes ~ 'seed_line633_%')
-- =====================================================================

SET search_path TO transit, public;

-- 0) Linje + stopp (upsert)
INSERT INTO line (number, name)
VALUES ('633', 'Moss–Sarpsborg–Halden')
ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stop (name) VALUES
  ('Moss bussterminal'),
  ('Halmstad Flyplassveien'),
  ('Karlshus'),
  ('Sykehuset Østfold Kalnes'),
  ('Tune rådhus'),
  ('Sarpsborg bussterminal'),
  ('Hafslund skole'),
  ('Sandbakken skole'),
  ('Ingedal stasjon'),
  ('Svinesundsparken'),
  ('Remmen Høgskolen'),
  ('Halden bussterminal')
ON CONFLICT (name) DO NOTHING;

-- 1) Rekkefølge i begge retninger
WITH ids AS (
  SELECT
    (SELECT id FROM line WHERE number='633')                       AS line_id,
    (SELECT id FROM stop WHERE name='Moss bussterminal')           AS s_moss,
    (SELECT id FROM stop WHERE name='Halmstad Flyplassveien')      AS s_halmstad,
    (SELECT id FROM stop WHERE name='Karlshus')                    AS s_karlshus,
    (SELECT id FROM stop WHERE name='Sykehuset Østfold Kalnes')    AS s_kalnes,
    (SELECT id FROM stop WHERE name='Tune rådhus')                 AS s_tune,
    (SELECT id FROM stop WHERE name='Sarpsborg bussterminal')      AS s_sarpsborg_bt,
    (SELECT id FROM stop WHERE name='Hafslund skole')              AS s_hafslund,
    (SELECT id FROM stop WHERE name='Sandbakken skole')            AS s_sandbakken,
    (SELECT id FROM stop WHERE name='Ingedal stasjon')             AS s_ingedal,
    (SELECT id FROM stop WHERE name='Svinesundsparken')            AS s_svinesund,
    (SELECT id FROM stop WHERE name='Remmen Høgskolen')            AS s_remmen,
    (SELECT id FROM stop WHERE name='Halden bussterminal')         AS s_halden
)
INSERT INTO line_stop(line_id, direction, seq, stop_id)
SELECT line_id, dir, seq, stop_id
FROM (
  -- OUTBOUND: Moss → Halden
  SELECT i.line_id, 'OUTBOUND'::direction,  1,  i.s_moss          FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             2,  i.s_halmstad      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             3,  i.s_karlshus      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             4,  i.s_kalnes        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             5,  i.s_tune          FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             6,  i.s_sarpsborg_bt  FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             7,  i.s_hafslund      FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             8,  i.s_sandbakken    FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             9,  i.s_ingedal       FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             10, i.s_svinesund     FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             11, i.s_remmen        FROM ids i UNION ALL
  SELECT i.line_id, 'OUTBOUND',             12, i.s_halden        FROM ids i UNION ALL

  -- INBOUND: Halden → Moss
  SELECT i.line_id, 'INBOUND'::direction,   1,  i.s_halden        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              2,  i.s_remmen        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              3,  i.s_svinesund     FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              4,  i.s_ingedal       FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              5,  i.s_sandbakken    FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              6,  i.s_sarpsborg_bt  FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              7,  i.s_tune          FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              8,  i.s_kalnes        FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              9,  i.s_karlshus      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              10, i.s_halmstad      FROM ids i UNION ALL
  SELECT i.line_id, 'INBOUND',              11, i.s_moss          FROM ids i
) AS x(line_id, dir, seq, stop_id)
ON CONFLICT DO NOTHING;

-- 2) Fjern tidligere seedede turer for linje 633
WITH l AS (SELECT id FROM line WHERE number='633')
DELETE FROM stop_time WHERE trip_id IN (
  SELECT id FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line633_%'
);
WITH l AS (SELECT id FROM line WHERE number='633')
DELETE FROM trip WHERE line_id=(SELECT id FROM l) AND notes LIKE 'seed_line633_%';

-- 3) OUTBOUND (Moss → Halden): WKD/SAT/SUN
--    Base: 05:50, 15:00, 20:00
--    Offsets (min, 12 stopp): 0,10,20,45,55,65,75,90,105,120,135,150
WITH
base_out AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '05:50', '0550'),
    ('WKD',               TIME '15:00', '1500'),
    ('WKD',               TIME '20:00', '2000'),
    ('SAT',               TIME '05:50', '0550'),
    ('SAT',               TIME '15:00', '1500'),
    ('SAT',               TIME '20:00', '2000'),
    ('SUN',               TIME '05:50', '0550'),
    ('SUN',               TIME '15:00', '1500'),
    ('SUN',               TIME '20:00', '2000')
  ) v(service, base_time, tag)
),
off_out AS (
  SELECT * FROM (VALUES
    (1,0),(2,10),(3,20),(4,45),(5,55),(6,65),
    (7,75),(8,90),(9,105),(10,120),(11,135),(12,150)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='633'),
trips_out AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'OUTBOUND', b.service, 'Halden',
         FORMAT('seed_line633_OUT_%s_%s', b.service::text, b.tag)
  FROM l, base_out b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line633_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_out bo
        WHERE FORMAT('seed_line633_OUT_%s_%s', bo.service::text, bo.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_out t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='OUTBOUND'
JOIN off_out o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- 4) INBOUND (Halden → Moss): WKD/SAT/SUN
--    Base: 05:50, 15:00, 20:00
--    Offsets (min, 11 stopp): 0,12,27,42,57,72,85,100,120,135,155
WITH
base_in AS (
  SELECT * FROM (VALUES
    ('WKD'::service_day, TIME '05:50', '0550'),
    ('WKD',               TIME '15:00', '1500'),
    ('WKD',               TIME '20:00', '2000'),
    ('SAT',               TIME '05:50', '0550'),
    ('SAT',               TIME '15:00', '1500'),
    ('SAT',               TIME '20:00', '2000'),
    ('SUN',               TIME '05:50', '0550'),
    ('SUN',               TIME '15:00', '1500'),
    ('SUN',               TIME '20:00', '2000')
  ) v(service, base_time, tag)
),
off_in AS (
  SELECT * FROM (VALUES
    (1,0),(2,12),(3,27),(4,42),(5,57),(6,72),
    (7,85),(8,100),(9,120),(10,135),(11,155)
  ) v(seq,m)
),
l AS (SELECT id FROM line WHERE number='633'),
trips_in AS (
  INSERT INTO trip(line_id, direction, service, headsign, notes)
  SELECT l.id, 'INBOUND', b.service, 'Moss',
         FORMAT('seed_line633_IN_%s_%s', b.service::text, b.tag)
  FROM l, base_in b
  RETURNING id, notes
)
INSERT INTO stop_time(trip_id, stop_id, seq, arrival, departure)
SELECT t.id, ls.stop_id, ls.seq,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line633_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval,
       (SELECT base_time FROM base_in bi
        WHERE FORMAT('seed_line633_IN_%s_%s', bi.service::text, bi.tag)=t.notes)
       + (o.m || ' min')::interval
FROM trips_in t
JOIN line_stop ls ON ls.line_id=(SELECT id FROM l) AND ls.direction='INBOUND'
JOIN off_in  o    ON o.seq=ls.seq
ON CONFLICT DO NOTHING;

-- Verifisering:
--   SET search_path TO transit, public;
--   SELECT * FROM vw_rutetider WHERE linje_nr='633' ORDER BY trip_id, seq;
