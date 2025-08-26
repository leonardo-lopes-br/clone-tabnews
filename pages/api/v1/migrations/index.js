import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let databaseClient;
  try {
    databaseClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
    });
    response.status(200).json(pendingMigrations);
  } finally {
    await databaseClient?.end();
  }
}

async function postHandler(request, response) {
  let databaseClient;
  try {
    databaseClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient: databaseClient,
    });
    const migratedMigrationsHaveRun = migratedMigrations.length > 0;
    if (migratedMigrationsHaveRun) {
      response.status(201).json(migratedMigrations);
    }
    response.status(200).json(migratedMigrations);
  } finally {
    await databaseClient?.end();
  }
}
