CREATE TABLE IF NOT EXISTS saved_opportunities (
 opportunity_id CHAR(36) COLLATE utf8mb4_bin NOT NULL,
 user_id CHAR(36) COLLATE utf8mb4_bin NOT NULL,
 status VARCHAR(32) NOT NULL DEFAULT 'SAVED_FOR_LATER',
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (opportunity_id, user_id),
 CONSTRAINT saved_opportunities_opportunity_id_foreign FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
 CONSTRAINT saved_opportunities_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
INSERT INTO migrations (migration, batch)
SELECT '2026_10_23_000001_create_saved_opportunities', COALESCE(MAX(batch),0)+1 FROM migrations
HAVING NOT EXISTS (SELECT 1 FROM migrations WHERE migration='2026_10_23_000001_create_saved_opportunities');
