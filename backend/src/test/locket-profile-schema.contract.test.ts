import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const backendRoot = process.cwd();

describe('Locket + Profile schema contract', () => {
  it('keeps Prisma fields aligned with the API model', () => {
    const schema = readFileSync(resolve(backendRoot, 'prisma/schema.prisma'), 'utf8');

    expect(schema).toMatch(/bio\s+String\?\s+@db\.VarChar\(160\)/);
    expect(schema).toMatch(/dishName\s+String\s+@map\("dish_name"\) @db\.VarChar\(80\)/);
    expect(schema).toMatch(/restaurantName\s+String\?\s+@map\("restaurant_name"\) @db\.VarChar\(120\)/);
    expect(schema).toMatch(/note\s+String\?\s+@db\.VarChar\(280\)/);
    expect(schema).toMatch(/thumbnailUrl\s+String\?\s+@map\("thumbnail_url"\)/);
    expect(schema).toMatch(/imageWidth\s+Int\?\s+@map\("image_width"\)/);
    expect(schema).toMatch(/thumbnailBytes\s+Int\?\s+@map\("thumbnail_bytes"\)/);
    expect(schema).toMatch(/deletedAt\s+DateTime\?\s+@map\("deleted_at"\)/);
  });

  it('backfills required dish names before enforcing the constraint', () => {
    const migration = readFileSync(
      resolve(backendRoot, 'prisma/migrations/20260809_add_locket_profile_fields/migration.sql'),
      'utf8',
    );
    const backfillIndex = migration.indexOf("SET dish_name = 'Món ăn'");
    const notNullIndex = migration.indexOf('MODIFY COLUMN dish_name VARCHAR(80) NOT NULL');

    expect(backfillIndex).toBeGreaterThan(-1);
    expect(notNullIndex).toBeGreaterThan(backfillIndex);
    expect(migration).toContain('CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)');
  });

  it('persists normalized media paths and dimensions in the v5.2 migration', () => {
    const migration = readFileSync(
      resolve(backendRoot, 'prisma/migrations/20260809_add_locket_media_pipeline/migration.sql'),
      'utf8',
    );

    expect(migration).toContain('ADD COLUMN thumbnail_url VARCHAR(500)');
    expect(migration).toContain('ADD COLUMN image_width INT');
    expect(migration).toContain('ADD COLUMN image_height INT');
    expect(migration).toContain('ADD COLUMN image_bytes INT');
    expect(migration).toContain('ADD COLUMN thumbnail_bytes INT');
  });
});
