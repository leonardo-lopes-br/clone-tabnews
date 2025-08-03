import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const databaseClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: databaseClient,
    dir: join("infra", "migrations"),
    direction: "up",
    dryRun: true,
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  const httpMethod = request.method;

  if (httpMethod === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await databaseClient.end();
    return response.status(200).json(pendingMigrations);
  }
  if (httpMethod === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });
    await databaseClient.end();
    const migratedMigrationsHaveRun = migratedMigrations.length > 0;
    if (migratedMigrationsHaveRun) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}
