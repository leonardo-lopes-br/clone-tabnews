import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let databaseClient;
  try {
    databaseClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
    });
    return pendingMigrations;
  } finally {
    await databaseClient?.end();
  }
}

async function runPendingMigrations() {
  let databaseClient;
  try {
    databaseClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient: databaseClient,
    });
    return migratedMigrations;
  } finally {
    await databaseClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
